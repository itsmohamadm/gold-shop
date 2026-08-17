import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customers =
      await prisma.customer.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          createdAt: true,
          updatedAt: true,

          orders: {
            select: {
              id: true,
              total: true,
              status: true,
              paymentStatus: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

    const result = customers.map(
      (customer) => {
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

        const lastOrder =
          customer.orders[0] ||
          null;

        return {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          address:
            customer.address,
          createdAt:
            customer.createdAt,
          updatedAt:
            customer.updatedAt,

          orderCount:
            customer.orders.length,

          pendingOrders,

          totalPurchased,

          lastOrder: lastOrder
            ? {
                id: lastOrder.id,
                total:
                  lastOrder.total,
                status:
                  lastOrder.status,
                paymentStatus:
                  lastOrder.paymentStatus,
                createdAt:
                  lastOrder.createdAt,
              }
            : null,
        };
      }
    );

    return NextResponse.json(
      result
    );
  } catch (error) {
    console.error(
      'GET ADMIN CUSTOMERS ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در دریافت مشتری‌ها',
      },
      {
        status: 500,
      }
    );
  }
}