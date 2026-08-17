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

    const phone =
      String(body.phone ?? '').trim();

    const password =
      String(body.password ?? '');

    const customer =
      await prisma.customer.findUnique({
        where: { phone },
      });

    if (!customer) {
      return NextResponse.json(
        {
          error:
            'شماره تماس یا رمز عبور اشتباه است',
        },
        { status: 401 }
      );
    }

    const valid =
      await bcrypt.compare(
        password,
        customer.passwordHash
      );

    if (!valid) {
      return NextResponse.json(
        {
          error:
            'شماره تماس یا رمز عبور اشتباه است',
        },
        { status: 401 }
      );
    }

    const token =
      await createCustomerSession(
        customer.id
      );

    const response =
      NextResponse.json({
        success: true,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
        },
      });

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
      'CUSTOMER LOGIN ERROR:',
      error
    );

    return NextResponse.json(
      {
        error: 'خطا در ورود',
      },
      { status: 500 }
    );
  }
}