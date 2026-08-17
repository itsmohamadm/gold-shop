'use client';

import Link from 'next/link';
import {
  useParams,
  useRouter,
} from 'next/navigation';
import { useEffect, useState } from 'react';

type OrderItem = {
  id: number;
  productId: number | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  weight: number;
  karat: number;
  subtotal: number;
};

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  notes: string | null;
  total: number;
  status: string;
  paymentStatus: string;
  paymentRef: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

const statusLabels: Record<
  string,
  string
> = {
  pending: 'در انتظار بررسی',
  confirmed: 'تأیید شده',
  preparing: 'در حال آماده‌سازی',
  shipped: 'ارسال شده',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
};

const paymentLabels: Record<
  string,
  string
> = {
  unpaid: 'پرداخت نشده',
  paid: 'پرداخت شده',
};

const orderSteps = [
  {
    key: 'pending',
    label: 'ثبت سفارش',
  },
  {
    key: 'confirmed',
    label: 'تأیید سفارش',
  },
  {
    key: 'preparing',
    label: 'آماده‌سازی',
  },
  {
    key: 'shipped',
    label: 'ارسال',
  },
  {
    key: 'completed',
    label: 'تحویل شده',
  },
];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const orderId =
    typeof params.id === 'string'
      ? params.id
      : '';

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    loadOrder();
  }, [orderId]);

  async function loadOrder() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/customer/orders/${encodeURIComponent(
          orderId
        )}`,
        {
          method: 'GET',
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
          'ORDER DETAILS INVALID RESPONSE:',
          text
        );
      }

      if (res.status === 401) {
        router.push(
          `/account/login?next=/account/orders/${encodeURIComponent(
            orderId
          )}`
        );

        return;
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

      setOrder(data);
    } catch (error: any) {
      console.error(
        'LOAD ORDER DETAILS ERROR:',
        error
      );

      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="container section">
        <span className="eyebrow">
          ORDER DETAILS
        </span>

        <h1>
          جزئیات سفارش
        </h1>

        <p>
          در حال دریافت سفارش...
        </p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="container section">
        <span className="eyebrow">
          ORDER DETAILS
        </span>

        <h1>
          سفارش پیدا نشد
        </h1>

        <p>
          سفارش موردنظر وجود ندارد یا
          به حساب شما تعلق ندارد.
        </p>

        <Link
          href="/account"
          className="button"
        >
          بازگشت به حساب
        </Link>
      </main>
    );
  }

  const currentStepIndex =
    orderSteps.findIndex(
      (step) =>
        step.key === order.status
    );

  return (
    <main className="container section">
      <div className="sectionHead">
        <div>
          <span className="eyebrow">
            ORDER DETAILS
          </span>

          <h1>
            {order.orderNumber}
          </h1>
        </div>

        <strong>
          {order.total.toLocaleString(
            'fa-IR'
          )}{' '}
          تومان
        </strong>
      </div>

      {/* وضعیت سفارش */}
      <section
        className="product"
        style={{
          marginTop: '24px',
        }}
      >
        <h2>
          وضعیت سفارش
        </h2>

        {order.status ===
        'cancelled' ? (
          <div
            style={{
              marginTop: '18px',
              padding: '18px',
              borderRadius: '14px',
              background:
                'rgba(255,80,80,0.08)',
              border:
                '1px solid rgba(255,80,80,0.2)',
            }}
          >
            <strong>
              سفارش لغو شده است
            </strong>

            <p
              style={{
                marginTop: '8px',
              }}
            >
              این سفارش دیگر در حال
              پردازش نیست.
            </p>
          </div>
        ) : (
          <div
            style={{
              marginTop: '24px',
            }}
          >
            {/* نوار وضعیت */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  `repeat(${orderSteps.length}, 1fr)`,
                gap: '8px',
                alignItems: 'start',
              }}
            >
              {orderSteps.map(
                (step, index) => {
                  const isDone =
                    currentStepIndex >=
                    index;

                  const isCurrent =
                    currentStepIndex ===
                    index;

                  return (
                    <div
                      key={step.key}
                      style={{
                        textAlign:
                          'center',
                      }}
                    >
                      <div
                        style={{
                          width:
                            '34px',
                          height:
                            '34px',
                          margin:
                            '0 auto',
                          borderRadius:
                            '50%',
                          display:
                            'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          border:
                            '2px solid',
                          borderColor:
                            isDone
                              ? 'currentColor'
                              : 'rgba(255,255,255,0.2)',
                          opacity:
                            isDone
                              ? 1
                              : 0.45,
                          fontWeight: 700,
                        }}
                      >
                        {isDone
                          ? '✓'
                          : index + 1}
                      </div>

                      <small
                        style={{
                          display:
                            'block',
                          marginTop:
                            '8px',
                          fontWeight:
                            isCurrent
                              ? 700
                              : 400,
                          opacity:
                            isDone
                              ? 1
                              : 0.5,
                        }}
                      >
                        {
                          step.label
                        }
                      </small>

                      {index <
                        orderSteps.length -
                          1 && (
                        <div
                          style={{
                            height:
                              '2px',
                            marginTop:
                              '-18px',
                            marginRight:
                              '50%',
                            marginLeft:
                              '-50%',
                            transform:
                              'translateY(-18px)',
                            opacity:
                              0.2,
                          }}
                        />
                      )}
                    </div>
                  );
                }
              )}
            </div>

            <div
              style={{
                marginTop: '24px',
              }}
            >
              <p>
                وضعیت فعلی:{' '}
                <strong>
                  {statusLabels[
                    order.status
                  ] ||
                    order.status}
                </strong>
              </p>
            </div>
          </div>
        )}

        <hr />

        <p>
          وضعیت پرداخت:{' '}
          <strong>
            {paymentLabels[
              order.paymentStatus
            ] ||
              order.paymentStatus}
          </strong>
        </p>

        {order.paymentRef && (
          <p>
            شماره پیگیری پرداخت:{' '}
            <strong>
              {order.paymentRef}
            </strong>
          </p>
        )}

        {order.paidAt && (
          <p>
            تاریخ پرداخت:{' '}
            {new Date(
              order.paidAt
            ).toLocaleString(
              'fa-IR'
            )}
          </p>
        )}

        <p>
          تاریخ ثبت:{' '}
          {new Date(
            order.createdAt
          ).toLocaleString(
            'fa-IR'
          )}
        </p>
      </section>

      {/* اطلاعات سفارش */}
      <section
        style={{
          marginTop: '24px',
        }}
      >
        <h2>
          اطلاعات سفارش
        </h2>

        <div
          className="product"
          style={{
            marginTop: '12px',
          }}
        >
          <p>
            <strong>
              نام مشتری:
            </strong>{' '}
            {order.customerName}
          </p>

          <p>
            <strong>
              شماره تماس:
            </strong>{' '}
            {order.phone}
          </p>

          <p>
            <strong>
              آدرس:
            </strong>{' '}
            {order.address}
          </p>

          {order.notes && (
            <p>
              <strong>
                توضیحات:
              </strong>{' '}
              {order.notes}
            </p>
          )}
        </div>
      </section>

      {/* محصولات */}
      <section
        style={{
          marginTop: '24px',
        }}
      >
        <h2>
          محصولات سفارش
        </h2>

        <div
          style={{
            display: 'grid',
            gap: '12px',
            marginTop: '12px',
          }}
        >
          {order.items.map(
            (item) => (
              <article
                className="product"
                key={item.id}
              >
                <h3>
                  {item.productName}
                </h3>

                <p>
                  تعداد:{' '}
                  {item.quantity.toLocaleString(
                    'fa-IR'
                  )}
                </p>

                <p>
                  وزن:{' '}
                  {item.weight.toLocaleString(
                    'fa-IR'
                  )}{' '}
                  گرم
                </p>

                <p>
                  عیار:{' '}
                  {item.karat.toLocaleString(
                    'fa-IR'
                  )}
                </p>

                <p>
                  قیمت واحد:{' '}
                  {item.unitPrice.toLocaleString(
                    'fa-IR'
                  )}{' '}
                  تومان
                </p>

                <strong>
                  جمع:{' '}
                  {item.subtotal.toLocaleString(
                    'fa-IR'
                  )}{' '}
                  تومان
                </strong>
              </article>
            )
          )}
        </div>
      </section>

      {/* دکمه‌ها */}
      <div
        style={{
          marginTop: '28px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <Link
          href="/account"
          className="button"
        >
          بازگشت به حساب
        </Link>

        {order.paymentStatus ===
          'unpaid' &&
          order.status !==
            'cancelled' && (
            <Link
              href={`/payment?order=${order.id}`}
              className="button"
            >
              ادامه پرداخت
            </Link>
          )}
      </div>
    </main>
  );
}