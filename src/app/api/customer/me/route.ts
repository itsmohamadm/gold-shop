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

async function getAuthenticatedCustomer(
  request: Request
) {
  const customerId =
    await verifyCustomerSession(
      getCustomerToken(request)
    );

  if (!customerId) {
    return null;
  }

  return prisma.customer.findUnique({
    where: {
      id: customerId,
    },
  });
}

export async function GET(
  request: Request
) {
  try {
    const customer =
      await getAuthenticatedCustomer(
        request
      );

    if (!customer) {
      return NextResponse.json(
        {
          error:
            'وارد حساب نشده‌اید',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      createdAt:
        customer.createdAt,
    });
  } catch (error) {
    console.error(
      'GET CUSTOMER ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در دریافت پروفایل',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request
) {
  try {
    const customer =
      await getAuthenticatedCustomer(
        request
      );

    if (!customer) {
      return NextResponse.json(
        {
          error:
            'وارد حساب نشده‌اید',
        },
        { status: 401 }
      );
    }

    const body =
      await request.json();

    const name = String(
      body.name ?? ''
    ).trim();

    const phone = String(
      body.phone ?? ''
    ).trim();

    const address =
      body.address == null
        ? null
        : String(
            body.address
          ).trim() || null;

    if (!name) {
      return NextResponse.json(
        {
          error:
            'نام و نام خانوادگی الزامی است',
        },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          error:
            'شماره تماس الزامی است',
        },
        { status: 400 }
      );
    }

    if (
      phone !== customer.phone
    ) {
      const duplicate =
        await prisma.customer.findUnique({
          where: {
            phone,
          },
        });

      if (
        duplicate &&
        duplicate.id !== customer.id
      ) {
        return NextResponse.json(
          {
            error:
              'این شماره تماس قبلاً استفاده شده است',
          },
          { status: 409 }
        );
      }
    }

    const updated =
      await prisma.customer.update({
        where: {
          id: customer.id,
        },
        data: {
          name,
          phone,
          address,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          createdAt: true,
        },
      });

    return NextResponse.json(
      updated
    );
  } catch (error: any) {
    console.error(
      'UPDATE CUSTOMER ERROR:',
      error
    );

    if (error?.code === 'P2002') {
      return NextResponse.json(
        {
          error:
            'این شماره تماس قبلاً استفاده شده است',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          'خطا در ویرایش پروفایل',
      },
      { status: 500 }
    );
  }
}