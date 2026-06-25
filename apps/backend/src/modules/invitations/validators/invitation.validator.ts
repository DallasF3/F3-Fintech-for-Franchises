import { z } from 'zod';

export const CreateInviteSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  role: z.enum(['admin', 'franchisor', 'franchisee'], {
    message: 'Role is required and must be valid',
  }),
});

export const AcceptInviteSchema = z.object({
  token: z.string().min(10, 'Invalid token'),
  first_name: z.string().min(1, 'First name is required').trim(),
  last_name: z.string().min(1, 'Last name is required').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type CreateInviteRequest = z.infer<typeof CreateInviteSchema>;
export type AcceptInviteRequest = z.infer<typeof AcceptInviteSchema>;
