import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;       // 128-bit IV for GCM
const AUTH_TAG_LENGTH = 16;  // 128-bit authentication tag
const KEY_LENGTH = 32;       // 256-bit key

/**
 * AES-256-GCM encryption service for storing sensitive credentials.
 * 
 * Usage:
 *   const encrypted = EncryptionService.encrypt('my-secret-token');
 *   const decrypted = EncryptionService.decrypt(encrypted);
 */
export class EncryptionService {
  private static getKey(): Buffer {
    const keyHex = process.env.ENCRYPTION_KEY;

    if (!keyHex || keyHex.length !== 64) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'ENCRYPTION_KEY must be set to a 64-character hex string (32 bytes) in production.'
        );
      }
      // Dev-only fallback — NOT secure, but allows local testing without config
      console.warn('⚠️  Using dev-only encryption key. Set ENCRYPTION_KEY in .env for production.');
      return Buffer.from('0123456789abcdef0123456789abcdef', 'hex').slice(0, KEY_LENGTH);
    }

    return Buffer.from(keyHex, 'hex');
  }

  /**
   * Encrypt a plaintext string using AES-256-GCM.
   * Returns a JSON string containing iv, authTag, and ciphertext (all hex-encoded).
   */
  static encrypt(plaintext: string): string {
    const key = this.getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      ciphertext: encrypted,
    });
  }

  /**
   * Decrypt an AES-256-GCM encrypted string.
   * Expects the JSON format produced by encrypt().
   */
  static decrypt(encryptedJson: string): string {
    const key = this.getKey();
    const { iv, authTag, ciphertext } = JSON.parse(encryptedJson);

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(iv, 'hex'),
      { authTagLength: AUTH_TAG_LENGTH }
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Check if a string looks like it was encrypted by this service.
   */
  static isEncrypted(value: string): boolean {
    try {
      const parsed = JSON.parse(value);
      return !!(parsed.iv && parsed.authTag && parsed.ciphertext);
    } catch {
      return false;
    }
  }
}
