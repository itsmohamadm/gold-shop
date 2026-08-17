import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: { id: string };
  }
) {
  try {
    const id = Number(params.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        {
          error:
            'شناسه دسته‌بندی نامعتبر است',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const value = String(
      body.value ?? ''
    )
      .trim()
      .toLowerCase();

    const label = String(
      body.label ?? ''
    ).trim();

    const active = body.active !== false;

    if (!value || !label) {
      return NextResponse.json(
        {
          error:
            'شناسه و نام دسته‌بندی الزامی است',
        },
        { status: 400 }
      );
    }

    const duplicate =
      await prisma.category.findFirst({
        where: {
          value,
          NOT: {
            id,
          },
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            'این شناسه دسته‌بندی قبلاً استفاده شده است',
        },
        { status: 409 }
      );
    }

    const category =
      await prisma.category.update({
        where: { id },
        data: {
          value,
          label,
          active,
        },
      });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error(
      'UPDATE CATEGORY ERROR:',
      error
    );

    if (error?.code === 'P2025') {
      return NextResponse.json(
        {
          error:
            'دسته‌بندی پیدا نشد',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error:
          'خطا در ویرایش دسته‌بندی',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: { id: string };
  }
) {
  try {
    const id = Number(params.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        {
          error:
            'شناسه دسته‌بندی نامعتبر است',
        },
        { status: 400 }
      );
    }

    const category =
      await prisma.category.findUnique({
        where: { id },
      });

    if (!category) {
      return NextResponse.json(
        {
          error:
            'دسته‌بندی پیدا نشد',
        },
        { status: 404 }
      );
    }

    const products =
      await prisma.product.count({
        where: {
          category: category.value,
        },
      });

    if (products > 0) {
      return NextResponse.json(
        {
          error:
            `این دسته‌بندی ${products} محصول دارد. ابتدا دسته محصولات را تغییر دهید.`,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error(
      'DELETE CATEGORY ERROR:',
      error
    );

    if (error?.code === 'P2025') {
      return NextResponse.json(
        {
          error:
            'دسته‌بندی پیدا نشد',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error:
          'خطا در حذف دسته‌بندی',
      },
      { status: 500 }
    );
  }
}