import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import {
  createAdminSession,
} from '@/lib/admin-auth';

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const username =
      String(
        body.username ?? ''
      ).trim();

    const password =
      String(
        body.password ?? ''
      );

    const expectedUsername =
      process.env.ADMIN_USERNAME;

    const passwordHash =
      process.env.ADMIN_PASSWORD_HASH;

    if (
      !expectedUsername ||
      !passwordHash
    ) {
      return NextResponse.json(
        {
          error:
            'تنظیمات ورود ادمین کامل نیست',
        },
        { status: 500 }
      );
    }

    const validUsername =
      username ===
      expectedUsername;

    const validPassword =
      await bcrypt.compare(
        password,
        passwordHash
      );

    if (
      !validUsername ||
      !validPassword
    ) {
      return NextResponse.json(
        {
          error:
            'نام کاربری یا رمز عبور اشتباه است',
        },
        { status: 401 }
      );
    }

    const token =
      await createAdminSession();

    const response =
      NextResponse.json({
        success: true,
      });

    response.cookies.set({
      name: 'gold_admin_session',
      value: token,
      httpOnly: true,
      sameSite: 'strict',
      secure:
        process.env.NODE_ENV ===
        'production',
      path: '/',
      maxAge:
        8 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error(
      'ADMIN LOGIN ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در ورود',
      },
      { status: 500 }
    );
  }
}