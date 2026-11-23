import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Fixture</h1>
      <p>Set up an intramural league and generate a fair season schedule.</p>
      <Link href="/leagues/new" className="underline">
        New league
      </Link>
    </main>
  );
}
