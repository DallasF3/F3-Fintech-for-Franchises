import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { getDatabase } from '@shared/database/connection';
import { logger } from '@shared/logger';
import { SecurityService } from '@shared/security';
import * as MfaService from './mfa.service';
import { generateTokenPair, generateMfaToken, verifyMfaToken, TokenPair, revokeRefreshToken } from './token.service';
import { RegisterRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../validators/auth.validator';
import { pushJob } from '@shared/queue';

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  franchise_id?: string;
  is_active: boolean;
  mfa_enabled: boolean;
}

export interface RegisterResponse {
  user: AuthUser;
  tokens: TokenPair;
}

export interface LoginResponse {
  user: AuthUser;
  tokens?: TokenPair;
  requireMfa?: boolean;
  mfaToken?: string;
}

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const db = getDatabase();

  // Sanitize and validate inputs
  const email = SecurityService.sanitizeEmail(data.email);
  const firstName = SecurityService.sanitizeInput(data.first_name);
  const lastName = SecurityService.sanitizeInput(data.last_name);
  // data.franchise_name is required by schema, but handle gracefully if somehow missing in runtime type
  const franchiseName = SecurityService.sanitizeInput((data as any).franchise_name || `${firstName}'s Franchise`);

  if (!SecurityService.validateEmail(email)) {
    throw {
      status: 400,
      message: 'Invalid email format',
      code: 'INVALID_EMAIL',
    };
  }

  const passwordValidation = SecurityService.validatePasswordStrength(data.password);
  if (!passwordValidation.valid) {
    throw {
      status: 400,
      message: 'Password does not meet requirements',
      code: 'WEAK_PASSWORD',
      details: passwordValidation.errors,
    };
  }

  // Check if email already exists
  const existingUser = await db('users')
    .where('email', email)
    .first();

  if (existingUser) {
    throw {
      status: 409,
      message: 'Email already registered',
      code: 'EMAIL_ALREADY_EXISTS',
    };
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  let user: any;

  // Execute workspace creation in a transaction
  await db.transaction(async (trx) => {
    // 1. Create Franchise
    const [franchiseResult] = await trx('franchises')
      .insert({
        name: franchiseName,
      })
      .returning('id');
      
    const franchiseId = typeof franchiseResult === 'object' && franchiseResult !== null ? franchiseResult.id : franchiseResult;

    // 2. Create user as franchisor
    const [insertResult] = await trx('users')
      .insert({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        role: 'franchisor',
        franchise_id: franchiseId,
        is_active: true,
      })
      .returning('id');

    const userId = typeof insertResult === 'object' && insertResult !== null ? insertResult.id : insertResult;

    // Fetch the created user
    user = await trx('users').where('id', userId).first();

    if (!user) {
      throw {
        status: 500,
        message: 'Failed to create user',
        code: 'USER_CREATION_FAILED',
      };
    }

    // Create audit log
    await trx('audit_logs').insert({
      user_id: user.id,
      action: 'USER_REGISTRATION',
      entity_type: 'user',
      entity_id: user.id,
      details: { email: user.email, franchise_id: franchiseId },
    });
  });

  // Generate tokens (done outside transaction to avoid blocking DB pool)
  const tokens = await generateTokenPair(user.id, user.email, user.role, user.franchise_id);

  logger.info({ userId: user.id, email: user.email }, 'User registered successfully');

  // Push welcome email job to background queue
  await pushJob('SEND_EMAIL', {
    to: user.email,
    subject: 'Welcome to AI Franchise',
    template: 'welcome',
    data: { firstName: user.first_name }
  }).catch(err => {
    // We catch it so it doesn't fail the registration if queue is down
    logger.error('Failed to queue welcome email', err);
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      franchise_id: user.franchise_id,
      is_active: user.is_active,
      mfa_enabled: user.mfa_enabled,
    },
    tokens,
  };
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const db = getDatabase();

  // Sanitize and validate email
  const email = SecurityService.sanitizeEmail(data.email);
  if (!SecurityService.validateEmail(email)) {
    throw {
      status: 401,
      message: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS',
    };
  }

  // Find user by email
  const user = await db('users')
    .where('email', email)
    .first();

  if (!user) {
    // Log failed attempt for security (use sanitized email)
    await db('audit_logs').insert({
      action: 'LOGIN_FAILED',
      entity_type: 'auth',
      details: { email, reason: 'user_not_found' },
    });

    logger.warn({ email }, 'Login failed: user not found');

    throw {
      status: 401,
      message: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS',
    };
  }

  // Check if user is active
  if (!user.is_active) {
    await db('audit_logs').insert({
      user_id: user.id,
      action: 'LOGIN_FAILED',
      entity_type: 'auth',
      details: { reason: 'account_inactive' },
    });

    throw {
      status: 403,
      message: 'Account is inactive',
      code: 'ACCOUNT_INACTIVE',
    };
  }

  // Verify password
  const passwordValid = await comparePassword(data.password, user.password_hash);

  if (!passwordValid) {
    await db('audit_logs').insert({
      user_id: user.id,
      action: 'LOGIN_FAILED',
      entity_type: 'auth',
      details: { reason: 'invalid_password' },
    });

    logger.warn({ userId: user.id, email: user.email }, 'Login failed: invalid password');

    throw {
      status: 401,
      message: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS',
    };
  }

  // Check if MFA is enabled
  if (user.mfa_enabled) {
    // Generate MFA token for next step
    const mfaToken = generateMfaToken(user.id);
    logger.info({ userId: user.id }, 'MFA required for login');

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        franchise_id: user.franchise_id,
        is_active: user.is_active,
        mfa_enabled: user.mfa_enabled,
      },
      requireMfa: true,
      mfaToken,
    };
  }

  // Generate tokens
  const tokens = await generateTokenPair(user.id, user.email, user.role, user.franchise_id);

  // Update last login
  await db('users')
    .where('id', user.id)
    .update({
      last_login_at: new Date(),
    });

  // Create audit log
  await db('audit_logs').insert({
    user_id: user.id,
    action: 'LOGIN_SUCCESS',
    entity_type: 'auth',
  });

  logger.info({ userId: user.id, email: user.email }, 'User logged in successfully');

  return {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      franchise_id: user.franchise_id,
      is_active: user.is_active,
      mfa_enabled: user.mfa_enabled,
    },
    tokens,
  };
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  const db = getDatabase();
  const user = await db('users').where('id', userId).first();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    franchise_id: user.franchise_id,
    is_active: user.is_active,
    mfa_enabled: user.mfa_enabled,
  };
}

