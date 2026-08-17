import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';
import {
  verifyAdminSession,
} from '@/lib/admin-auth';

export async function POST(
  request: Request
) {
  try {
    const cookie =
      request.headers.get('cookie') || '';

    const sessionMatch =
      cookie.match(
        /(?:^|;\s*)gold_admin_session=([^;]+)/
      );

    const sessionToken =
      sessionMatch?.[1];

    const authenticated =
      await verifyAdminSession(
        sessionToken
      );

    if (!authenticated) {
      return NextResponse.json(
        {
          error:
            'دسترسی غیرمجاز',
        },
        { status: 401 }
      );
    }

    const body =
      await request.json();

    const username = String(
      body.username ?? ''
    ).trim();

    const currentPassword =
      String(
        body.currentPassword ?? ''
      );

    const newPassword =
      String(
        body.newPassword ?? ''
      );

    if (
      !username ||
      !currentPassword ||
      !newPassword
    ) {
      return NextResponse.json(
        {
          error:
            'همه فیلدها الزامی هستند',
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          error:
            'رمز جدید باید حداقل ۸ کاراکتر باشد',
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
            'حساب ادمین پیدا نشد',
        },
        { status: 404 }
      );
    }

    const valid =
      await bcrypt.compare(
        currentPassword,
        admin.passwordHash
      );

    if (!valid) {
      return NextResponse.json(
        {
          error:
            'رمز فعلی اشتباه است',
        },
        { status: 401 }
      );
    }

    const newHash =
      await bcrypt.hash(
        newPassword,
        12
      );

    await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        passwordHash: newHash,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        'رمز عبور با موفقیت تغییر کرد',
    });
  } catch (error) {
    console.error(
      'CHANGE ADMIN PASSWORD ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در تغییر رمز عبور',
      },
      { status: 500 }
    );
  }
}