import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: 'شناسه محصول نامعتبر است' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'محصول پیدا نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('GET PRODUCT ERROR:', error);

    return NextResponse.json(
      { error: 'خطا در دریافت محصول' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: 'شناسه محصول نامعتبر است' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name = String(body.name ?? '').trim();
    const category = String(
      body.category ?? 'other'
    ).trim();

    const weight = Number(body.weight);
    const karat = Number(body.karat ?? 18);
    const laborPercent = Number(
      body.laborPercent ?? 20
    );
    const profitPercent = Number(
      body.profitPercent ?? 7
    );
    const taxPercent = Number(
      body.taxPercent ?? 10
    );

    const stock = Number(body.stock ?? 0);

    const active = body.active !== false;

    if (!name) {
      return NextResponse.json(
        { error: 'نام محصول الزامی است' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'دسته‌بندی محصول الزامی است' },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      return NextResponse.json(
        { error: 'وزن محصول نامعتبر است' },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(karat) ||
      karat <= 0
    ) {
      return NextResponse.json(
        { error: 'عیار محصول نامعتبر است' },
        { status: 400 }
      );
    }

    const manualPrice =
      body.manualPrice === null ||
      body.manualPrice === '' ||
      body.manualPrice === undefined
        ? null
        : Number(body.manualPrice);

    if (
      manualPrice !== null &&
      !Number.isFinite(manualPrice)
    ) {
      return NextResponse.json(
        { error: 'قیمت دستی نامعتبر است' },
        { status: 400 }
      );
    }

    const product =
      await prisma.product.update({
        where: { id },
        data: {
          name,
          category,
          weight,
          karat,
          laborPercent,
          profitPercent,
          taxPercent,
          manualPrice,
          stock: Number.isFinite(stock)
            ? Math.max(0, Math.floor(stock))
            : 0,
          active,
          image:
            typeof body.image === 'string' &&
            body.image.trim() !== ''
              ? body.image.trim()
              : null,
        },
      });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error(
      'UPDATE PRODUCT ERROR:',
      error
    );

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'محصول پیدا نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'خطا در ویرایش محصول' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: 'شناسه محصول نامعتبر است' },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'محصول حذف شد',
    });
  } catch (error: any) {
    console.error(
      'DELETE PRODUCT ERROR:',
      error
    );

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'محصول پیدا نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'خطا در حذف محصول' },
      { status: 500 }
    );
  }
}