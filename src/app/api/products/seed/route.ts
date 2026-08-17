import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const existingProducts = await prisma.product.count();

    if (existingProducts > 0) {
      return NextResponse.json({
        success: true,
        message: 'محصولات قبلاً وارد شده‌اند.',
        count: existingProducts,
      });
    }

    const products = await prisma.product.createMany({
      data: [
{
  name: 'انگشتر طلای کلاسیک',
  weight: 3.2,
  karat: 18,
  laborPercent: 20,
  profitPercent: 7,
  taxPercent: 10,
  stock: 5,
  active: true,
},
{
  name: 'گردنبند طلای ظریف',
  weight: 8.5,
  karat: 18,
  laborPercent: 20,
  profitPercent: 7,
  taxPercent: 10,
  stock: 3,
  active: true,
},
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'محصولات با موفقیت اضافه شدند.',
      count: products.count,
    });
  } catch (error) {
    console.error('Seed error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'خطا هنگام ایجاد محصولات',
      },
      { status: 500 }
    );
  }
}