import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import {
  verifyCustomerSession,
} from '@/lib/customer-auth';

export const dynamic =
  'force-dynamic';

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
    params: {
      id: string;
    };
  }
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Order ID
    |--------------------------------------------------------------------------
    */

    const orderId = Number(
      params.id
    );

    if (
      !Number.isInteger(
        orderId
      )
    ) {
      return NextResponse.json(
        {
          error:
            'شناسه سفارش نامعتبر است',
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Customer authentication
    |--------------------------------------------------------------------------
    */

    const customerId =
      await verifyCustomerSession(
        getCustomerToken(request)
      );

    if (!customerId) {
      return NextResponse.json(
        {
          error:
            'برای مشاهده وضعیت پرداخت باید وارد حساب شوید',
        },
        {
          status: 401,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find order
    |--------------------------------------------------------------------------
    */

    const order =
      await prisma.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          paymentStatus: true,
          paymentRef: true,
          paidAt: true,
          customerId: true,
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          error:
            'سفارش پیدا نشد',
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check ownership
    |--------------------------------------------------------------------------
    */

    if (
      !order.customerId ||
      order.customerId !==
        customerId
    ) {
      return NextResponse.json(
        {
          error:
            'شما به این سفارش دسترسی ندارید',
        },
        {
          status: 403,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    |
    | customerId را عمداً برنمی‌گردانیم.
    |
    */

    return NextResponse.json({
      id: order.id,
      orderNumber:
        order.orderNumber,
      total: order.total,
      status: order.status,
      paymentStatus:
        order.paymentStatus,
      paymentRef:
        order.paymentRef,
      paidAt: order.paidAt,
    });
  } catch (error) {
    console.error(
      'GET PAYMENT ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در دریافت وضعیت پرداخت',
      },
      {
        status: 500,
      }
    );
  }
}