export async function requestPasswordReset(data: ForgotPasswordRequest): Promise<void> {
  const db = getDatabase();
  const email = SecurityService.sanitizeEmail(data.email);

  if (!SecurityService.validateEmail(email)) {
    throw { status: 400, message: 'Invalid email format', code: 'INVALID_EMAIL' };
  }

  const user = await db('users').where('email', email).first();

  if (!user || !user.is_active) {
    // Return success to prevent email enumeration
    return;
  }

  // Generate a secure random token
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  // Expiry in 1 hour
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await db('password_reset_tokens').insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  await db('audit_logs').insert({
    user_id: user.id,
    action: 'PASSWORD_RESET_REQUESTED',
    entity_type: 'user',
    entity_id: user.id,
  });

  // Since ID10 (Email Queue) is not implemented yet, log the URL to console
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
  logger.info({ userId: user.id }, `[MOCK EMAIL] Password reset requested. Link: ${resetUrl}`);
  console.log(`\n\n=== PASSWORD RESET LINK ===\n${resetUrl}\n===========================\n`);
}

export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  const db = getDatabase();
  
  const passwordValidation = SecurityService.validatePasswordStrength(data.password);
  if (!passwordValidation.valid) {
    throw {
      status: 400,
      message: 'Password does not meet requirements',
      code: 'WEAK_PASSWORD',
      details: passwordValidation.errors,
    };
  }

  const tokenHash = crypto.createHash('sha256').update(data.token).digest('hex');

  // Find valid token
  const resetToken = await db('password_reset_tokens')
    .where('token_hash', tokenHash)
    .whereNull('used_at')
    .where('expires_at', '>', new Date())
    .first();

  if (!resetToken) {
    throw {
      status: 400,
      message: 'Invalid or expired password reset link',
      code: 'INVALID_RESET_TOKEN',
    };
  }

  const passwordHash = await hashPassword(data.password);

  // Use a transaction for safety
  await db.transaction(async (trx) => {
    // Update user password
    await trx('users')
      .where('id', resetToken.user_id)
      .update({ password_hash: passwordHash });

    // Mark token as used
    await trx('password_reset_tokens')
      .where('id', resetToken.id)
      .update({ used_at: new Date() });

    // Revoke all existing refresh tokens for security
    await trx('refresh_tokens')
      .where('user_id', resetToken.user_id)
      .whereNull('revoked_at')
      .update({ revoked_at: new Date() });

    // Audit log
    await trx('audit_logs').insert({
      user_id: resetToken.user_id,
      action: 'PASSWORD_RESET_COMPLETED',
      entity_type: 'user',
      entity_id: resetToken.user_id,
    });
  });

  logger.info({ userId: resetToken.user_id }, 'Password reset successfully');
}

