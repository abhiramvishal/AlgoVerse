import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-100">AlgoVerse</h1>
        <p className="text-lg text-zinc-400">
          Explore computer science concepts with synchronized animations and Python code
          walkthroughs.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/explore"
            className="rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-500"
          >
            Launch Explorer
          </Link>
          <Link
            href="/explore/sorting/quick-sort"
            className="rounded-md border border-zinc-700 px-5 py-2.5 font-medium text-zinc-200 transition hover:bg-zinc-900"
          >
            Try Quick Sort
          </Link>
        </div>
      </div>
    </div>
  );
}
