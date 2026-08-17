import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';
import {
  createAdminSession,
} from '@/lib/admin-auth';

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const username = String(
      body.username ?? ''
    ).trim();

    const password = String(
      body.password ?? ''
    );

    if (!username || !password) {
      return NextResponse.json(
        {
          error:
            'نام کاربری و رمز عبور الزامی است',
        },
        { status: 400 }
      );
    }

    const admin =
      await prisma.admin.findUnique({
        where: {
          username,
        },
      });

    if (!admin) {
      return NextResponse.json(
        {
          error:
            'نام کاربری یا رمز عبور اشتباه است',
        },
        { status: 401 }
      );
    }

    const validPassword =
      await bcrypt.compare(
        password,
        admin.passwordHash
      );

    if (!validPassword) {
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
        username: admin.username,
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