import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import {
  verifyCustomerSession,
} from '@/lib/customer-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request
) {
  try {
    const cookie =
      request.headers.get('cookie') || '';

    const token =
      cookie.match(
        /(?:^|;\s*)gold_customer_session=([^;]+)/
      )?.[1];

    const customerId =
      await verifyCustomerSession(token);

    if (!customerId) {
      return NextResponse.json(
        {
          error:
            'وارد حساب نشده‌اید',
        },
        { status: 401 }
      );
    }

    const orders =
      await prisma.order.findMany({
        where: {
          customerId,
        },
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
      'GET CUSTOMER ORDERS ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در دریافت سفارش‌ها',
      },
      { status: 500 }
    );
  }
}