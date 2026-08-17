import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Context = {
  params: {
    id: string;
  };
};

const allowedStatuses = [
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'completed',
  'cancelled',
];

export async function PATCH(
  request: Request,
  { params }: Context
) {
  try {
    const id = Number(params.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        {
          error:
            'شناسه سفارش نامعتبر است',
        },
        { status: 400 }
      );
    }

    const body =
      await request.json();

    const status = String(
      body.status ?? ''
    ).trim();

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          error:
            'وضعیت سفارش نامعتبر است',
        },
        { status: 400 }
      );
    }

    const existingOrder =
      await prisma.order.findUnique({
        where: {
          id,
        },
      });

    if (!existingOrder) {
      return NextResponse.json(
        {
          error:
            'سفارش پیدا نشد',
        },
        { status: 404 }
      );
    }

    if (
      existingOrder.status ===
        'cancelled' &&
      status !== 'cancelled'
    ) {
      return NextResponse.json(
        {
          error:
            'سفارش لغوشده قابل بازگردانی نیست',
        },
        { status: 400 }
      );
    }

    if (
      existingOrder.status ===
        'completed' &&
      status !== 'completed'
    ) {
      return NextResponse.json(
        {
          error:
            'سفارش تکمیل‌شده قابل تغییر نیست',
        },
        { status: 400 }
      );
    }

    const order =
      await prisma.order.update({
        where: {
          id,
        },
        data: {
          status,
        },
        include: {
          items: true,
        },
      });

    return NextResponse.json(
      order
    );
  } catch (error) {
    console.error(
      'PATCH ADMIN ORDER ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در تغییر وضعیت سفارش',
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: Context
) {
  try {
    const id = Number(params.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        {
          error:
            'شناسه سفارش نامعتبر است',
        },
        { status: 400 }
      );
    }

    const order =
      await prisma.order.findUnique({
        where: {
          id,
        },
        include: {
          items: true,
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              address: true,
            },
          },
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

    return NextResponse.json(
      order
    );
  } catch (error) {
    console.error(
      'GET ADMIN ORDER ERROR:',
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