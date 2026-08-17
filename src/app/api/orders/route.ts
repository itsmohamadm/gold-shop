import { NextResponse } from 'next/server';

import {
  verifyCustomerSession,
} from '@/lib/customer-auth';

import { prisma } from '@/lib/prisma';

import {
  fetchGoldPrice,
  calculateProductPrice,
} from '@/lib/gold';

export const dynamic = 'force-dynamic';

type OrderItemInput = {
  productId: number;
  quantity: number;
};

function createOrderNumber() {
  return `GZ-${Date.now()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;
}

function getCustomerToken(
  request: Request
) {
  const cookie =
    request.headers.get('cookie') || '';

  return cookie.match(
    /(?:^|;\s*)gold_customer_session=([^;]+)/
  )?.[1];
}

/*
|--------------------------------------------------------------------------
| GET /api/orders
|--------------------------------------------------------------------------
*/

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
      'GET ORDERS ERROR:',
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

/*
|--------------------------------------------------------------------------
| POST /api/orders
|--------------------------------------------------------------------------
| فقط مشتری لاگین‌شده می‌تواند سفارش ثبت کند.
*/

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    /*
    |--------------------------------------------------------------------------
    | بررسی Session مشتری
    |--------------------------------------------------------------------------
    */

    const customerToken =
      getCustomerToken(request);

    const customerId =
      await verifyCustomerSession(
        customerToken
      );

    if (!customerId) {
      return NextResponse.json(
        {
          error:
            'برای ثبت سفارش ابتدا وارد حساب کاربری شوید',
          code: 'LOGIN_REQUIRED',
        },
        {
          status: 401,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | دریافت مشتری از دیتابیس
    |--------------------------------------------------------------------------
    */

    const customer =
      await prisma.customer.findUnique({
        where: {
          id: customerId,
        },
      });

    if (!customer) {
      return NextResponse.json(
        {
          error:
            'حساب کاربری پیدا نشد. دوباره وارد شوید.',
          code: 'LOGIN_REQUIRED',
        },
        {
          status: 401,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | اطلاعات سفارش
    |--------------------------------------------------------------------------
    */

    const customerName = String(
      body.customerName ?? ''
    ).trim();

    const phone = String(
      body.phone ?? ''
    ).trim();

    const address = String(
      body.address ?? ''
    ).trim();

    const notes =
      body.notes == null
        ? null
        : String(
            body.notes
          ).trim();

    const items: OrderItemInput[] =
      Array.isArray(body.items)
        ? body.items
        : [];

    /*
    |--------------------------------------------------------------------------
    | اعتبارسنجی
    |--------------------------------------------------------------------------
    */

    if (!customerName) {
      return NextResponse.json(
        {
          error:
            'نام مشتری الزامی است',
        },
        {
          status: 400,
        }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          error:
            'شماره تماس الزامی است',
        },
        {
          status: 400,
        }
      );
    }

    if (!address) {
      return NextResponse.json(
        {
          error:
            'آدرس الزامی است',
        },
        {
          status: 400,
        }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        {
          error:
            'سبد خرید خالی است',
        },
        {
          status: 400,
        }
      );
    }

    for (const item of items) {
      if (
        !Number.isInteger(
          item.productId
        ) ||
        !Number.isInteger(
          item.quantity
        ) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          {
            error:
              'اطلاعات سبد خرید نامعتبر است',
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | قیمت فعلی طلا
    |--------------------------------------------------------------------------
    */

    const gold =
      await fetchGoldPrice();

    /*
    |--------------------------------------------------------------------------
    | ثبت سفارش
    |--------------------------------------------------------------------------
    */

    const order =
      await prisma.$transaction(
        async (tx) => {
          let total = 0;

          const orderItems: Array<{
            productId: number;
            productName: string;
            unitPrice: number;
            quantity: number;
            weight: number;
            karat: number;
            subtotal: number;
          }> = [];

          for (const item of items) {
            const product =
              await tx.product.findUnique({
                where: {
                  id: item.productId,
                },
              });

            if (!product) {
              throw new Error(
                `محصول با شناسه ${item.productId} پیدا نشد`
              );
            }

            if (!product.active) {
              throw new Error(
                `محصول «${product.name}» فعال نیست`
              );
            }

            if (
              product.stock <
              item.quantity
            ) {
              throw new Error(
                `موجودی «${product.name}» کافی نیست. موجودی فعلی: ${product.stock}`
              );
            }

            /*
            |--------------------------------------------------------------------------
            | محاسبه قیمت روی سرور
            |--------------------------------------------------------------------------
            */

            const unitPrice =
              calculateProductPrice(
                product.weight,
                gold.price18k,
                product.laborPercent,
                product.profitPercent,
                product.taxPercent,
                product.manualPrice
              );

            const subtotal =
              unitPrice *
              item.quantity;

            total += subtotal;

            /*
            |--------------------------------------------------------------------------
            | کاهش امن موجودی
            |--------------------------------------------------------------------------
            */

            const updated =
              await tx.product.updateMany({
                where: {
                  id: product.id,
                  active: true,
                  stock: {
                    gte: item.quantity,
                  },
                },
                data: {
                  stock: {
                    decrement:
                      item.quantity,
                  },
                },
              });

            if (
              updated.count !== 1
            ) {
              throw new Error(
                `موجودی «${product.name}» هنگام ثبت سفارش تغییر کرده است. دوباره تلاش کنید.`
              );
            }

            orderItems.push({
              productId:
                product.id,
              productName:
                product.name,
              unitPrice,
              quantity:
                item.quantity,
              weight:
                product.weight,
              karat:
                product.karat,
              subtotal,
            });
          }

          /*
          |--------------------------------------------------------------------------
          | ذخیره سفارش و اتصال به مشتری
          |--------------------------------------------------------------------------
          */

          return tx.order.create({
            data: {
              orderNumber:
                createOrderNumber(),

              customerName,

              phone,

              address,

              notes,

              total,

              status:
                'pending',

              paymentStatus:
                'unpaid',

              customerId:
                customer.id,

              items: {
                create:
                  orderItems,
              },
            },

            include: {
              items: true,
            },
          });
        }
      );

    return NextResponse.json(
      {
        success: true,
        order,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error(
      'CREATE ORDER ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'خطا در ثبت سفارش',
      },
      {
        status: 400,
      }
    );
  }
}