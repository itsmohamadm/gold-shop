import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const defaultCategories = [
  {
    value: 'necklace',
    label: 'گردنبند',
  },
  {
    value: 'bracelet',
    label: 'دستبند',
  },
  {
    value: 'bangle',
    label: 'النگو',
  },
  {
    value: 'ring',
    label: 'انگشتر',
  },
  {
    value: 'earring',
    label: 'گوشواره',
  },
  {
    value: 'anklet',
    label: 'پابند',
  },
  {
    value: 'set',
    label: 'سرویس طلا',
  },
  {
    value: 'half-set',
    label: 'نیم‌ست',
  },
  {
    value: 'pendant',
    label: 'آویز',
  },
  {
    value: 'chain',
    label: 'زنجیر',
  },
  {
    value: 'coin',
    label: 'سکه و شمش',
  },
  {
    value: 'other',
    label: 'سایر',
  },
];

export async function GET() {
  try {
    let created = 0;

    for (const category of defaultCategories) {
      const existing =
        await prisma.category.findUnique({
          where: {
            value: category.value,
          },
        });

      if (!existing) {
        await prisma.category.create({
          data: {
            ...category,
            active: true,
          },
        });

        created++;
      }
    }

    return NextResponse.json({
      success: true,
      created,
    });
  } catch (error) {
    console.error(
      'SEED CATEGORIES ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در ساخت دسته‌بندی‌ها',
      },
      { status: 500 }
    );
  }
}