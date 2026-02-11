import { prisma } from "@/lib/prisma";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      priceNpr: true,
      game: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Products</h1>
      <p className="mt-3 text-sm text-zinc-600 sm:text-base">Simple product listing for testing.</p>

      {products.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
          No active products found.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{product.game.name}</p>
              <h2 className="mt-1 text-base font-semibold text-zinc-900">{product.title}</h2>
              <p className="mt-2 text-sm text-zinc-600">{product.description || "No description"}</p>
              <p className="mt-3 text-sm font-semibold text-zinc-900">NPR {product.priceNpr}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
