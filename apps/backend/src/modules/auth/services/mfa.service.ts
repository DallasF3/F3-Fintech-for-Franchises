import * as speakeasy from 'speakeasy';
import crypto from 'crypto';

/**
 * Generates a new TOTP secret and otpauth URL
 */
export function generateSecret(email: string) {
  const secretInfo = speakeasy.generateSecret({
    name: `AI Franchise (${email})`,
    length: 20
  });
  
  return {
    secret: secretInfo.base32,
    otpauthUrl: secretInfo.otpauth_url || '',
  };
}

/**
 * Verifies a TOTP token against a secret
 */
export function verifyToken(token: string, secret: string): boolean {
  try {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1 // allows 1 step before/after for slight time sync issues
    });
  } catch (err) {
    return false;
  }
}

/**
 * Generates backup recovery codes
 */
export function generateRecoveryCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8 character random hex string
    const code = crypto.randomBytes(4).toString('hex');
    codes.push(code);
  }
  return codes;
}
