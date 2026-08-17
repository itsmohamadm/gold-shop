import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import {
  fetchGoldPrice,
  calculateProductPrice,
} from '@/lib/gold';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const ids = Array.isArray(body.ids)
      ? body.ids
          .map(Number)
          .filter(
            (id: number) =>
              Number.isInteger(id) &&
              id > 0
          )
      : [];

    if (ids.length === 0) {
      return NextResponse.json([]);
    }

    const [
      products,
      gold,
    ] = await Promise.all([
      prisma.product.findMany({
        where: {
          id: {
            in: ids,
          },
        },
      }),
      fetchGoldPrice(),
    ]);

    const result = products.map(
      (product) => ({
        id: product.id,
        stock: product.stock,
        active: product.active,
        price:
          calculateProductPrice(
            product.weight,
            gold.price18k,
            product.laborPercent,
            product.profitPercent,
            product.taxPercent,
            product.manualPrice
          ),
      })
    );

    return NextResponse.json(
      result
    );
  } catch (error) {
    console.error(
      'CART REFRESH ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در به‌روزرسانی سبد خرید',
      },
      {
        status: 500,
      }
    );
  }
}