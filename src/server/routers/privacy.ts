import { z } from "zod";
import { router, protectedProcedure } from "../trpc-core";
import {
  scanUserPrivacy,
  scanEmailsForPII,
  getPrivacyScans,
  dismissPrivacyScan,
} from "@/lib/privacy-scan";
import { TRPCError } from "@trpc/server";

export const privacyRouter = router({
  scans: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
      }
      return await getPrivacyScans(ctx.userId);
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to get privacy scans",
      });
    }
  }),

  scanBreaches: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
      }
      const result = await scanUserPrivacy(ctx.userId);
      return result;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to scan for breaches",
      });
    }
  }),

  scanPII: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
      }
      const result = await scanEmailsForPII(ctx.userId);
      return result;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to scan for PII",
      });
    }
  }),

  dismiss: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.userId) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
        }
        return await dismissPrivacyScan(input.id, ctx.userId);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to dismiss scan",
        });
      }
    }),
});
