export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center px-6 py-16 font-sans">
      <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
        Quoter
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
        Dashboard
      </h1>
      <p className="mt-4 text-base leading-7 text-zinc-600">
        Scaffold for the roofer lead inbox. Auth, tables, and UI live here —
        see <code className="text-zinc-800">SETUP.md</code> for Supabase prep
        and <code className="text-zinc-800">BACKEND.md</code> for the API
        insert contract.
      </p>
    </main>
  );
}
