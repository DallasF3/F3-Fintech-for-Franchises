import { Request, Response, NextFunction } from 'express';
import { InvitationService } from '../services/invitation.service';
import { CreateInviteRequest, AcceptInviteRequest } from '../validators/invitation.validator';
import { AuthUser } from '../../auth/services/auth.service';
import { generateTokenPair } from '../../auth/services/token.service';

export async function createInvitationHandler(
  req: Request<{}, {}, CreateInviteRequest>,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    if (!user || !user.userId) throw { status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' };

    const result = await InvitationService.inviteUser(
      req.body.email,
      req.body.role,
      user.userId,
      user.role,
      user.franchiseId || null
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getInvitationDetailsHandler(
  req: Request<{ token: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const details = await InvitationService.getInvitationDetails(req.params.token);
    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    next(error);
  }
}

export async function acceptInvitationHandler(
  req: Request<{}, {}, AcceptInviteRequest>,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await InvitationService.acceptInvitation(
      req.body.token,
      req.body.first_name,
      req.body.last_name,
      req.body.password
    );

    // Generate tokens for immediate login
    const tokens = await generateTokenPair(user.id, user.email, user.role, user.franchise_id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          franchise_id: user.franchise_id,
        },
        ...tokens
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listInvitationsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    if (!user || !user.userId) throw { status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' };

    const invitations = await InvitationService.listInvitations(user.role, user.franchiseId || null);

    res.status(200).json({
      success: true,
      data: { invitations },
    });
  } catch (error) {
    next(error);
  }
}
