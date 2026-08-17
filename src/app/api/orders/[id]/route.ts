import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const allowedStatuses = [
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'completed',
  'cancelled',
];

export async function GET(
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
            'شناسه سفارش نامعتبر است',
        },
        { status: 400 }
      );
    }

    const order =
      await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          error: 'سفارش پیدا نشد',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
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

export async function PATCH(
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
            'شناسه سفارش نامعتبر است',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const newStatus = body.status;

    if (
      !allowedStatuses.includes(
        newStatus
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

    const currentOrder =
      await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

    if (!currentOrder) {
      return NextResponse.json(
        {
          error: 'سفارش پیدا نشد',
        },
        { status: 404 }
      );
    }

    if (
      currentOrder.status ===
      newStatus
    ) {
      return NextResponse.json(
        currentOrder
      );
    }

    if (
      currentOrder.status ===
      'cancelled'
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
      newStatus === 'cancelled' &&
      ['shipped', 'completed'].includes(
        currentOrder.status
      )
    ) {
      return NextResponse.json(
        {
          error:
            'سفارش ارسال‌شده یا تکمیل‌شده قابل لغو نیست',
        },
        { status: 400 }
      );
    }

    const updatedOrder =
      await prisma.$transaction(
        async (tx) => {
          if (
            newStatus ===
            'cancelled'
          ) {
            for (const item of currentOrder.items) {
              if (
                item.productId === null
              ) {
                continue;
              }

              await tx.product.update({
                where: {
                  id: item.productId,
                },
                data: {
                  stock: {
                    increment:
                      item.quantity,
                  },
                },
              });
            }
          }

          return tx.order.update({
            where: { id },
            data: {
              status: newStatus,
            },
            include: {
              items: true,
            },
          });
        }
      );

    return NextResponse.json(
      updatedOrder
    );
  } catch (error: any) {
    console.error(
      'UPDATE ADMIN ORDER ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'خطا در تغییر وضعیت سفارش',
      },
      { status: 400 }
    );
  }
}