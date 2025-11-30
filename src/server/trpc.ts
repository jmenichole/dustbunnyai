import { router } from "./trpc-core";
import { inboxRouter } from "./routers/inbox";
import { privacyRouter } from "./routers/privacy";
import { subscriptionsRouter } from "./routers/subscriptions";
import { savingsRouter } from "./routers/savings";
import { reportsRouter } from "./routers/reports";

export const appRouter = router({
  inbox: inboxRouter,
  privacy: privacyRouter,
  subscriptions: subscriptionsRouter,
  savings: savingsRouter,
  reports: reportsRouter,
});

export type AppRouter = typeof appRouter;
