"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectSchema, moveGenerationSchema } from "@/lib/validations";

export type ActionState = { error?: string; success?: boolean };

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createProjectFormAction(
  formData: FormData,
): Promise<void> {
  await createProjectAction({}, formData);
}

export async function createProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUser();
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  await db.project.create({
    data: {
      userId,
      name: parsed.data.name,
      description: parsed.data.description,
    },
  });

  revalidatePath("/dashboard/projects");
  return { success: true };
}

export async function renameProjectAction(
  projectId: string,
  name: string,
): Promise<ActionState> {
  const userId = await requireUser();
  const parsed = projectSchema.pick({ name: true }).safeParse({ name });
  if (!parsed.success) return { error: "Invalid name" };

  const project = await db.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) return { error: "Project not found" };

  await db.project.update({
    where: { id: projectId },
    data: { name: parsed.data.name },
  });

  revalidatePath("/dashboard/projects");
  return { success: true };
}

export async function deleteProjectAction(
  projectId: string,
): Promise<ActionState> {
  const userId = await requireUser();
  const project = await db.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) return { error: "Project not found" };

  await db.project.delete({ where: { id: projectId } });
  revalidatePath("/dashboard/projects");
  return { success: true };
}

export async function moveGenerationAction(
  generationId: string,
  projectId: string | null,
): Promise<ActionState> {
  const userId = await requireUser();
  const parsed = moveGenerationSchema.safeParse({ generationId, projectId });
  if (!parsed.success) return { error: "Invalid input" };

  const generation = await db.generation.findFirst({
    where: { id: generationId, userId },
  });
  if (!generation) return { error: "Generation not found" };

  if (projectId) {
    const project = await db.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) return { error: "Project not found" };
  }

  await db.generation.update({
    where: { id: generationId },
    data: { projectId },
  });

  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/projects");
  return { success: true };
}
