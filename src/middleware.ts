import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  verifyAdminSession,
} from '@/lib/admin-auth';

export async function middleware(
  request: NextRequest
) {
  const { pathname } =
    request.nextUrl;

  const token =
    request.cookies.get(
      'gold_admin_session'
    )?.value;

  const authenticated =
    await verifyAdminSession(
      token
    );

  /*
  |--------------------------------------------------------------------------
  | Admin Pages
  |--------------------------------------------------------------------------
  */

  const isAdminPage =
    pathname === '/admin' ||
    pathname.startsWith('/admin/');

  const isAdminLoginPage =
    pathname === '/admin/login';

  if (
    isAdminPage &&
    !isAdminLoginPage
  ) {
    if (!authenticated) {
      const loginUrl =
        new URL(
          '/admin/login',
          request.url
        );

      loginUrl.searchParams.set(
        'from',
        pathname
      );

      return NextResponse.redirect(
        loginUrl
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | API
  |--------------------------------------------------------------------------
  */

  if (pathname.startsWith('/api/')) {
    let needsAuth = false;

    /*
    |--------------------------------------------------------------------------
    | Admin Login / Logout
    |--------------------------------------------------------------------------
    */

    if (
      pathname ===
        '/api/admin/login' ||
      pathname ===
        '/api/admin/logout'
    ) {
      needsAuth = false;
    }

    /*
    |--------------------------------------------------------------------------
    | Admin APIs
    |--------------------------------------------------------------------------
    */

    else if (
      pathname.startsWith(
        '/api/admin/'
      )
    ) {
      needsAuth = true;
    }

    /*
    |--------------------------------------------------------------------------
    | Products
    |--------------------------------------------------------------------------
    */

    else if (
      pathname ===
      '/api/products'
    ) {
      needsAuth =
        request.method !== 'GET';
    }

    else if (
      pathname.startsWith(
        '/api/products/'
      )
    ) {
      needsAuth =
        !pathname.endsWith(
          '/seed'
        ) &&
        request.method !== 'GET';

      if (
        pathname.endsWith('/seed')
      ) {
        needsAuth = true;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Categories
    |--------------------------------------------------------------------------
    */

    else if (
      pathname ===
      '/api/categories'
    ) {
      needsAuth =
        request.method !== 'GET';
    }

    else if (
      pathname.startsWith(
        '/api/categories/'
      )
    ) {
      needsAuth = true;
    }

    /*
    |--------------------------------------------------------------------------
    | Orders
    |--------------------------------------------------------------------------
    */

    else if (
      pathname ===
      '/api/orders'
    ) {
      /*
       * ثبت سفارش مشتری با POST
       * خواندن لیست سفارش‌ها با GET
       */
      needsAuth =
        request.method !== 'POST';
    }

    else if (
      pathname.startsWith(
        '/api/orders/'
      )
    ) {
      /*
       * وضعیت پرداخت مشتری باید
       * از این مسیر قابل دریافت باشد.
       */
      needsAuth =
        !pathname.endsWith(
          '/payment'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Final Auth Check
    |--------------------------------------------------------------------------
    */

    if (
      needsAuth &&
      !authenticated
    ) {
      return NextResponse.json(
        {
          error:
            'دسترسی غیرمجاز',
        },
        {
          status: 401,
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/products/:path*',
    '/api/categories/:path*',
    '/api/orders/:path*',
  ],
};