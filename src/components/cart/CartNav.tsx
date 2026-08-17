'use client';

import Link from 'next/link';

import { useCart } from './CartProvider';

export default function CartNav() {
  const {
    totalItems,
    hydrated,
  } = useCart();

  return (
    <Link href="/cart">
      سبد خرید
      {hydrated &&
        totalItems > 0 && (
          <span
            style={{
              marginRight: '6px',
              fontSize: '13px',
              opacity: 0.8,
            }}
          >
            (
            {totalItems.toLocaleString(
              'fa-IR'
            )}
            )
          </span>
        )}
    </Link>
  );
}