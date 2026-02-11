export default function PrivacyPolicyPage() {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Privacy Policy</h1>
      <p className="mt-3 max-w-3xl text-sm text-zinc-600 sm:text-base">
        We only store the minimum account and purchase data required to operate this service. Tokens are
        stored in HTTP-only cookies and verified on the server.
      </p>
    </section>
  );
}
