import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PurchaseBody = {
  productId?: string;
  ingameId?: string;
  ingameName?: string;
  couponCode?: string;
  paymentProofUrl?: string;
};

function getUserIdFromHeaders(request: Request): string | null {
  const userId = request.headers.get("x-auth-user-id");
  return userId || null;
}

export async function GET(request: Request) {
  const userId = getUserIdFromHeaders(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const purchases = await prisma.purchase.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amountPaidNpr: true,
      status: true,
      ingameId: true,
      ingameName: true,
      paymentProofUrl: true,
      createdAt: true,
      product: {
        select: {
          id: true,
          title: true,
          priceNpr: true,
          game: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      coupon: {
        select: {
          code: true,
          discountPercent: true,
        },
      },
    },
  });

  return NextResponse.json({ purchases }, { status: 200 });
}

export async function POST(request: Request) {
  const userId = getUserIdFromHeaders(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: PurchaseBody;
  try {
    body = (await request.json()) as PurchaseBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.productId || !body.ingameId) {
    return NextResponse.json(
      { error: "productId and ingameId are required." },
      { status: 400 },
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: body.productId },
    select: {
      id: true,
      priceNpr: true,
      isActive: true,
    },
  });

  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Invalid product." }, { status: 404 });
  }

  let couponId: string | undefined;
  let amountPaidNpr = product.priceNpr;

  if (body.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: body.couponCode.trim().toUpperCase() },
      select: {
        id: true,
        discountPercent: true,
        productId: true,
      },
    });

    if (coupon) {
      const productScopeOk = !coupon.productId || coupon.productId === product.id;
      if (productScopeOk && coupon.discountPercent && coupon.discountPercent > 0) {
        const discount = (amountPaidNpr * coupon.discountPercent) / 100;
        amountPaidNpr = Math.max(0, Number((amountPaidNpr - discount).toFixed(2)));
        couponId = coupon.id;
      }
    }
  }

  const purchase = await prisma.purchase.create({
    data: {
      userId,
      productId: product.id,
      ingameId: body.ingameId,
      ingameName: body.ingameName,
      paymentProofUrl: body.paymentProofUrl,
      couponId,
      amountPaidNpr,
      status: "PENDING",
    },
    select: {
      id: true,
      amountPaidNpr: true,
      status: true,
      ingameId: true,
      ingameName: true,
      paymentProofUrl: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ purchase }, { status: 201 });
}
