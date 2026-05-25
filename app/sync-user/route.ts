import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db, users } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress;

  if (!email) {
    redirect("/");
  }

  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.fullName ||
    user.username ||
    null;

  await db
    .insert(users)
    .values({ email, name })
    .onConflictDoUpdate({
      target: users.email,
      set: { name },
    });

  redirect("/");
}
