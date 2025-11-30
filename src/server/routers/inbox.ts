import { z } from "zod";
import { router, publicProcedure } from "../trpc-core";
import { prisma } from "@/lib/prisma";
import { cleanupEmails, fetchEmails } from "@/lib/gmail";
import { classifyEmail } from "@/lib/openai";
import { TRPCError } from "@trpc/server";

export const inboxRouter = router({
  getStats: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
    
    const totalEmails = await prisma.email.count({ where: { userId: ctx.userId } });
    const cleaned = await prisma.email.count({ where: { userId: ctx.userId, cleaned: true } });
    const subscriptions = await prisma.subscription.count({ where: { userId: ctx.userId } });
    const spaceSaved = cleaned * 2; // Estimate 2MB per email

    return { totalEmails, cleaned, subscriptions, spaceSaved };
  }),

  getEmails: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return prisma.email.findMany({
        where: {
          userId: ctx.userId,
          ...(input.category && { category: input.category }),
          cleaned: false,
        },
        take: input.limit,
        orderBy: { date: "desc" },
      });
    }),

  cleanup: publicProcedure
    .input(
      z.object({
        emailIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return cleanupEmails(ctx.userId, input.emailIds);
    }),

  sync: publicProcedure
    .input(
      z.object({
        max: z.number().default(50),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const emails = await fetchEmails(ctx.userId, input.max);
      return { count: emails.length, emails };
    }),

  classify: publicProcedure
    .input(
      z.object({
        emailId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const email = await prisma.email.findUnique({
        where: { id: input.emailId },
      });

      if (!email) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Email not found" });
      }

      const category = await classifyEmail(
        email.subject || "",
        email.from || "",
        email.snippet || ""
      );

      return prisma.email.update({
        where: { id: input.emailId },
        data: { category },
      });
    }),
});
