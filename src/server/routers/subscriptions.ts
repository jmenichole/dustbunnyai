import { z } from "zod";
import { router, protectedProcedure } from "../trpc-core";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import {
  detectSubscriptions,
  findRecurringSubscriptions,
  calculateSubscriptionCosts,
} from "@/lib/subscriptions";

export const subscriptionsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return await prisma.subscription.findMany({
      where: { userId: ctx.userId },
      orderBy: { lastEmailDate: "desc" },
    });
  }),

  detect: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    try {
      const result = await detectSubscriptions(ctx.userId);
      return result;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to detect subscriptions",
      });
    }
  }),

  recurring: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    try {
      const recurring = await findRecurringSubscriptions(ctx.userId);
      return recurring;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to find recurring subscriptions",
      });
    }
  }),

  costs: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    try {
      const costs = await calculateSubscriptionCosts(ctx.userId);
      return costs;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to calculate subscription costs",
      });
    }
  }),

  unsubscribe: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return await prisma.subscription.update({
        where: { id: input.id, userId: ctx.userId },
        data: { unsubscribed: true },
      });
    }),
});
