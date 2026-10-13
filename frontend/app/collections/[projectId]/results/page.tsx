
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

type GeneratedDesign = {
  id: string;
  image_url: string;
  model_name: string | null;
};

type GenerationResults = {
  request_id: string;
  status: string;
  designs: GeneratedDesign[];
};

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1200;

export default function CollectionResultsPage() {
  const params = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const projectId = params.projectId;
  const requestId = searchParams.get("requestId");

  const [results, setResults] = useState<GenerationResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    let cancelled = false;

    if (!apiBaseUrl || !requestId) {
      setError("API configuration or generation request ID is missing.");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadResults() {
      setIsLoading(true);
      setError(null);
      setResults(null);

      try {
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          if (cancelled) return;

          const response = await fetch(
            `${apiBaseUrl}/projects/${projectId}/generation-requests/${requestId}/results`,
            {
              cache: "no-store",
              signal: controller.signal,
            },
          );

          if (response.ok) {
            const data = (await response.json()) as GenerationResults;

            if (!cancelled) {
              setResults(data);
            }

            return;
          }

          // Retry only temporary server errors.
          if (response.status < 500 || attempt === MAX_ATTEMPTS) {
            throw new Error(
              `Failed to load generated designs (HTTP ${response.status}).`,
            );
          }

          console.warn(
            `Results API returned ${response.status}. Retrying (${attempt}/${MAX_ATTEMPTS - 1})...`,
          );

          await new Promise<void>((resolve) => {
            setTimeout(resolve, RETRY_DELAY_MS);
          });
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadResults();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [projectId, requestId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-zinc-600">
            Loading generated designs...
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Please wait while we prepare your collection results.
          </p>
        </div>
      </main>
    );
  }

  if (error || !results) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Unable to load results
          </h1>
          <p className="mt-3 text-sm text-red-600">
            {error ?? "No results found."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <p className="text-sm text-zinc-500">
            AI Design Assistant
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
            Collection Results
          </h1>

          <p className="mt-3 text-zinc-600">
            {results.designs.length} generated bath mat concepts
          </p>
        </header>

        {results.designs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8">
            <p className="text-zinc-600">
              No generated designs are available yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {results.designs.map((design, index) => (
              <article
                key={design.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
              >
                <img
                  src={design.image_url}
                  alt={`Bath mat concept ${index + 1}`}
                  className="aspect-square w-full bg-zinc-100 object-contain"
                />

                <div className="p-5">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    Concept {index + 1}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Generated with {design.model_name ?? "unknown"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-10">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}
