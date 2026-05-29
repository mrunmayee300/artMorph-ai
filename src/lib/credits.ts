import type { GenerationMode, TransactionType } from "@prisma/client";
import { CREDIT_COSTS } from "@/lib/constants";
import { db } from "@/lib/db";

export function getCreditCost(mode: GenerationMode): number {
  return CREDIT_COSTS[mode];
}

export async function getCreditBalance(userId: string): Promise<number> {
  const balance = await db.creditBalance.findUnique({
    where: { userId },
  });
  return balance?.balance ?? 0;
}

export async function hasEnoughCredits(
  userId: string,
  mode: GenerationMode,
): Promise<boolean> {
  const balance = await getCreditBalance(userId);
  return balance >= getCreditCost(mode);
}

export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await db.$transaction(async (tx) => {
    const balance = await tx.creditBalance.findUnique({
      where: { userId },
    });
    if (!balance || balance.balance < amount) {
      throw new Error("Insufficient credits");
    }
    await tx.creditBalance.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    });
    await tx.creditTransaction.create({
      data: {
        userId,
        amount: -amount,
        type: "DEBIT" satisfies TransactionType,
        description,
        metadata: metadata
          ? JSON.parse(JSON.stringify(metadata))
          : undefined,
      },
    });
  });
}

export async function grantCredits(
  userId: string,
  amount: number,
  type: TransactionType,
  description: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.creditBalance.upsert({
      where: { userId },
      create: { userId, balance: amount },
      update: { balance: { increment: amount } },
    });
    await tx.creditTransaction.create({
      data: {
        userId,
        amount,
        type,
        description,
        metadata: metadata
          ? JSON.parse(JSON.stringify(metadata))
          : undefined,
      },
    });
  });
}

export async function resetMonthlyCredits(
  userId: string,
  planCredits: number,
): Promise<void> {
  await db.$transaction(async (tx) => {
    const current = await tx.creditBalance.findUnique({
      where: { userId },
    });
    const previous = current?.balance ?? 0;
    await tx.creditBalance.upsert({
      where: { userId },
      create: { userId, balance: planCredits },
      update: { balance: planCredits },
    });
    await tx.creditTransaction.create({
      data: {
        userId,
        amount: planCredits - previous,
        type: "SUBSCRIPTION_GRANT",
        description: `Monthly credit allocation: ${planCredits} credits`,
      },
    });
  });
}
