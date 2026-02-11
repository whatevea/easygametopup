import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(gameId ? { gameId } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      priceNpr: true,
      imageUrl: true,
      gameId: true,
      game: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return NextResponse.json({ products }, { status: 200 });
}
