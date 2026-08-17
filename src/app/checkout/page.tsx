'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  useCart,
} from '@/components/cart/CartProvider';

export default function CheckoutPage() {
  const router = useRouter();

  const {
    items,
    hydrated,
    totalPrice,
    totalItems,
  } = useCart();

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

    if (!hydrated) {
      return;
    }

    if (items.length === 0) {
      alert(
        'سبد خرید خالی است'
      );

      return;
    }

    try {
      setSubmitting(true);

      // بررسی ورود مشتری
      const sessionRes =
        await fetch(
          '/api/customer/me',
          {
            cache: 'no-store',
          }
        );

      if (
        sessionRes.status ===
        401
      ) {
        router.push(
          '/account/login?next=/checkout'
        );

        return;
      }

      if (!sessionRes.ok) {
        throw new Error(
          'خطا در بررسی حساب کاربری'
        );
      }

      // ثبت سفارش
      const res =
        await fetch(
          '/api/orders',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              customerName,
              phone,
              address,
              notes,
              items: items.map(
                (item) => ({
                  productId:
                    item.id,
                  quantity:
                    item.quantity,
                })
              ),
            }),
          }
        );

      const text =
        await res.text();

      let data: any = null;

      try {
        data = text
          ? JSON.parse(text)
          : null;
      } catch {
        console.error(
          'ORDER API INVALID RESPONSE:',
          text
        );
      }

      if (!res.ok) {
        throw new Error(
          data?.error ||
            `خطا در ثبت سفارش (${res.status})`
        );
      }

      if (
        !data?.success ||
        !data?.order
      ) {
        throw new Error(
          'پاسخ نامعتبر از سرور دریافت شد'
        );
      }

      router.push(
        `/payment?order=${data.order.id}`
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

  if (!hydrated) {
    return (
      <main className="container section">
        <div className="checkoutEmptyState">
          <span className="eyebrow">
            CHECKOUT
          </span>

          <h1>
            تکمیل سفارش
          </h1>

          <p>
            در حال بارگذاری سبد خرید...
          </p>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="container section">
        <div className="checkoutEmptyState">
          <div className="checkoutEmptyIcon">
            🛒
          </div>

          <span className="eyebrow">
            CHECKOUT
          </span>

          <h1>
            تکمیل سفارش
          </h1>

          <p>
            سبد خرید شما خالی است.
          </p>

          <Link
            href="/shop"
            className="button"
          >
            بازگشت به فروشگاه
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container section checkoutPage">
      {/* Header */}
      <div className="sectionHead">
        <div>
          <span className="eyebrow">
            CHECKOUT
          </span>

          <h1
            style={{
              marginTop: '10px',
            }}
          >
            تکمیل سفارش
          </h1>

          <p
            style={{
              color:
                'var(--text-soft)',
              marginTop: '8px',
            }}
          >
            اطلاعات دریافت سفارش را وارد
            کنید تا سفارش ثبت شود.
          </p>
        </div>

        <div className="checkoutHeaderTotal">
          <small>
            مبلغ سبد
          </small>

          <strong>
            {totalPrice.toLocaleString(
              'fa-IR'
            )}{' '}
            تومان
          </strong>
        </div>
      </div>

      {/* مراحل */}
      <div className="checkoutSteps">
        <div className="checkoutStep active">
          <span>
            ۱
          </span>

          <div>
            <strong>
              اطلاعات سفارش
            </strong>

            <small>
              اطلاعات دریافت
            </small>
          </div>
        </div>

        <div className="checkoutStepLine" />

        <div className="checkoutStep">
          <span>
            ۲
          </span>

          <div>
            <strong>
              پرداخت
            </strong>

            <small>
              پرداخت سفارش
            </small>
          </div>
        </div>

        <div className="checkoutStepLine" />

        <div className="checkoutStep">
          <span>
            ۳
          </span>

          <div>
            <strong>
              تکمیل
            </strong>

            <small>
              ثبت نهایی
            </small>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="checkoutGrid">
        {/* فرم */}
        <section className="checkoutFormCard">
          <div className="checkoutCardHead">
            <span className="eyebrow">
              CUSTOMER INFORMATION
            </span>

            <h2>
              اطلاعات دریافت سفارش
            </h2>

            <p>
              اطلاعات را با دقت وارد کنید.
            </p>
          </div>

          <form
            onSubmit={submitOrder}
            className="checkoutForm"
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
                placeholder="مثلاً محمد احمدی"
                autoComplete="name"
                required
              />
            </label>

            <label>
              شماره تماس

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                placeholder="09xxxxxxxxx"
                autoComplete="tel"
                required
              />
            </label>

            <label>
              آدرس کامل

              <textarea
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                rows={5}
                placeholder="استان، شهر، خیابان، پلاک، واحد..."
                autoComplete="street-address"
                required
              />
            </label>

            <label>
              توضیحات سفارش
              <span
                style={{
                  color:
                    'var(--text-muted)',
                  fontSize:
                    '11px',
                  fontWeight: 400,
                }}
              >
                اختیاری
              </span>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                rows={3}
                placeholder="توضیحات اضافی درباره سفارش..."
              />
            </label>

            <div className="checkoutSecurityNote">
              <span>
                ✓
              </span>

              <div>
                <strong>
                  خرید امن
                </strong>

                <small>
                  مبلغ نهایی سفارش در سرور
                  دوباره محاسبه می‌شود.
                </small>
              </div>
            </div>

            <button
              type="submit"
              className="button checkoutSubmit"
              disabled={submitting}
            >
              {submitting
                ? 'در حال ثبت سفارش...'
                : 'ادامه و رفتن به پرداخت'}
            </button>
          </form>
        </section>

        {/* خلاصه سفارش */}
        <aside className="checkoutSummary">
          <div className="checkoutSummaryHead">
            <span className="eyebrow">
              ORDER SUMMARY
            </span>

            <h2>
              خلاصه سفارش
            </h2>
          </div>

          <div className="checkoutItems">
            {items.map((item) => (
              <div
                key={item.id}
                className="checkoutItem"
              >
                <div className="checkoutItemImage">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                    />
                  ) : (
                    <span>
                      {item.karat}K
                    </span>
                  )}
                </div>

                <div className="checkoutItemInfo">
                  <strong>
                    {item.name}
                  </strong>

                  <small>
                    {item.quantity.toLocaleString(
                      'fa-IR'
                    )}{' '}
                    عدد ×{' '}
                    {item.price.toLocaleString(
                      'fa-IR'
                    )}{' '}
                    تومان
                  </small>
                </div>

                <strong className="checkoutItemTotal">
                  {(
                    item.price *
                    item.quantity
                  ).toLocaleString(
                    'fa-IR'
                  )}
                </strong>
              </div>
            ))}
          </div>

          <div className="checkoutSummaryRows">
            <div>
              <span>
                تعداد کالا
              </span>

              <strong>
                {totalItems.toLocaleString(
                  'fa-IR'
                )}
              </strong>
            </div>

            <div>
              <span>
                وزن کل
              </span>

              <strong>
                {items
                  .reduce(
                    (
                      sum,
                      item
                    ) =>
                      sum +
                      item.weight *
                        item.quantity,
                    0
                  )
                  .toLocaleString(
                    'fa-IR',
                    {
                      maximumFractionDigits: 2,
                    }
                  )}{' '}
                گرم
              </strong>
            </div>

            <div className="checkoutGrandTotal">
              <span>
                مبلغ نهایی
              </span>

              <strong>
                {totalPrice.toLocaleString(
                  'fa-IR'
                )}{' '}
                تومان
              </strong>
            </div>
          </div>

          <Link
            href="/cart"
            className="checkoutBackCart"
          >
            ← بازگشت و ویرایش سبد
          </Link>
        </aside>
      </div>
    </main>
  );
}