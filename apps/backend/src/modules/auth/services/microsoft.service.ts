import { getDatabase } from "@shared/database/connection";
import { logger } from "@shared/logger";
import { generateTokenPair } from "./token.service";
import * as crypto from "crypto";

interface MicrosoftTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

interface MicrosoftUserInfo {
  id: string;
  userPrincipalName: string; // usually email
  mail?: string;
  displayName: string;
  givenName?: string;
  surname?: string;
}

export class MicrosoftService {
  static async exchangeCodeForTokens(code: string): Promise<MicrosoftTokenResponse> {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const redirectUri = process.env.MICROSOFT_CALLBACK_URL;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Microsoft OAuth credentials not configured");
    }

    try {
      const response = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
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
        logger.error({ error }, "Microsoft token exchange failed");
        throw new Error("Failed to exchange code for tokens");
      }

      return response.json() as Promise<MicrosoftTokenResponse>;
    } catch (err) {
      logger.error({ err }, "Microsoft OAuth error");
      throw new Error("Microsoft authentication failed");
    }
  }

  static async getUserInfo(accessToken: string): Promise<MicrosoftUserInfo> {
    try {
      const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile from Microsoft Graph");
      }

      const userInfo = await response.json() as MicrosoftUserInfo;
      return userInfo;
    } catch (err) {
      logger.error({ err }, "Failed to get Microsoft user profile");
      throw new Error("Invalid token");
    }
  }

  static async authenticateOrCreateUser(msUser: MicrosoftUserInfo) {
    const db = getDatabase();
    
    // Fallback logic for emails
    const email = (msUser.mail || msUser.userPrincipalName).toLowerCase();
    
    const [firstName, ...lastNameParts] = msUser.displayName.split(" ");
    const lastName = msUser.surname || lastNameParts.join(" ") || "User";

    try {
      let user = await db("users").where("email", email).first();

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
          details: { method: "microsoft_oauth" },
        });

        return user;
      }

      const newUserId = crypto.randomUUID();
      const newUser = {
        id: newUserId,
        email: email,
        first_name: msUser.givenName || firstName,
        last_name: lastName,
        password_hash: null, // No password for OAuth users
        role: "franchisee", // Default role
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
        details: { method: "microsoft_oauth" },
      });

      return newUser;
    } catch (err) {
      logger.error({ err }, "User authentication error");
      throw new Error("Authentication failed");
    }
  }

  static async completeMicrosoftAuth(code: string) {
    const tokens = await this.exchangeCodeForTokens(code);
    const msUser = await this.getUserInfo(tokens.access_token);
    const user = await this.authenticateOrCreateUser(msUser);

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
