'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type Customer = {
  id: number;
  name: string;
};

export default function CustomerNav() {
  const pathname = usePathname();

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function loadCustomer() {
    try {
      setLoading(true);

      const res = await fetch(
        '/api/customer/me',
        {
          cache: 'no-store',
        }
      );

      if (!res.ok) {
        setCustomer(null);
        return;
      }

      const data =
        await res.json();

      setCustomer(data);
    } catch (error) {
      console.error(
        'CUSTOMER NAV ERROR:',
        error
      );

      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomer();
  }, [pathname]);

  async function logout() {
    try {
      await fetch(
        '/api/customer/logout',
        {
          method: 'POST',
        }
      );
    } catch (error) {
      console.error(
        'CUSTOMER LOGOUT ERROR:',
        error
      );
    } finally {
      setCustomer(null);
      window.location.href = '/';
    }
  }

  if (loading) {
    return null;
  }

  if (!customer) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <Link href="/account/login">
          ورود
        </Link>

        <Link href="/account/register">
          ثبت‌نام
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <Link href="/account">
        حساب من
      </Link>

      <Link href="/account/wishlist">
        علاقه‌مندی‌ها
      </Link>

      <button
        type="button"
        onClick={logout}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          font: 'inherit',
          color: 'inherit',
          cursor: 'pointer',
        }}
      >
        خروج
      </button>
    </div>
  );
}