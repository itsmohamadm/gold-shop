'use client';

import Link from 'next/link';

import {
  useSearchParams,
} from 'next/navigation';

import {
  useEffect,
  useState,
} from 'react';

type PaymentData = {
  id: number;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentRef: string | null;
  paidAt: string | null;
};

export default function PaymentPage() {
  const searchParams =
    useSearchParams();

  const orderId =
    searchParams.get('order');

  const [payment, setPayment] =
    useState<PaymentData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState('');

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    loadPayment(orderId);
  }, [orderId]);

  async function loadPayment(
    currentOrderId: string
  ) {
    try {
      setLoading(true);
      setErrorMessage('');

      const res =
        await fetch(
          `/api/orders/${encodeURIComponent(
            currentOrderId
          )}/payment`,
          {
            cache: 'no-store',
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
          'PAYMENT INVALID RESPONSE:',
          text
        );
      }

      if (!res.ok) {
        throw new Error(
          data?.error ||
            `خطا در دریافت سفارش (${res.status})`
        );
      }

      if (!data) {
        throw new Error(
          'پاسخ نامعتبر از سرور دریافت شد'
        );
      }

      setPayment(data);
    } catch (error: any) {
      console.error(
        'LOAD PAYMENT ERROR:',
        error
      );

      setPayment(null);

      setErrorMessage(
        error?.message ||
          'خطا در دریافت اطلاعات پرداخت'
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="container section">
        <div className="checkoutEmptyState">
          <span className="eyebrow">
            PAYMENT
          </span>

          <h1>
            پرداخت سفارش
          </h1>

          <p>
            در حال دریافت اطلاعات سفارش...
          </p>
        </div>
      </main>
    );
  }

  if (!orderId) {
    return (
      <main className="container section">
        <div className="checkoutEmptyState">
          <h1>
            شماره سفارش مشخص نیست
          </h1>

          <p>
            لینک پرداخت فاقد شناسه سفارش است.
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

  if (!payment) {
    return (
      <main className="container section">
        <div className="checkoutEmptyState">
          <span className="eyebrow">
            PAYMENT
          </span>

          <h1>
            دریافت سفارش ناموفق بود
          </h1>

          <p>
            {errorMessage ||
              'اطلاعات سفارش پیدا نشد.'}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent:
                'center',
              flexWrap: 'wrap',
              marginTop: '20px',
            }}
          >
            <button
              type="button"
              className="button"
              onClick={() =>
                loadPayment(orderId)
              }
            >
              تلاش دوباره
            </button>

            <Link
              href="/shop"
              className="button"
            >
              بازگشت به فروشگاه
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container section">
      <div
        style={{
          maxWidth: '720px',
          margin: '30px auto',
        }}
      >
        <div className="checkoutFormCard">
          <span className="eyebrow">
            PAYMENT
          </span>

          <h1
            style={{
              marginTop: '10px',
            }}
          >
            پرداخت سفارش
          </h1>

          <p
            style={{
              color:
                'var(--text-soft)',
            }}
          >
            شماره سفارش:{' '}
            <strong>
              {payment.orderNumber}
            </strong>
          </p>

          <div
            className="productPricePanel"
            style={{
              marginTop: '24px',
            }}
          >
            <small>
              مبلغ سفارش
            </small>

            <strong
              style={{
                display: 'block',
                marginTop: '8px',
                fontSize: '34px',
                color:
                  'var(--gold-light)',
              }}
            >
              {payment.total.toLocaleString(
                'fa-IR'
              )}{' '}
              تومان
            </strong>

            <p
              style={{
                marginTop: '16px',
              }}
            >
              وضعیت پرداخت:{' '}
              <strong>
                {payment.paymentStatus ===
                'paid'
                  ? 'پرداخت شده'
                  : 'پرداخت نشده'}
              </strong>
            </p>

            {payment.paymentRef && (
              <p>
                شماره پیگیری:{' '}
                <strong>
                  {payment.paymentRef}
                </strong>
              </p>
            )}

            {payment.paidAt && (
              <p>
                تاریخ پرداخت:{' '}
                {new Date(
                  payment.paidAt
                ).toLocaleString(
                  'fa-IR'
                )}
              </p>
            )}
          </div>

          {payment.paymentStatus ===
          'unpaid' ? (
            <div
              style={{
                marginTop: '22px',
              }}
            >
              <div className="checkoutSecurityNote">
                <span>
                  !
                </span>

                <div>
                  <strong>
                    درگاه هنوز متصل نشده است
                  </strong>

                  <small>
                    سفارش ثبت شده، اما پرداخت
                    آنلاین هنوز در پروژه فعال
                    نشده است.
                  </small>
                </div>
              </div>

              <button
                type="button"
                className="button"
                disabled
                style={{
                  width: '100%',
                  marginTop: '14px',
                  opacity: 0.5,
                }}
              >
                پرداخت آنلاین
              </button>
            </div>
          ) : (
            <div
              className="checkoutSecurityNote"
              style={{
                marginTop: '22px',
              }}
            >
              <span>
                ✓
              </span>

              <div>
                <strong>
                  پرداخت با موفقیت انجام شده است
                </strong>

                <small>
                  سفارش شما پرداخت شده است.
                </small>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '20px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/account"
              className="button"
            >
              حساب کاربری
            </Link>

            <Link
              href="/shop"
              className="button"
            >
              بازگشت به فروشگاه
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}