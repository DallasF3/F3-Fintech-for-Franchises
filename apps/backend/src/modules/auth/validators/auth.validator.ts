import { z } from 'zod';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_SCHEMA = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const RegisterSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .regex(EMAIL_REGEX, 'Invalid email format'),
  password: PASSWORD_SCHEMA,
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be 100 characters or less')
    .trim(),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be 100 characters or less')
    .trim(),
  franchise_name: z
    .string()
    .min(2, 'Company/Franchise name is required')
    .max(100, 'Company/Franchise name must be 100 characters or less')
    .trim(),
});

export type RegisterRequest = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .regex(EMAIL_REGEX, 'Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;

export const LogoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type LogoutRequest = z.infer<typeof LogoutSchema>;

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .regex(EMAIL_REGEX, 'Invalid email format'),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: PASSWORD_SCHEMA,
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;

