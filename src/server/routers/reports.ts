import { z } from "zod";
import { router, protectedProcedure } from "../trpc-core";
import { prisma } from "@/lib/prisma";
import { generateWeeklyReport } from "@/lib/utils";
import { TRPCError } from "@trpc/server";

export const reportsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
      }
      return await prisma.report.findMany({
        where: { userId: ctx.userId },
        orderBy: { weekStart: "desc" },
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to get reports",
      });
    }
  }),

  generate: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
    }
    const userId = ctx.userId;
    return generateWeeklyReport(userId);
  }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
      }
      return await prisma.report.findFirst({
        where: { userId: ctx.userId },
        orderBy: { weekStart: "desc" },
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to get latest report",
      });
    }
  }),
  // Removed publicProcedure duplicates to avoid undefined references
});
