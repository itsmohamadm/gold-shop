import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Context = {
  params: {
    id: string;
  };
};

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
            'شناسه مشتری نامعتبر است',
        },
        { status: 400 }
      );
    }

    const customer =
      await prisma.customer.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          createdAt: true,
          updatedAt: true,
          orders: {
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              items: true,
            },
          },
          wishlists: {
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              product: true,
            },
          },
        },
      });

    if (!customer) {
      return NextResponse.json(
        {
          error:
            'مشتری پیدا نشد',
        },
        { status: 404 }
      );
    }

    const validOrders =
      customer.orders.filter(
        (order) =>
          order.status !==
          'cancelled'
      );

    const totalPurchased =
      validOrders.reduce(
        (sum, order) =>
          sum + order.total,
        0
      );

    const pendingOrders =
      customer.orders.filter(
        (order) =>
          order.status ===
          'pending'
      ).length;

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,

      stats: {
        orderCount:
          customer.orders.length,
        pendingOrders,
        totalPurchased,
        wishlistCount:
          customer.wishlists.length,
      },

      orders: customer.orders,

      wishlist:
        customer.wishlists.map(
          (item) => ({
            id: item.id,
            productId:
              item.productId,
            product:
              item.product,
            createdAt:
              item.createdAt,
          })
        ),
    });
  } catch (error) {
    console.error(
      'GET ADMIN CUSTOMER ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در دریافت اطلاعات مشتری',
      },
      { status: 500 }
    );
  }
}