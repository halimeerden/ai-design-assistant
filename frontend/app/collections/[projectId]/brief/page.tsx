"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function CollectionBriefPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();

  const projectId = params.projectId;

  const [concept, setConcept] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [currentColor, setCurrentColor] = useState("#d8c3a5");
  const [patternDirection, setPatternDirection] = useState("");
  const [mood, setMood] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [numberOfConcepts, setNumberOfConcepts] = useState(4);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function addColor() {
    if (!selectedColors.includes(currentColor)) {
      setSelectedColors((current) => [...current, currentColor]);
    }
  }

  function removeColor(colorToRemove: string) {
    setSelectedColors((current) =>
      current.filter((color) => color !== colorToRemove),
    );
  }

  async function handleContinue() {
    if (!concept.trim()) {
      return;
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      setSubmitError("API base URL is not configured.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/projects/${projectId}/briefs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            concept: concept.trim(),
            desired_colors: selectedColors,
            pattern_direction: patternDirection.trim() || null,
            mood: mood.trim() || null,
            special_instructions: specialInstructions.trim() || null,
            number_of_concepts: numberOfConcepts,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to create brief (${response.status}).`);
      }

      const brief = (await response.json()) as DesignBrief;

      router.push(
        `/collections/${projectId}/review?briefId=${brief.id}`,
      );
    } catch {
      setSubmitError(
        "Unable to save the collection brief. Please check the backend and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <p className="text-sm text-zinc-500">
            Collection 3 of 4
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
            Collection Brief
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-600">
            Define the creative direction for this collection.
          </p>
        </div>

        <section className="space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Collection concept
            </label>

            <textarea
              value={concept}
              onChange={(event) => setConcept(event.target.value)}
              rows={4}
              placeholder="e.g. A calm Mediterranean summer collection with a natural, sophisticated spa feeling."
              className="w-full resize-y rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-zinc-700">
              Color direction
            </p>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Pick a color
                  </label>

                  <input
                    type="color"
                    value={currentColor}
                    onChange={(event) => setCurrentColor(event.target.value)}
                    className="h-12 w-16 cursor-pointer rounded-lg border border-zinc-300 bg-white p-1"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                    HEX
                  </label>

                  <input
                    type="text"
                    value={currentColor}
                    onChange={(event) => setCurrentColor(event.target.value)}
                    className="w-32 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm uppercase text-zinc-900"
                  />
                </div>

                <button
                  type="button"
                  onClick={addColor}
                  className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
                >
                  Add Color
                </button>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Selected palette
                </p>

                {selectedColors.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    No colors selected yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {selectedColors.map((color) => (
                      <div
                        key={color}
                        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2"
                      >
                        <span
                          className="h-5 w-5 rounded-full border border-zinc-200"
                          style={{ backgroundColor: color }}
                        />

                        <span className="text-sm font-medium uppercase text-zinc-700">
                          {color}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeColor(color)}
                          className="text-zinc-400 transition hover:text-zinc-900"
                          aria-label={`Remove ${color}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Pattern direction
            </label>

            <input
              type="text"
              value={patternDirection}
              onChange={(event) => setPatternDirection(event.target.value)}
              placeholder="e.g. organic, geometric, minimal"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Mood
            </label>

            <input
              type="text"
              value={mood}
              onChange={(event) => setMood(event.target.value)}
              placeholder="e.g. natural, calm, sophisticated"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Special instructions
            </label>

            <textarea
              value={specialInstructions}
              onChange={(event) => setSpecialInstructions(event.target.value)}
              rows={3}
              placeholder="e.g. Avoid strong contrast. Keep the collection premium but warm."
              className="w-full resize-y rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Number of concepts
            </label>

            <input
              type="number"
              min={1}
              max={4}
              value={numberOfConcepts}
              onChange={(event) =>
                setNumberOfConcepts(Number(event.target.value))
              }
              className="w-28 rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
            />
          </div>

          {submitError && (
            <p
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {submitError}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-zinc-100 pt-6">
            <button
              type="button"
              onClick={() =>
                router.push(`/collections/${projectId}/inspiration`)
              }
              className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!concept.trim() || isSubmitting}
              className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {isSubmitting
                ? "Saving brief..."
                : "Continue to Review →"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}