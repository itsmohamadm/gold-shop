import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';
import {
  createCustomerSession,
} from '@/lib/customer-auth';

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const name =
      String(body.name ?? '').trim();

    const phone =
      String(body.phone ?? '').trim();

    const password =
      String(body.password ?? '');

    const address =
      String(body.address ?? '').trim();

    if (!name || !phone || !password) {
      return NextResponse.json(
        {
          error:
            'نام، شماره تماس و رمز عبور الزامی است',
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            'رمز عبور باید حداقل ۸ کاراکتر باشد',
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.customer.findUnique({
        where: { phone },
      });

    if (existing) {
      return NextResponse.json(
        {
          error:
            'این شماره تماس قبلاً ثبت شده است',
        },
        { status: 409 }
      );
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const customer =
      await prisma.customer.create({
        data: {
          name,
          phone,
          passwordHash,
          address: address || null,
        },
      });

    const token =
      await createCustomerSession(
        customer.id
      );

    const response =
      NextResponse.json(
        {
          success: true,
          customer: {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
          },
        },
        { status: 201 }
      );

    response.cookies.set({
      name: 'gold_customer_session',
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure:
        process.env.NODE_ENV ===
        'production',
      path: '/',
      maxAge:
        30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error(
      'CUSTOMER REGISTER ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در ثبت‌نام',
      },
      { status: 500 }
    );
  }
}