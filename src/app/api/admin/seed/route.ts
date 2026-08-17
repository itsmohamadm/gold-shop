import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const existing =
      await prisma.admin.findUnique({
        where: {
          username:
            process.env.ADMIN_USERNAME ||
            'admin',
        },
      });

    if (existing) {
      return NextResponse.json({
        success: true,
        message:
          'حساب ادمین از قبل وجود دارد',
      });
    }

    const username =
      process.env.ADMIN_USERNAME ||
      'admin';

    const passwordHash =
      process.env.ADMIN_PASSWORD_HASH;

    if (!passwordHash) {
      return NextResponse.json(
        {
          error:
            'ADMIN_PASSWORD_HASH در env پیدا نشد',
        },
        { status: 500 }
      );
    }

    const admin =
      await prisma.admin.create({
        data: {
          username,
          passwordHash,
        },
      });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error(
      'ADMIN SEED ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'خطا در ساخت حساب ادمین',
      },
      { status: 500 }
    );
  }
}