import * as crypto from "crypto";

const csrfStore = new Map<string, { ip: string, expires: number }>();
const CSRF_TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes
const CSRF_HEADER = "x-csrf-token";
const CSRF_COOKIE = "csrf-token";

export class SecurityService {
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static async storeCSRFToken(token: string, ipAddress?: string): Promise<void> {
    const expires = Date.now() + CSRF_TOKEN_EXPIRY;
    csrfStore.set(token, { ip: ipAddress || "", expires });
    
    // Cleanup expired tokens
    for (const [key, val] of csrfStore.entries()) {
      if (val.expires < Date.now()) csrfStore.delete(key);
    }
  }

  static async verifyCSRFToken(token: string, ipAddress?: string): Promise<boolean> {
    const stored = csrfStore.get(token);
    if (!stored) return false;
    
    if (stored.expires < Date.now()) {
      csrfStore.delete(token);
      return false;
    }

    const storedIp = stored.ip;
    if (ipAddress && storedIp !== ipAddress && ipAddress !== "unknown") {
      console.warn(`CSRF token IP mismatch: ${storedIp} vs ${ipAddress}`);
    }

    csrfStore.delete(token);
    return true;
  }

  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, "")
      .substring(0, 500);
  }

  static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) errors.push("Minimum 8 characters required");
    if (!/[A-Z]/.test(password)) errors.push("Uppercase letter required");
    if (!/[a-z]/.test(password)) errors.push("Lowercase letter required");
    if (!/[0-9]/.test(password)) errors.push("Number required");
    if (!/[!@#$%^&*]/.test(password)) errors.push("Special character required");

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static getClientIpAddress(req: any): string {
    return (
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.headers["x-real-ip"] ||
      req.socket?.remoteAddress ||
      "unknown"
    );
  }
}
