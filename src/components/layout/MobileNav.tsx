'use client';

import Link from 'next/link';
import { useState } from 'react';

type Props = {
  isAdmin: boolean;
};

export default function MobileNav({ isAdmin }: Props) {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="mobileMenuButton"
        aria-label={open ? 'بستن منو' : 'باز کردن منو'}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? '×' : '☰'}
      </button>

      {open && (
        <div className="mobileMenu">
          <div className="mobileMenuInner">

            <Link
              href="/"
              onClick={closeMenu}
              className="mobileMenuItem"
            >
              خانه
            </Link>

            <Link
              href="/shop"
              onClick={closeMenu}
              className="mobileMenuItem"
            >
              فروشگاه
            </Link>

            <Link
              href="/account"
              onClick={closeMenu}
              className="mobileMenuItem"
            >
              حساب من
            </Link>

            <Link
              href="/account/wishlist"
              onClick={closeMenu}
              className="mobileMenuItem"
            >
              علاقه‌مندی‌ها
            </Link>

            <Link
              href="/cart"
              onClick={closeMenu}
              className="mobileMenuItem"
            >
              سبد خرید
            </Link>

            {isAdmin && (
              <>
                <div className="mobileMenuDivider" />

                <small className="mobileMenuTitle">
                  مدیریت
                </small>

                <Link
                  href="/admin"
                  onClick={closeMenu}
                  className="mobileMenuItem"
                >
                  پنل مدیریت
                </Link>

                <Link
                  href="/admin/categories"
                  onClick={closeMenu}
                  className="mobileMenuItem"
                >
                  دسته‌بندی‌ها
                </Link>

                <Link
                  href="/admin/customers"
                  onClick={closeMenu}
                  className="mobileMenuItem"
                >
                  مشتری‌ها
                </Link>

                <Link
                  href="/admin/orders"
                  onClick={closeMenu}
                  className="mobileMenuItem"
                >
                  سفارش‌ها
                </Link>

                <Link
                  href="/admin/security"
                  onClick={closeMenu}
                  className="mobileMenuItem"
                >
                  امنیت
                </Link>
              </>
            )}

            <div className="mobileMenuDivider" />

            <div className="mobileAccountLinks">
              <Link
                href="/account/login"
                onClick={closeMenu}
              >
                ورود
              </Link>

              <span>/</span>

              <Link
                href="/account/register"
                onClick={closeMenu}
              >
                ثبت‌نام
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}