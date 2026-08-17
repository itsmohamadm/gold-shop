import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('GET CATEGORIES ERROR:', error);

    return NextResponse.json(
      { error: 'خطا در دریافت دسته‌بندی‌ها' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const value = String(body.value ?? '')
      .trim()
      .toLowerCase();

    const label = String(body.label ?? '').trim();

    const active = body.active !== false;

    if (!value) {
      return NextResponse.json(
        { error: 'شناسه دسته‌بندی الزامی است' },
        { status: 400 }
      );
    }

    if (!label) {
      return NextResponse.json(
        { error: 'نام دسته‌بندی الزامی است' },
        { status: 400 }
      );
    }

    const existing =
      await prisma.category.findUnique({
        where: { value },
      });

    if (existing) {
      return NextResponse.json(
        {
          error:
            'این دسته‌بندی قبلاً وجود دارد',
        },
        { status: 409 }
      );
    }

    const category =
      await prisma.category.create({
        data: {
          value,
          label,
          active,
        },
      });

    return NextResponse.json(
      category,
      { status: 201 }
    );
  } catch (error) {
    console.error(
      'CREATE CATEGORY ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در ایجاد دسته‌بندی',
      },
      { status: 500 }
    );
  }
}