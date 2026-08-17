'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useCart } from '@/components/cart/CartProvider';

export default function CheckoutPage() {
  const router = useRouter();

const {
  items,
  hydrated,
  totalPrice,
  clearCart,
} = useCart();

if (!hydrated) {
  return (
    <main className="container section">
      <p>در حال بارگذاری سبد خرید...</p>
    </main>
  );
}

if (items.length === 0) {
  // ...
}
  const [customerName, setCustomerName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [address, setAddress] =
    useState('');

  const [notes, setNotes] =
    useState('');

  const [submitting, setSubmitting] =
    useState(false);

  async function submitOrder(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (items.length === 0) {
      alert('سبد خرید خالی است');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          phone,
          address,
          notes,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || 'خطا در ثبت سفارش'
        );
      }

      clearCart();

      router.push(
        `/order-success?order=${encodeURIComponent(
          data.order.orderNumber
        )}`
      );
    } catch (error: any) {
      console.error(
        'CHECKOUT ERROR:',
        error
      );

      alert(
        error?.message ||
          'خطا در ثبت سفارش'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="container section">
        <h1>تکمیل سفارش</h1>

        <p>سبد خرید شما خالی است.</p>

        <Link
          href="/shop"
          className="button"
        >
          بازگشت به فروشگاه
        </Link>
      </main>
    );
  }

  return (
    <main className="container section">
      <div className="sectionHead">
        <div>
          <span className="eyebrow">
            CHECKOUT
          </span>

          <h1>تکمیل سفارش</h1>
        </div>

        <strong>
          {totalPrice.toLocaleString(
            'fa-IR'
          )}{' '}
          تومان
        </strong>
      </div>

      <form
        onSubmit={submitOrder}
        style={{
          display: 'grid',
          gap: '14px',
          maxWidth: '700px',
          marginTop: '24px',
        }}
      >
        <label>
          نام و نام خانوادگی

          <input
            type="text"
            value={customerName}
            onChange={(e) =>
              setCustomerName(
                e.target.value
              )
            }
            required
          />
        </label>

        <label>
          شماره تماس

          <input
            type="tel"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            required
          />
        </label>

        <label>
          آدرس

          <textarea
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
            rows={5}
            required
          />
        </label>

        <label>
          توضیحات سفارش

          <textarea
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            rows={3}
          />
        </label>

        <div
          style={{
            padding: '20px',
            marginTop: '10px',
          }}
        >
          <strong>
            مبلغ کل:{' '}
            {totalPrice.toLocaleString(
              'fa-IR'
            )}{' '}
            تومان
          </strong>
        </div>

        <button
          type="submit"
          className="button"
          disabled={submitting}
        >
          {submitting
            ? 'در حال ثبت سفارش...'
            : 'ثبت سفارش'}
        </button>
      </form>
    </main>
  );
}