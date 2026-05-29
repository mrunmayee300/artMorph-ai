import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createProjectFormAction } from "@/actions/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProjectList } from "@/components/projects/project-list";

export const metadata = { title: "Projects" };

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  const { q } = await searchParams;

  const projects = await db.project.findMany({
    where: {
      userId: session!.user!.id,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { generations: true } } },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Projects
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Organize your generations into projects
          </p>
        </div>
        <form method="get" className="flex gap-2">
          <Input
            name="q"
            placeholder="Search projects..."
            defaultValue={q}
            className="w-48 sm:w-64"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New project</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createProjectFormAction} className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Product concepts" />
            </div>
            <Button type="submit" className="sm:self-end">
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      <ProjectList
        projects={projects.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          generationCount: p._count.generations,
          updatedAt: p.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
