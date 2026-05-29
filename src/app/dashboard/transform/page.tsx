import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCreditBalance } from "@/lib/credits";
import type { StylePreset } from "@prisma/client";
import { TransformWorkspace } from "@/components/transform/transform-workspace";
import { STYLE_LABELS } from "@/lib/constants";
import { normalizeMediaUrl } from "@/lib/utils";

const STYLE_KEYS = Object.keys(STYLE_LABELS) as StylePreset[];

export const metadata = { title: "Transform" };

export default async function TransformPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; style?: string }>;
}) {
  const session = await auth();
  const userId = session!.user!.id;
  const { id, style: styleParam } = await searchParams;
  const initialStyle = STYLE_KEYS.includes(styleParam as StylePreset)
    ? (styleParam as StylePreset)
    : null;
  const credits = await getCreditBalance(userId);

  let generation = null;
  if (id) {
    const gen = await db.generation.findFirst({
      where: { id, userId },
    });
    if (gen) {
      const rootId = gen.parentId ?? gen.id;
      const versions = await db.generation.findMany({
        where: {
          OR: [{ id: rootId }, { parentId: rootId }],
          userId,
        },
        orderBy: { version: "asc" },
      });

      const root = versions.find((v) => v.id === rootId) ?? versions[0];
      const latest = versions[versions.length - 1] ?? gen;
      const latestWithResult = [...versions]
        .reverse()
        .find((v) => v.resultUrl && v.status === "COMPLETED");

      const active = latestWithResult ?? latest;

      generation = {
        id: active.id,
        rootId: root.id,
        originalUrl: normalizeMediaUrl(root.originalUrl),
        resultUrl: active.resultUrl
          ? normalizeMediaUrl(active.resultUrl)
          : active.resultUrl,
        status: active.status,
        errorMessage: active.errorMessage,
        category: root.category ?? active.category,
        analysisJson: (root.analysisJson ?? active.analysisJson) as {
          description?: string;
          elements?: string[];
          confidence?: number;
        } | null,
        recommendations: (root.recommendations ?? active.recommendations) as Array<{
          style: import("@prisma/client").StylePreset;
          reason: string;
          score: number;
        }> | null,
        qualityScore: active.qualityScore,
        style: active.style,
        versions: versions.map((v) => ({
          id: v.id,
          version: v.version,
          resultUrl: v.resultUrl,
          createdAt: v.createdAt.toISOString(),
        })),
      };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Transform
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Upload, analyze, and generate professional creative outputs
        </p>
      </div>
      <TransformWorkspace
        generation={generation}
        credits={credits}
        initialStyle={initialStyle}
      />
    </div>
  );
}
