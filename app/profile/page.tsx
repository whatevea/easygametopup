import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const user = await getCurrentUserFromCookies();

  if (!user) {
    redirect("/login");
  }

  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      amountPaidNpr: true,
      status: true,
      createdAt: true,
      product: {
        select: {
          title: true,
        },
      },
    },
  });

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Profile</h1>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-zinc-50 p-4">
          <p className="text-xs font-medium uppercase text-zinc-500">Name</p>
          <p className="mt-1 text-sm font-medium text-zinc-900">{user.name ?? "Not set"}</p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-4">
          <p className="text-xs font-medium uppercase text-zinc-500">Email</p>
          <p className="mt-1 text-sm font-medium text-zinc-900">{user.email}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Purchases</h2>
          <Link href="/products" className="text-sm font-medium text-zinc-700 underline">
            Browse products
          </Link>
        </div>

        {purchases.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
            No purchases yet.
          </p>
        ) : (
          <div className="space-y-2">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm">
                <p className="font-medium text-zinc-900">{purchase.product.title}</p>
                <p className="text-zinc-600">
                  NPR {purchase.amountPaidNpr} - {purchase.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
