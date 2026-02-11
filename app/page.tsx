export default function HomePage() {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Home</h1>
      <p className="mt-3 max-w-2xl text-sm text-zinc-600 sm:text-base">
        This is a simple test homepage. Use the navbar to verify responsive links, auth/profile state,
        and protected API behavior.
      </p>
    </section>
  );
}
