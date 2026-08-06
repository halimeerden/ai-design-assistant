"use client";

import { useEffect, useState } from "react";

type Brand = {
  id: string;
  name: string;
  description: string;
  brand_profile: Record<string, unknown> | null;
};

type BrandsState =
  | { kind: "loading" }
  | { kind: "success"; brands: Brand[] }
  | { kind: "error"; message: string };

type ProjectSummary = {
  brandName: string;
  projectName: string;
  productType: string;
  description: string;
};

const PRODUCT_TYPES = ["Bath Mat"] as const;

export default function Home() {
  const [brandsState, setBrandsState] = useState<BrandsState>({
    kind: "loading",
  });
  const [projectName, setProjectName] = useState("");
  const [productType, setProductType] = useState<string>(PRODUCT_TYPES[0]);
  const [projectDescription, setProjectDescription] = useState("");
  const [projectSummary, setProjectSummary] = useState<ProjectSummary | null>(
    null,
  );

  useEffect(() => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      setBrandsState({
        kind: "error",
        message: "API base URL is not configured.",
      });
      return;
    }

    async function fetchBrands() {
      try {
        const response = await fetch(`${apiBaseUrl}/brands`);

        if (!response.ok) {
          setBrandsState({
            kind: "error",
            message: `Failed to load brands (status ${response.status}).`,
          });
          return;
        }

        const brands = (await response.json()) as Brand[];

        if (!Array.isArray(brands)) {
          setBrandsState({
            kind: "error",
            message: "Received an unexpected response from the server.",
          });
          return;
        }

        setBrandsState({ kind: "success", brands });
      } catch {
        setBrandsState({
          kind: "error",
          message: "Unable to reach the backend. Is the API server running?",
        });
      }
    }

    void fetchBrands();
  }, []);

  const activeBrand =
    brandsState.kind === "success" ? (brandsState.brands[0] ?? null) : null;

  function handleContinue() {
    if (!activeBrand || !projectName.trim()) {
      return;
    }

    setProjectSummary({
      brandName: activeBrand.name,
      projectName: projectName.trim(),
      productType,
      description: projectDescription.trim(),
    });
  }

  const isContinueDisabled = !projectName.trim();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 font-sans dark:bg-zinc-950">
      <main className="w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create Design Project
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Start a new AI-assisted textile design project.
          </p>
        </header>

        {brandsState.kind === "loading" && (
          <p className="text-zinc-600 dark:text-zinc-400">Loading brands...</p>
        )}

        {brandsState.kind === "error" && (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400"
            role="alert"
          >
            {brandsState.message}
          </p>
        )}

        {brandsState.kind === "success" && !activeBrand && (
          <p className="text-zinc-600 dark:text-zinc-400">
            No brands available yet.
          </p>
        )}

        {brandsState.kind === "success" && activeBrand && (
          <div className="space-y-6">
            <section className="rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-700 dark:bg-zinc-800/50">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Active Brand
              </p>
              <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">
                {activeBrand.name}
              </p>
            </section>

            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                handleContinue();
              }}
            >
              <div>
                <label
                  htmlFor="project-name"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Project name
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={projectName}
                  onChange={(event) => {
                    setProjectName(event.target.value);
                    setProjectSummary(null);
                  }}
                  placeholder="e.g. Summer Collection 2026"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="product-type"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Product type
                </label>
                <select
                  id="product-type"
                  value={productType}
                  onChange={(event) => {
                    setProductType(event.target.value);
                    setProjectSummary(null);
                  }}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                >
                  {PRODUCT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="project-description"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Project description
                </label>
                <textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(event) => {
                    setProjectDescription(event.target.value);
                    setProjectSummary(null);
                  }}
                  rows={4}
                  placeholder="Describe the design direction, mood, or goals for this project."
                  className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                />
              </div>

              <button
                type="submit"
                disabled={isContinueDisabled}
                className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500"
              >
                Continue
              </button>
            </form>

            {projectSummary && (
              <section
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-700 dark:bg-zinc-800/50"
                aria-live="polite"
              >
                <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Project Summary
                </h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">
                      Brand:
                    </dt>
                    <dd className="text-zinc-900 dark:text-zinc-50">
                      {projectSummary.brandName}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">
                      Project name:
                    </dt>
                    <dd className="text-zinc-900 dark:text-zinc-50">
                      {projectSummary.projectName}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">
                      Product type:
                    </dt>
                    <dd className="text-zinc-900 dark:text-zinc-50">
                      {projectSummary.productType}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">
                      Description:
                    </dt>
                    <dd className="text-zinc-900 dark:text-zinc-50">
                      {projectSummary.description || "—"}
                    </dd>
                  </div>
                </dl>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
