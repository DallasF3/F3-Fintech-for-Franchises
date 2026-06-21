import { getDatabase } from "@shared/database/connection";
import { logger } from "@shared/logger";
import { generateTokenPair } from "./token.service";
import * as crypto from "crypto";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export class GoogleService {
  static async exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Google OAuth credentials not configured");
    }

    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }).toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        logger.error({ error }, "Google token exchange failed");
        throw new Error("Failed to exchange code for tokens");
      }

      return response.json() as Promise<GoogleTokenResponse>;
    } catch (err) {
      logger.error({ err }, "Google OAuth error");
      throw new Error("Google authentication failed");
    }
  }

  static async getUserInfo(idToken: string): Promise<GoogleUserInfo> {
    try {
      const parts = idToken.split(".");
      if (parts.length !== 3) throw new Error("Invalid JWT format");

      const decoded = Buffer.from(parts[1], "base64").toString("utf-8");
      const userInfo = JSON.parse(decoded) as GoogleUserInfo;

      if (!userInfo.email || !userInfo.email_verified) {
        throw new Error("Unverified email");
      }

      return userInfo;
    } catch (err) {
      logger.error({ err }, "Failed to decode Google ID token");
      throw new Error("Invalid token");
    }
  }

  static async authenticateOrCreateUser(googleUser: GoogleUserInfo) {
    const db = getDatabase();
    const [firstName, ...lastNameParts] = googleUser.name.split(" ");
    const lastName = lastNameParts.join(" ") || "User";

    try {
      let user = await db("users").where("email", googleUser.email).first();

      if (user) {
        await db("users")
          .where("id", user.id)
          .update({
            last_login_at: new Date(),
            updated_at: new Date(),
          });

        await db("audit_logs").insert({
          user_id: user.id,
          action: "LOGIN_SUCCESS",
          details: { method: "google_oauth" },
        });

        return user;
      }

      const newUserId = crypto.randomUUID();
      const newUser = {
        id: newUserId,
        email: googleUser.email,
        first_name: firstName,
        last_name: lastName,
        password_hash: null,
        role: "franchisee",
        is_active: true,
        mfa_enabled: false,
        mfa_secret: null,
        last_login_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      await db("users").insert(newUser);

      await db("audit_logs").insert({
        user_id: newUserId,
        action: "USER_REGISTRATION",
        details: { method: "google_oauth" },
      });

      return newUser;
    } catch (err) {
      logger.error({ err }, "User authentication error");
      throw new Error("Authentication failed");
    }
  }

  static async completeGoogleAuth(code: string) {
    const tokens = await this.exchangeCodeForTokens(code);
    const googleUser = await this.getUserInfo(tokens.id_token);
    const user = await this.authenticateOrCreateUser(googleUser);

    const tokenPair = await generateTokenPair(user.id, user.email, user.role, user.franchise_id);

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      ...tokenPair,
    };
  }
}
