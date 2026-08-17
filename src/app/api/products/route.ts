import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('GET PRODUCTS ERROR:', error);

    return NextResponse.json(
      {
        error: 'خطا در دریافت محصولات',
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const category = String(
      body.category ?? 'other'
    ).trim();

    const name = String(
      body.name ?? ''
    ).trim();

    const weight = Number(
      body.weight
    );

    const karat = Number(
      body.karat ?? 18
    );

    const laborPercent = Number(
      body.laborPercent ?? 20
    );

    const profitPercent = Number(
      body.profitPercent ?? 7
    );

    const taxPercent = Number(
      body.taxPercent ?? 10
    );

    const stock = Number(
      body.stock ?? 0
    );

    const manualPrice =
      body.manualPrice === null ||
      body.manualPrice === '' ||
      body.manualPrice === undefined
        ? null
        : Number(
            body.manualPrice
          );

    const active =
      body.active !== false;

    if (!name) {
      return NextResponse.json(
        {
          error:
            'نام محصول الزامی است',
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      return NextResponse.json(
        {
          error:
            'وزن محصول نامعتبر است',
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(karat) ||
      karat <= 0
    ) {
      return NextResponse.json(
        {
          error:
            'عیار محصول نامعتبر است',
        },
        { status: 400 }
      );
    }

const product = await prisma.product.create({
  data: {
    category,
    name,
    weight,
    karat,
    laborPercent,
    profitPercent,
    taxPercent,
    manualPrice,
    stock: Number.isFinite(stock)
      ? stock
      : 0,
    active,
    image:
      typeof body.image === 'string' &&
      body.image.trim() !== ''
        ? body.image.trim()
        : null,
  },
});

    return NextResponse.json(
      product,
      { status: 201 }
    );
  } catch (error) {
    console.error(
      'CREATE PRODUCT ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در افزودن محصول',
      },
      { status: 500 }
    );
  }
}