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

const PRODUCT_TYPES = ["Bath Mat"] as const;

export default function Home() {
  const [brandsState, setBrandsState] = useState<BrandsState>({
    kind: "loading",
  });
  const [projectName, setProjectName] = useState("");
  const [productType, setProductType] = useState<string>(PRODUCT_TYPES[0]);
  const [projectDescription, setProjectDescription] = useState("");
  const [createdProject, setCreatedProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedAsset, setUploadedAsset] = useState<Asset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  

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

  async function handleContinue() {
    if (!activeBrand || !projectName.trim()) {
      return;
    }
  
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
    if (!apiBaseUrl) {
      setSubmitError("API base URL is not configured.");
      return;
    }
  
    setIsSubmitting(true);
    setSubmitError(null);
    setCreatedProject(null);
  
    try {
      const response = await fetch(`${apiBaseUrl}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand_id: activeBrand.id,
          name: projectName.trim(),
          description: projectDescription.trim() || null,
          product_type: "bath_mat",
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to create project (${response.status}).`);
      }
  
      const project = (await response.json()) as Project;
      setCreatedProject(project);
    } catch {
      setSubmitError(
        "Unable to create the project. Please check that the backend is running.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  
  async function handleUpload() {
    if (!createdProject || !selectedFile) {
      return;
    }
  
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
    if (!apiBaseUrl) {
      setUploadError("API base URL is not configured.");
      return;
    }
  
    setIsUploading(true);
    setUploadError(null);
    setUploadedAsset(null);
  
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
  
      const response = await fetch(
        `${apiBaseUrl}/projects/${createdProject.id}/assets`,
        {
          method: "POST",
          body: formData,
        },
      );
  
      if (!response.ok) {
        throw new Error(`Failed to upload image (${response.status}).`);
      }
  
      const asset = (await response.json()) as Asset;
      setUploadedAsset(asset);
    } catch {
      setUploadError(
        "Unable to upload the image. Please check the backend and try again.",
      );
    } finally {
      setIsUploading(false);
    }
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
                    }}
                  rows={4}
                  placeholder="Describe the design direction, mood, or goals for this project."
                  className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                />
              </div>

              <button
                type="submit"
                disabled={isContinueDisabled || isSubmitting}
                className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500"
              >
                {isSubmitting ? "Creating project..." : "Continue"}
              </button>
            </form>

            {submitError && (
  <p
    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400"
    role="alert"
  >
    {submitError}
  </p>
)}

          {createdProject && (
          <section
            className="rounded-lg border border-green-200 bg-green-50 px-5 py-4 dark:border-green-900 dark:bg-green-950/30"
            aria-live="polite"
          >
            <h2 className="font-semibold text-green-900 dark:text-green-200">
              Project created successfully
            </h2>

            <p className="mt-2 text-sm text-green-800 dark:text-green-300">
              Project: {createdProject.name}
            </p>

            <p className="mt-1 break-all text-sm text-green-800 dark:text-green-300">
              Project ID: {createdProject.id}
            </p>
          </section>
          )}

          {createdProject && (
            <section className="rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-700 dark:bg-zinc-800/50">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Upload Reference Image
              </h2>

              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Upload a JPEG, PNG, or WEBP image for this project.
              </p>

              <div className="mt-4 space-y-4">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedFile(file);
                    setUploadedAsset(null);
                    setUploadError(null);
                  }}
                  className="block w-full text-sm text-zinc-700 dark:text-zinc-300"
                />

                {selectedFile && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Selected: {selectedFile.name}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500"
                >
                  {isUploading ? "Uploading..." : "Upload Image"}
                </button>

                {uploadError && (
                  <p
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400"
                    role="alert"
                  >
                    {uploadError}
                  </p>
                )}

                {uploadedAsset && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
                    Image uploaded successfully: {uploadedAsset.file_name}
                  </div>
                )}
              </div>
            </section>
          )}
          </div>
        )}
      </main>
    </div>
  );
}
