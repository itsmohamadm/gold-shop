import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import {
  verifyCustomerSession,
} from '@/lib/customer-auth';

function getCustomerToken(
  request: Request
) {
  const cookie =
    request.headers.get('cookie') || '';

  return cookie.match(
    /(?:^|;\s*)gold_customer_session=([^;]+)/
  )?.[1];
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { id: string };
  }
) {
  try {
    const customerId =
      await verifyCustomerSession(
        getCustomerToken(request)
      );

    if (!customerId) {
      return NextResponse.json(
        {
          error:
            'برای مشاهده سفارش وارد حساب شوید',
        },
        { status: 401 }
      );
    }

    const orderId = Number(params.id);

    if (!Number.isInteger(orderId)) {
      return NextResponse.json(
        {
          error:
            'شناسه سفارش نامعتبر است',
        },
        { status: 400 }
      );
    }

    const order =
      await prisma.order.findFirst({
        where: {
          id: orderId,
          customerId,
        },
        include: {
          items: true,
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          error:
            'سفارش پیدا نشد',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(
      'GET CUSTOMER ORDER ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در دریافت سفارش',
      },
      { status: 500 }
    );
  }
}