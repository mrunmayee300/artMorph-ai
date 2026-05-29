"use client";

import { formatDistanceToNow } from "date-fns";
import { deleteProjectAction, renameProjectAction } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string | null;
  generationCount: number;
  updatedAt: string;
}

export function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <p className="text-sm text-neutral-600">No projects yet. Create one above.</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardContent className="p-5">
            <h3 className="font-medium">{project.name}</h3>
            {project.description && (
              <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
                {project.description}
              </p>
            )}
            <p className="mt-3 text-xs text-neutral-500">
              {project.generationCount} generations · Updated{" "}
              {formatDistanceToNow(new Date(project.updatedAt), {
                addSuffix: true,
              })}
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const name = prompt("New name", project.name);
                  if (!name) return;
                  const result = await renameProjectAction(project.id, name);
                  if (result.error) toast.error(result.error);
                  else window.location.reload();
                }}
              >
                Rename
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  if (!confirm("Delete this project?")) return;
                  const result = await deleteProjectAction(project.id);
                  if (result.error) toast.error(result.error);
                  else window.location.reload();
                }}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
