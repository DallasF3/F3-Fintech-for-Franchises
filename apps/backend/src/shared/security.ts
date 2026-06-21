import * as crypto from "crypto";
import { redisClient } from "./redis";

const CSRF_TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes
const CSRF_HEADER = "x-csrf-token";
const CSRF_COOKIE = "csrf-token";

export class SecurityService {
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static async storeCSRFToken(token: string, ipAddress?: string): Promise<void> {
    const key = `csrf:${token}`;
    try {
      if (redisClient) {
        await redisClient.setex(key, Math.floor(CSRF_TOKEN_EXPIRY / 1000), ipAddress || "");
      }
    } catch (error) {
      console.error("Failed to store CSRF token:", error);
    }
  }

  static async verifyCSRFToken(token: string, ipAddress?: string): Promise<boolean> {
    const key = `csrf:${token}`;
    try {
      if (!redisClient) return false;

      const storedIp = await redisClient.get(key);
      if (!storedIp) return false;

      // IP mismatch warning but allow (some proxies may change IP)
      if (ipAddress && storedIp !== ipAddress && ipAddress !== "unknown") {
        console.warn(`CSRF token IP mismatch: ${storedIp} vs ${ipAddress}`);
      }

      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error("Failed to verify CSRF token:", error);
      return false;
    }
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
      req.headers["x-rea