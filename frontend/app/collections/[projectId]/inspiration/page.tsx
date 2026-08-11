"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function InspirationPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();

  const projectId = params.projectId;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedAsset, setUploadedAsset] = useState<Asset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleUpload() {
    if (!selectedFile) {
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
      formData.append("asset_type", "moodboard");

      const response = await fetch(
        `${apiBaseUrl}/projects/${projectId}/assets`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to upload moodboard (${response.status}).`);
      }

      const asset = (await response.json()) as Asset;

      setUploadedAsset(asset);
    } catch {
      setUploadError(
        "Unable to upload the moodboard. Please check the backend and try again.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleContinue() {
    router.push(`/collections/${projectId}/brief`);
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <p className="text-sm text-zinc-500">
            Collection 2 of 4
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
            Inspiration
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-600">
            Add a moodboard or inspiration image to guide the visual direction
            of this collection.
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            This is optional. Your brand profile will still be applied
            automatically.
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
            <p className="font-medium text-zinc-900">
              Upload inspiration
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              JPEG, PNG or WEBP
            </p>

            <div className="mt-5">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;

                  setSelectedFile(file);
                  setUploadedAsset(null);
                  setUploadError(null);
                }}
                className="block w-full text-sm text-zinc-700"
              />
            </div>
          </div>

          {selectedFile && (
            <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Selected image
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-900">
                {selectedFile.name}
              </p>
            </div>
          )}

          {selectedFile && !uploadedAsset && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="mt-5 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {isUploading ? "Uploading..." : "Upload Moodboard"}
            </button>
          )}

          {uploadError && (
            <p
              className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {uploadError}
            </p>
          )}

          {uploadedAsset && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm font-medium text-green-900">
                Inspiration uploaded successfully.
              </p>

              <p className="mt-1 text-sm text-green-800">
                {uploadedAsset.file_name}
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-6">
            <button
              type="button"
              onClick={handleContinue}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              Skip for now
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              Continue →
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}