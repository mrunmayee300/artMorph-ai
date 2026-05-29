import { db } from "@/lib/db";

export async function logAudit(params: {
  userId?: string;
  action: string;
  resource?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  await db.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      metadata: params.metadata
        ? JSON.parse(JSON.stringify(params.metadata))
        : undefined,
      ipAddress: params.ipAddress,
    },
  });
}
