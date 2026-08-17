import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import {
  verifyCustomerSession,
} from '@/lib/customer-auth';

function getCustomerToken(request: Request) {
  const cookie =
    request.headers.get('cookie') || '';

  return cookie.match(
    /(?:^|;\s*)gold_customer_session=([^;]+)/
  )?.[1];
}

async function getCustomerId(
  request: Request
) {
  return verifyCustomerSession(
    getCustomerToken(request)
  );
}

export async function GET(
  request: Request
) {
  try {
    const customerId =
      await getCustomerId(request);

    if (!customerId) {
      return NextResponse.json(
        {
          error: 'وارد حساب نشده‌اید',
        },
        { status: 401 }
      );
    }

    const wishlist =
      await prisma.wishlist.findMany({
        where: {
          customerId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          product: true,
        },
      });

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error(
      'GET WISHLIST ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در دریافت علاقه‌مندی‌ها',
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const customerId =
      await getCustomerId(request);

    if (!customerId) {
      return NextResponse.json(
        {
          error:
            'برای افزودن به علاقه‌مندی‌ها وارد حساب شوید',
          code: 'LOGIN_REQUIRED',
        },
        { status: 401 }
      );
    }

    const body =
      await request.json();

    const productId = Number(
      body.productId
    );

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        {
          error:
            'شناسه محصول نامعتبر است',
        },
        { status: 400 }
      );
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          error:
            'محصول پیدا نشد',
        },
        { status: 404 }
      );
    }

    const existing =
      await prisma.wishlist.findUnique({
        where: {
          customerId_productId: {
            customerId,
            productId,
          },
        },
      });

    if (existing) {
      return NextResponse.json({
        success: true,
        liked: true,
        wishlist: existing,
      });
    }

    const wishlist =
      await prisma.wishlist.create({
        data: {
          customerId,
          productId,
        },
        include: {
          product: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        liked: true,
        wishlist,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      'ADD WISHLIST ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در افزودن به علاقه‌مندی‌ها',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request
) {
  try {
    const customerId =
      await getCustomerId(request);

    if (!customerId) {
      return NextResponse.json(
        {
          error:
            'برای حذف از علاقه‌مندی‌ها وارد حساب شوید',
        },
        { status: 401 }
      );
    }

    const body =
      await request.json();

    const productId = Number(
      body.productId
    );

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        {
          error:
            'شناسه محصول نامعتبر است',
        },
        { status: 400 }
      );
    }

    await prisma.wishlist.deleteMany({
      where: {
        customerId,
        productId,
      },
    });

    return NextResponse.json({
      success: true,
      liked: false,
    });
  } catch (error) {
    console.error(
      'REMOVE WISHLIST ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در حذف از علاقه‌مندی‌ها',
      },
      { status: 500 }
    );
  }
}