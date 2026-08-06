"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
};

type BackendState =
  | { kind: "loading" }
  | { kind: "ok" }
  | { kind: "error"; message: string };

export default function Home() {
  const [backendState, setBackendState] = useState<BackendState>({
    kind: "loading",
  });

  useEffect(() => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      setBackendState({
        kind: "error",
        message: "API base URL is not configured.",
      });
      return;
    }

    async function checkBackendHealth() {
      try {
        const response = await fetch(`${apiBaseUrl}/health`);

        if (!response.ok) {
          setBackendState({
            kind: "error",
            message: `Backend returned status ${response.status}.`,
          });
          return;
        }

        const data = (await response.json()) as HealthResponse;

        if (data.status === "ok") {
          setBackendState({ kind: "ok" });
          return;
        }

        setBackendState({
          kind: "error",
          message: "Backend returned an unexpected response.",
        });
      } catch {
        setBackendState({
          kind: "error",
          message: "Unable to reach the backend. Is the API server running?",
        });
      }
    }

    void checkBackendHealth();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="rounded-lg border border-zinc-200 bg-white px-8 py-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          AI Design Assistant
        </h1>

        {backendState.kind === "loading" && (
          <p className="text-zinc-600 dark:text-zinc-400">
            Checking backend...
          </p>
        )}

        {backendState.kind === "ok" && (
          <p className="font-medium text-green-700 dark:text-green-400">
            Backend Status: OK
          </p>
        )}

        {backendState.kind === "error" && (
          <p className="text-red-600 dark:text-red-400">
            {backendState.message}
          </p>
        )}
      </main>
    </div>
  );
}
