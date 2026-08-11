import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <p className="text-sm text-zinc-500">AI Design Assistant</p>

          <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
            What would you like to do?
          </h1>

          <p className="mt-3 text-zinc-600">
            Create a new collection or edit an existing product.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/collections/new"
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-zinc-900">
              Create New Collection
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Explore new bath mat concepts from a collection brief and
              inspiration.
            </p>

            <p className="mt-6 text-sm font-medium text-zinc-900">
              Start collection →
            </p>
          </Link>

          <Link
            href="/edit"
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-zinc-900">
              Edit Existing Product
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Change color, pattern, fringe, or other details on an existing
              product.
            </p>

            <p className="mt-6 text-sm font-medium text-zinc-900">
              Edit product →
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}