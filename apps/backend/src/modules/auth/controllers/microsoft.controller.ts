import { Request, Response } from "express";
import { z } from "zod";
import { MicrosoftService } from "../services/microsoft.service";
import { logger } from "@shared/logger";

const MicrosoftCallbackSchema = z.object({
  code: z.string().min(1, "Authorization code required"),
  state: z.string().optional(),
});

export class MicrosoftController {
  static async microsoftCallback(req: Request, res: Response) {
    try {
      const { code } = MicrosoftCallbackSchema.parse(req.body);

      const result = await MicrosoftService.completeMicrosoftAuth(code);

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
      logger.error({ error }, "Microsoft callback error");

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
        error: error instanceof Error ? error.message : "Microsoft authentication failed",
        code: "MICROSOFT_AUTH_ERROR",
      });
    }
  }
}
