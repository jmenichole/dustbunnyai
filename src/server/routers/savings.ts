import { z } from "zod";
import { router, publicProcedure } from "../trpc-core";
import { getSavingsRecommendations, analyzeFreeTrials } from "@/lib/savings";

export const savingsRouter = router({
  getRecommendations: publicProcedure.query(async () => {
    // TODO: Get userId from context
    const userId = "placeholder";

    return getSavingsRecommendations(userId);
  }),

  getFreeTrials: publicProcedure.query(async () => {
    // TODO: Get userId from context
    const userId = "placeholder";

    return analyzeFreeTrials(userId);
  }),
});