/**
 * Generates a new MFA secret and QR code URL for a user
 */
export async function setupMfa(userId: string) {
  const db = getDatabase();
  
  // Get user email
  const user = await db('users').select('email', 'mfa_enabled').where('id', userId).first();
  
  if (!user) {
    throw { status: 404, message: 'User not found', code: 'USER_NOT_FOUND' };
  }
  
  if (user.mfa_enabled) {
    throw { status: 400, message: 'MFA is already enabled', code: 'MFA_ALREADY_ENABLED' };
  }

  const { secret, otpauthUrl } = MfaService.generateSecret(user.email);

  // Save temporary secret to DB (do not enable yet)
  await db('users').where('id', userId).update({
    mfa_secret: secret
  });

  return {
    secret,
    otpauthUrl
  };
}

/**
 * Confirms MFA setup and generates recovery codes
 */
export async function confirmMfa(userId: string, token: string) {
  const db = getDatabase();
  
  const user = await db('users').select('mfa_secret', 'mfa_enabled').where('id', userId).first();
  
  if (!user) {
    throw { status: 404, message: 'User not found', code: 'USER_NOT_FOUND' };
  }

  if (user.mfa_enabled) {
    throw { status: 400, message: 'MFA is already enabled', code: 'MFA_ALREADY_ENABLED' };
  }

  if (!user.mfa_secret) {
    throw { status: 400, message: 'MFA setup not initiated', code: 'MFA_SETUP_REQUIRED' };
  }

  // Verify token
  const isValid = MfaService.verifyToken(token, user.mfa_secret);
  
  if (!isValid) {
    throw { status: 400, message: 'Invalid verification code', code: 'INVALID_MFA_CODE' };
  }

  // Generate recovery codes
  const recoveryCodes = MfaService.generateRecoveryCodes();

  // Enable MFA
  await db('users').where('id', userId).update({
    mfa_enabled: true,
    recovery_codes: recoveryCodes
  });

  // Log audit
  await db('audit_logs').insert({
    user_id: userId,
    action: 'MFA_ENABLED',
    entity_type: 'auth',
  });

  return {
    recoveryCodes
  };
}

/**
 * Verifies MFA during login flow
 */
export async function verifyMfaLogin(mfaToken: string, token: string) {
  const userId = verifyMfaToken(mfaToken);
  
  if (!userId) {
    throw { status: 401, message: 'Invalid or expired MFA token', code: 'INVALID_MFA_TOKEN' };
  }

  const db = getDatabase();
  const user = await db('users').where('id', userId).first();

  if (!user || !user.is_active || !user.mfa_enabled || !user.mfa_secret) {
    throw { status: 401, message: 'Invalid user or MFA state', code: 'INVALID_MFA_STATE' };
  }

  // Verify TOTP or Recovery Code
  let isValid = MfaService.verifyToken(token, user.mfa_secret);
  let usedRecoveryCode = false;

  if (!isValid && user.recovery_codes && user.recovery_codes.length > 0) {
    // Check if it's a recovery code
    const codeIndex = user.recovery_codes.indexOf(token);
    if (codeIndex !== -1) {
      isValid = true;
      usedRecoveryCode = true;
      
      // Remove used recovery code
      const newCodes = [...user.recovery_codes];
      newCodes.splice(codeIndex, 1);
      
      await db('users').where('id', userId).update({
        recovery_codes: newCodes
      });
    }
  }

  if (!isValid) {
    // Log failed attempt
    await db('audit_logs').insert({
      user_id: userId,
      action: 'LOGIN_FAILED',
      entity_type: 'auth',
      details: { reason: 'invalid_mfa_code' },
    });

    throw { status: 401, message: 'Invalid verification code', code: 'INVALID_MFA_CODE' };
  }

  // Generate full access tokens
  const tokens = await generateTokenPair(user.id, user.email, user.role, user.franchise_id);

  // Update last login
  await db('users').where('id', user.id).update({
    last_login_at: new Date(),
  });

  // Log success
  await db('audit_logs').insert({
    user_id: user.id,
    action: 'LOGIN_SUCCESS',
    entity_type: 'auth',
    details: { mfa_used: true, recovery_code_used: usedRecoveryCode }
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      franchise_id: user.franchise_id,
      is_active: user.is_active,
      mfa_enabled: user.mfa_enabled,
    },
    ...tokens,
  };
}
