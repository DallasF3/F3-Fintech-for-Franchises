import { Request, Response } from "express";
import { z } from "zod";
import { GoogleService } from "../services/google.service";
import { logger } from "@shared/logger";

const GoogleCallbackSchema = z.object({
  code: z.string().min(1, "Authorization code required"),
  state: z.string().optional(),
});

export class GoogleController {
  static async googleCallback(req: Request, res: Response) {
    try {
      const { code } = GoogleCallbackSchema.parse(req.body);

      const result = await GoogleService.completeGoogleAuth(code);

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          accessTokenExpiry: result.accessTokenExpiry,
          refreshTokenExpiry: result.refreshTokenExpiry,
        },
      });
    } catch (error) {
      logger.error({ error }, "Google callback error");

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Invalid request",
          code: "VALIDATION_ERROR",
          details: error.flatten(),
        });
      }

      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Google authentication failed",
        code: "GOOGLE_AUTH_ERROR",
      });
    }
  }
}
