import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getUserSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user;
}

export async function requireAuth() {
  const user = await getUserSession();
  
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  return user;
}

// Helper to set user session
export async function setUserSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set("userId", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}
