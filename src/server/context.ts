import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getUserSession } from "@/app/auth/session";

export async function createContext(opts: FetchCreateContextFnOptions) {
  const user = await getUserSession();
  
  return {
    userId: user?.id || null,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
