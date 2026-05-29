"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { trackEvent } from "@/lib/analytics";
import { registerSchema } from "@/lib/validations";

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    },
  });

  await db.creditBalance.create({
    data: { userId: user.id, balance: 20 },
  });
  await db.subscription.create({
    data: { userId: user.id, plan: "FREE", status: "ACTIVE" },
  });
  await db.creditTransaction.create({
    data: {
      userId: user.id,
      amount: 20,
      type: "CREDIT",
      description: "Welcome bonus credits",
    },
  });

  await sendWelcomeEmail(user.email, parsed.data.name);
  await trackEvent("user_registered", { method: "credentials" }, user.id);

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    return { error: "Account created but sign-in failed" };
  }

  redirect("/dashboard");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }
  return { success: true };
}
