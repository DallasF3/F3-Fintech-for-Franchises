import bcrypt from 'bcrypt';
import { getDatabase } from '@shared/database/connection';
import { logger } from '@shared/logger';
import { generateTokenPair, TokenPair } from './token.service';
import { RegisterRequest, LoginRequest } from '../validators/auth.validator';

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

async function hashPassword(password: string): Promise<string> {
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

  // Check if email already exists
  const existingUser = await db('users')
    .where('email', data.email.toLowerCase())
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

  // Create user
  const [userId] = await db('users')
    .insert({
      email: data.email.toLowerCase(),
      password_hash: passwordHash,
      first_name: data.first_name,
      last_name: data.last_name,
      role: 'franchisee',
      is_active: true,
    })
    .returning('id');

  // Fetch the created user
  const user = await db('users').where('id', userId).first();

  if (!user) {
    throw {
      status: 500,
      message: 'Failed to create user',
      code: 'USER_CREATION_FAILED',
    };
  }

  // Generate tokens
  const tokens = await generateTokenPair(user.id, user.email, user.role, user.franchise_id);

  // Create audit log
  await db('audit_logs').insert({
    user_id: user.id,
    action: 'USER_REGISTRATION',
    entity_type: 'user',
    entity_id: user.id,
    details: { email: user.email },
  });

  logger.info({ userId: user.id, email: user.email }, 'User registered successfully');

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

  // Find user by email
  const user = await db('users')
    .where('email', data.email.toLowerCase())
    .first();

  if (!user) {
    // Log failed attempt for security
    await db('audit_logs').insert({
      action: 'LOGIN_FAILED',
      entity_type: 'auth',
      details: { email: data.email, reason: 'user_not_found' },
    });

    logger.warn({ email: data.email }, 'Login failed: user not found');

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
    // TODO: Generate MFA token for next step
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
      mfaToken: 'mfa-token-placeholder', // Will be implemented in ID5
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
