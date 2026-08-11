"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type Project = {
  id: string;
  brand_id: string;
  name: string;
  description: string | null;
  product_type: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type DesignBrief = {
  id: string;
  project_id: string;
  concept: string;
  desired_colors: string[];
  pattern_direction: string | null;
  mood: string | null;
  special_instructions: string | null;
  number_of_concepts: number;
  created_at: string;
};

type Asset = {
  id: string;
  brand_id: string;
  project_id: string | null;
  file_name: string;
  storage_bucket: string;
  storage_path: string;
  asset_type: string;
  analysis_result: Record<string, unknown> | null;
  created_at: string;
};

export default function CollectionReviewPage() {
  const params = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const projectId = params.projectId;
  const briefId = searchParams.get("briefId");

  const [project, setProject] = useState<Project | null>(null);
  const [brief, setBrief] = useState<DesignBrief | null>(null);
  const [moodboards, setMoodboards] = useState<Asset[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      setLoadError("API base URL is not configured.");
      setIsLoading(false);
      return;
    }

    if (!briefId) {
      setLoadError("Design brief ID is missing.");
      setIsLoading(false);
      return;
    }

    async function loadReviewData() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const [projectResponse, briefResponse, assetsResponse] =
          await Promise.all([
            fetch(`${apiBaseUrl}/projects/${projectId}`),

            fetch(`${apiBaseUrl}/briefs/${briefId}`),

            fetch(
              `${apiBaseUrl}/projects/${projectId}/assets?asset_type=moodboard`,
            ),
          ]);

        if (!projectResponse.ok) {
          throw new Error("Failed to load project.");
        }

        if (!briefResponse.ok) {
          throw new Error("Failed to load design brief.");
        }

        if (!assetsResponse.ok) {
          throw new Error("Failed to load moodboard assets.");
        }

        const projectData =
          (await projectResponse.json()) as Project;

        const briefData =
          (await briefResponse.json()) as DesignBrief;

        const assetsData =
          (await assetsResponse.json()) as Asset[];

        setProject(projectData);
        setBrief(briefData);
        setMoodboards(assetsData);
      } catch {
        setLoadError(
          "Unable to load the collection review. Please check the backend and try again.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadReviewData();
  }, [projectId, briefId]);

  function handleBack() {
    router.push(`/collections/${projectId}/brief`);
  }

  function handleGenerate() {
    // Generation endpoint will be connected in the next phase.
    console.log("Generate collection", {
      projectId,
      briefId,
    });
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-zinc-600">
            Loading collection review...
          </p>
        </div>
      </main>
    );
  }

  if (loadError || !project || !brief) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-900">
              Unable to load review
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {loadError ?? "Required collection data is missing."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <p className="text-sm text-zinc-500">
            Collection 4 of 4
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
            Review Collection
          </h1>

          <p className="mt-3 text-zinc-600">
            Review the creative direction before generating concepts.
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 p-8">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Collection
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-zinc-900">
              {project.name}
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              Bathroom · Bath Mat
            </p>
          </div>

          <div className="space-y-8 p-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Collection Concept
              </p>

              <p className="mt-2 leading-7 text-zinc-900">
                {brief.concept}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Color Direction
              </p>

              {brief.desired_colors.length === 0 ? (
                <p className="mt-2 text-sm text-zinc-500">
                  No specific colors selected.
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-3">
                  {brief.desired_colors.map((color) => (
                    <div
                      key={color}
                      className="flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-2"
                    >
                      <span
                        className="h-6 w-6 rounded-full border border-zinc-200"
                        style={{ backgroundColor: color }}
                      />

                      <span className="text-sm font-medium uppercase text-zinc-700">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Pattern Direction
                </p>

                <p className="mt-2 text-zinc-900">
                  {brief.pattern_direction || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Mood
                </p>

                <p className="mt-2 text-zinc-900">
                  {brief.mood || "Not specified"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Special Instructions
              </p>

              <p className="mt-2 text-zinc-900">
                {brief.special_instructions || "None"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Inspiration
              </p>

              {moodboards.length === 0 ? (
                <p className="mt-2 text-sm text-zinc-500">
                  No moodboard added.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {moodboards.map((asset) => (
                    <div
                      key={asset.id}
                      className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                    >
                      <p className="text-sm font-medium text-zinc-900">
                        {asset.file_name}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Moodboard
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-zinc-50 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Brand
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span className="font-medium text-zinc-900">
                  IRYA
                </span>

                <span className="text-sm text-green-700">
                  Brand DNA applied ✓
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Generation
              </p>

              <p className="mt-2 text-zinc-900">
                {brief.number_of_concepts} design concepts
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 p-8">
            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              ← Edit Brief
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              ✦ Generate Collection
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}