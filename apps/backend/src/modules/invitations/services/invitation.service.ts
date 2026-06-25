import crypto from 'crypto';
import { getDatabase } from '../../../shared/database/connection';
import { logger } from '../../../shared/logger';
import { pushJob } from '../../../shared/queue';
import { SecurityService } from '../../../shared/security';
import { hashPassword } from '../../auth/services/auth.service';

export class InvitationService {
  /**
   * Generates a random secure token
   */
  private static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hashes a token for secure database storage
   */
  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Invites a new user
   */
  static async inviteUser(
    email: string,
    role: 'admin' | 'franchisor' | 'franchisee',
    invitedByUserId: string,
    invitedByRole: string,
    invitedByFranchiseId: string | null
  ) {
    const db = getDatabase();
    const sanitizedEmail = SecurityService.sanitizeEmail(email);

    // 1. RBAC Checks
    if (invitedByRole === 'franchisee') {
      throw { status: 403, message: 'Franchisees cannot invite users', code: 'FORBIDDEN' };
    }
    if (invitedByRole === 'franchisor' && role !== 'franchisee') {
      throw { status: 403, message: 'Franchisors can only invite franchisees', code: 'FORBIDDEN' };
    }
    if (invitedByRole === 'franchisor' && !invitedByFranchiseId) {
      throw { status: 400, message: 'Franchisor must belong to a franchise to invite', code: 'INVALID_STATE' };
    }

    // 2. Check if user already exists
    const existingUser = await db('users').where('email', sanitizedEmail).first();
    if (existingUser) {
      throw { status: 409, message: 'User already exists', code: 'USER_EXISTS' };
    }

    // 3. Generate token & hash
    const rawToken = this.generateToken();
    const tokenHash = this.hashToken(rawToken);

    // Set expiration (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Determine target franchise
    let targetFranchiseId = null;
    if (invitedByRole === 'franchisor') {
      targetFranchiseId = invitedByFranchiseId;
    } else if (invitedByRole === 'admin' && role === 'franchisor') {
      // If admin invites a franchisor, we'll assign franchise_id later when they accept, 
      // or we can create a placeholder franchise now. 
      // For ID13 simplicity, we'll let them create their own franchise upon acceptance, 
      // or we can just leave it null for now. 
      // Wait, let's create a franchise right now for them if they are a franchisor.
      // Or we can let them name it when they accept. Let's let them name it later, or create a placeholder.
      // Let's create a placeholder franchise.
      const [newFranchise] = await db('franchises').insert({ name: 'New Franchise' }).returning('id');
      targetFranchiseId = typeof newFranchise === 'object' && newFranchise !== null ? newFranchise.id : newFranchise;
    }

    // 4. Save to DB
    const [invitation] = await db('invitations')
      .insert({
        email: sanitizedEmail,
        role,
        franchise_id: targetFranchiseId,
        invited_by: invitedByUserId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        status: 'pending'
      })
      .returning('*');

    // 5. Send Email via Queue
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const inviteLink = `${frontendUrl}/auth/invite?token=${rawToken}`;
    
    // Log it for development
    logger.info(`[SIMULATED EMAIL] Invitation sent to ${sanitizedEmail}. Link: ${inviteLink}`);

    await pushJob('SEND_EMAIL', {
      to: sanitizedEmail,
      subject: 'You have been invited to AI Franchise',
      template: 'invitation',
      data: { inviteLink, role }
    }).catch(err => {
      logger.error('Failed to queue invitation email', err);
    });

    return {
      message: 'Invitation sent successfully',
      invitationId: invitation.id,
    };
  }

  /**
   * Retrieves invitation details by raw token
   */
  static async getInvitationDetails(rawToken: string) {
    const db = getDatabase();
    const tokenHash = this.hashToken(rawToken);

    const invitation = await db('invitations')
      .where('token_hash', tokenHash)
      .where('status', 'pending')
      .first();

    if (!invitation) {
      throw { status: 404, message: 'Invalid or expired invitation', code: 'INVALID_INVITE' };
    }

    if (new Date() > new Date(invitation.expires_at)) {
      await db('invitations').where('id', invitation.id).update({ status: 'expired' });
      throw { status: 400, message: 'Invitation has expired', code: 'EXPIRED_INVITE' };
    }

    return {
      email: invitation.email,
      role: invitation.role,
      franchise_id: invitation.franchise_id
    };
  }

  /**
   * Accepts an invitation and creates the user
   */
  static async acceptInvitation(
    rawToken: string,
    firstName: string,
    lastName: string,
    passwordRaw: string
  ) {
    const db = getDatabase();
    const tokenHash = this.hashToken(rawToken);

    let user: any;

    await db.transaction(async (trx) => {
      // 1. Find invitation
      const invitation = await trx('invitations')
        .where('token_hash', tokenHash)
        .where('status', 'pending')
        .first();

      if (!invitation) {
        throw { status: 404, message: 'Invalid or expired invitation', code: 'INVALID_INVITE' };
      }

      if (new Date() > new Date(invitation.expires_at)) {
        await trx('invitations').where('id', invitation.id).update({ status: 'expired' });
        throw { status: 400, message: 'Invitation has expired', code: 'EXPIRED_INVITE' };
      }

      // 2. Validate password
      const passwordValidation = SecurityService.validatePasswordStrength(passwordRaw);
      if (!passwordValidation.valid) {
        throw { status: 400, message: 'Weak password', code: 'WEAK_PASSWORD', details: passwordValidation.errors };
      }

      const passwordHash = await hashPassword(passwordRaw);
      const safeFirstName = SecurityService.sanitizeInput(firstName);
      const safeLastName = SecurityService.sanitizeInput(lastName);

      // 3. Create user
      const [insertResult] = await trx('users')
        .insert({
          email: invitation.email,
          password_hash: passwordHash,
          first_name: safeFirstName,
          last_name: safeLastName,
          role: invitation.role,
          franchise_id: invitation.franchise_id,
          is_active: true
        })
        .returning('id');

      const userId = typeof insertResult === 'object' && insertResult !== null ? insertResult.id : insertResult;
      user = await trx('users').where('id', userId).first();

      // 4. Mark invitation accepted
      await trx('invitations')
        .where('id', invitation.id)
        .update({
          status: 'accepted',
          accepted_at: new Date()
        });

      // 5. Audit log
      await trx('audit_logs').insert({
        user_id: user.id,
        action: 'INVITATION_ACCEPTED',
        entity_type: 'invitation',
        entity_id: invitation.id,
        details: { email: user.email }
      });
    });

    return user;
  }

  /**
   * List pending invitations
   */
  static async listInvitations(userRole: string, franchiseId: string | null) {
    const db = getDatabase();

    let query = db('invitations')
      .select('id', 'email', 'role', 'status', 'expires_at', 'created_at')
      .whereIn('status', ['pending', 'expired']);

    if (userRole === 'franchisor') {
      if (!franchiseId) return [];
      query = query.where('franchise_id', franchiseId);
    } else if (userRole === 'franchisee') {
      return [];
    }

    return await query.orderBy('created_at', 'desc');
  }
}
