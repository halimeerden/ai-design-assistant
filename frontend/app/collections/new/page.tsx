"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Brand = {
  id: string;
  name: string;
};

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

const PRODUCT_OPTIONS = [
  {
    id: "bath_mat",
    label: "Bath Mat",
    available: true,
  },
];

export default function CreateCollectionPage() {
  const router = useRouter();

  const [collectionName, setCollectionName] = useState("");
  const [category] = useState("Bathroom");

  const [selectedProducts, setSelectedProducts] = useState<string[]>([
    "bath_mat",
  ]);

  const [activeBrand, setActiveBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      setSubmitError("API base URL is not configured.");
      return;
    }

    async function fetchBrand() {
      try {
        const response = await fetch(`${apiBaseUrl}/brands`);

        if (!response.ok) {
          throw new Error("Failed to load brand.");
        }

        const brands = (await response.json()) as Brand[];

        setActiveBrand(brands[0] ?? null);
      } catch {
        setSubmitError("Unable to load the active brand.");
      }
    }

    void fetchBrand();
  }, []);

  function toggleProduct(productId: string) {
    setSelectedProducts((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  async function handleCreateCollection() {
    if (
      !activeBrand ||
      !collectionName.trim() ||
      selectedProducts.length === 0
    ) {
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
      const response = await fetch(`${apiBaseUrl}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand_id: activeBrand.id,
          name: collectionName.trim(),
          description: null,
          product_type: selectedProducts[0],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create project (${response.status}).`);
      }

      const project = (await response.json()) as Project;

      router.push(`/collections/${project.id}/inspiration`);
    } catch {
      setSubmitError(
        "Unable to create the collection. Please check the backend and try again.",
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
            Collection 1 of 4
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
            Create Collection
          </h1>

          <p className="mt-3 text-zinc-600">
            Set up the collection you want to explore.
          </p>

          {activeBrand && (
            <p className="mt-2 text-sm text-zinc-500">
              Brand: {activeBrand.name}
            </p>
          )}
        </div>

        <div className="space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Collection name
            </label>

            <input
              type="text"
              value={collectionName}
              onChange={(event) => setCollectionName(event.target.value)}
              placeholder="e.g. Mediterranean Summer 2027"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Category
            </label>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900">
              {category}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-zinc-700">
              Products to explore
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {PRODUCT_OPTIONS.map((product) => {
                const selected = selectedProducts.includes(product.id);

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggleProduct(product.id)}
                    className={`rounded-xl border px-4 py-4 text-left transition ${
                      selected
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-900"
                    }`}
                  >
                    <div className="font-medium">
                      {selected ? "✓ " : ""}
                      {product.label}
                    </div>

                    <div
                      className={`mt-1 text-sm ${
                        selected ? "text-zinc-300" : "text-zinc-500"
                      }`}
                    >
                      Available in MVP
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {submitError && (
            <p
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {submitError}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCreateCollection}
              disabled={
                !collectionName.trim() ||
                selectedProducts.length === 0 ||
                !activeBrand ||
                isSubmitting
              }
              className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {isSubmitting ? "Creating collection..." : "Continue →"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}