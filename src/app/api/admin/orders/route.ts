import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders =
      await prisma.order.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          items: true,
        },
      });

    return NextResponse.json(orders);
  } catch (error) {
    console.error(
      'GET ADMIN ORDERS ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در دریافت سفارش‌ها',
      },
      {
        status: 500,
      }
    );
  }
}