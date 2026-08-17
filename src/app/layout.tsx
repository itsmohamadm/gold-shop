import './globals.css';

import Link from 'next/link';
import { cookies } from 'next/headers';

import {
  CartProvider,
} from '@/components/cart/CartProvider';

import CustomerNav from '@/components/customer/CustomerNav';
import CartNav from '@/components/cart/CartNav';

import MobileNav from '@/components/layout/MobileNav';
import ThemeToggle from '@/components/layout/ThemeToggle';

import {
  verifyAdminSession,
} from '@/lib/admin-auth';

export const metadata = {
  title: 'طلای زرین | فروشگاه طلا',
  description:
    'فروشگاه آنلاین طلا با قیمت‌گذاری پویا',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore =
    cookies();

  const adminToken =
    cookieStore.get(
      'gold_admin_session'
    )?.value;

  const isAdmin =
    await verifyAdminSession(
      adminToken
    );

  return (
    <html
      lang="fa"
      dir="rtl"
      data-theme="dark"
    >
      <body>
        <CartProvider>
          <header className="siteHeader">
            <div className="container">
              <div className="siteHeaderInner">

                {/* برند */}
                <Link
                  href="/"
                  className="brand"
                >
                  <span className="brandIcon">
                    ✦
                  </span>

                  <span>
                    طلای زرین
                  </span>
                </Link>

                {/* منوی دسکتاپ */}
                <div className="desktopNavGlass">
                  <nav className="desktopNav">
                    <Link href="/">
                      خانه
                    </Link>

                    <Link href="/shop">
                      فروشگاه
                    </Link>

                    {isAdmin && (
                      <>
                        <Link href="/admin">
                          پنل مدیریت
                        </Link>

                        <Link href="/admin/categories">
                          دسته‌بندی‌ها
                        </Link>

                        <Link href="/admin/customers">
                          مشتری‌ها
                        </Link>

                        <Link href="/admin/orders">
                          سفارش‌ها
                        </Link>

                        <Link href="/admin/security">
                          امنیت
                        </Link>
                      </>
                    )}

                    <CustomerNav />

                    <CartNav />

                    <ThemeToggle />
                  </nav>
                </div>

                {/* منوی موبایل */}
                <div className="mobileOnlyNav">
                  <div className="mobileHeaderActions">
                    <ThemeToggle />

                    <MobileNav
                      isAdmin={isAdmin}
                    />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {children}
        </CartProvider>
      </body>
    </html>
  );
}