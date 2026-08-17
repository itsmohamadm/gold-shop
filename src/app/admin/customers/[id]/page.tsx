'use client';

import Link from 'next/link';
import {
  useParams,
  useRouter,
} from 'next/navigation';
import {
  useEffect,
  useState,
} from 'react';

type OrderItem = {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  weight: number;
  karat: number;
};

type CustomerOrder = {
  id: number;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
};

type Customer = {
  id: number;
  name: string;
  phone: string;
  address: string | null;
  createdAt: string;
  updatedAt: string;

  stats: {
    orderCount: number;
    pendingOrders: number;
    totalPurchased: number;
    wishlistCount: number;
  };

  orders: CustomerOrder[];

  wishlist: Array<{
    id: number;
    productId: number;
    createdAt: string;
    product: {
      id: number;
      name: string;
      image?: string | null;
      weight: number;
      karat: number;
      stock: number;
      active: boolean;
    };
  }>;
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

export default function AdminCustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const customerId =
    typeof params.id === 'string'
      ? params.id
      : '';

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    loadCustomer();
  }, [customerId]);

  async function loadCustomer() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/admin/customers/${encodeURIComponent(
          customerId
        )}`,
        {
          cache: 'no-store',
        }
      );

      const data =
        await res.json();

      if (res.status === 401) {
        router.push(
          `/admin/login?from=/admin/customers/${encodeURIComponent(
            customerId
          )}`
        );
        return;
      }

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در دریافت مشتری'
        );
      }

      setCustomer(data);
    } catch (error) {
      console.error(
        'LOAD ADMIN CUSTOMER ERROR:',
        error
      );

      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="container section">
        <span className="eyebrow">
          CUSTOMER DETAILS
        </span>

        <h1>
          جزئیات مشتری
        </h1>

        <p>
          در حال دریافت اطلاعات...
        </p>
      </main>
    );
  }

  if (!customer) {
    return (
      <main className="container section">
        <h1>
          مشتری پیدا نشد
        </h1>

        <Link
          href="/admin/customers"
          className="button"
        >
          بازگشت به مشتری‌ها
        </Link>
      </main>
    );
  }

  return (
    <main className="container section">
      <div className="sectionHead">
        <div>
          <span className="eyebrow">
            CUSTOMER DETAILS
          </span>

          <h1>
            {customer.name}
          </h1>

          <p>
            شماره تماس:{' '}
            <strong>
              {customer.phone}
            </strong>
          </p>
        </div>

        <Link
          href="/admin/customers"
          className="button"
        >
          بازگشت به مشتری‌ها
        </Link>
      </div>

      {/* آمار */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(4, minmax(0, 1fr))',
          gap: '12px',
          marginTop: '24px',
        }}
      >
        <div className="product">
          <small>
            سفارش‌ها
          </small>

          <strong
            style={{
              display: 'block',
              marginTop: '8px',
              fontSize: '26px',
            }}
          >
            {customer.stats.orderCount.toLocaleString(
              'fa-IR'
            )}
          </strong>
        </div>

        <div className="product">
          <small>
            در انتظار بررسی
          </small>

          <strong
            style={{
              display: 'block',
              marginTop: '8px',
              fontSize: '26px',
            }}
          >
            {customer.stats.pendingOrders.toLocaleString(
              'fa-IR'
            )}
          </strong>
        </div>

        <div className="product">
          <small>
            مجموع خرید
          </small>

          <strong
            style={{
              display: 'block',
              marginTop: '8px',
              fontSize: '20px',
            }}
          >
            {customer.stats.totalPurchased.toLocaleString(
              'fa-IR'
            )}{' '}
            تومان
          </strong>
        </div>

        <div className="product">
          <small>
            علاقه‌مندی‌ها
          </small>

          <strong
            style={{
              display: 'block',
              marginTop: '8px',
              fontSize: '26px',
            }}
          >
            {customer.stats.wishlistCount.toLocaleString(
              'fa-IR'
            )}
          </strong>
        </div>
      </section>

      {/* اطلاعات مشتری */}
      <section
        style={{
          marginTop: '30px',
        }}
      >
        <h2>
          اطلاعات مشتری
        </h2>

        <div
          className="product"
          style={{
            marginTop: '12px',
          }}
        >
          <p>
            <strong>
              نام:
            </strong>{' '}
            {customer.name}
          </p>

          <p>
            <strong>
              شماره تماس:
            </strong>{' '}
            {customer.phone}
          </p>

          <p>
            <strong>
              آدرس:
            </strong>{' '}
            {customer.address ||
              'ثبت نشده'}
          </p>

          <p>
            <strong>
              تاریخ ثبت‌نام:
            </strong>{' '}
            {new Date(
              customer.createdAt
            ).toLocaleString(
              'fa-IR'
            )}
          </p>
        </div>
      </section>

      {/* سفارش‌ها */}
      <section
        style={{
          marginTop: '30px',
        }}
      >
        <h2>
          سفارش‌های مشتری
        </h2>

        {customer.orders.length ===
        0 ? (
          <p>
            این مشتری هنوز سفارشی ثبت نکرده است.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: '14px',
              marginTop: '12px',
            }}
          >
            {customer.orders.map(
              (order) => (
                <article
                  className="product"
                  key={order.id}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems:
                        'center',
                      gap: '16px',
                      flexWrap:
                        'wrap',
                    }}
                  >
                    <div>
                      <h3>
                        {
                          order.orderNumber
                        }
                      </h3>

                      <p>
                        مبلغ:{' '}
                        {order.total.toLocaleString(
                          'fa-IR'
                        )}{' '}
                        تومان
                      </p>

                      <p>
                        وضعیت:{' '}
                        <strong>
                          {
                            statusLabels[
                              order.status
                            ] ||
                              order.status
                          }
                        </strong>
                      </p>

                      <p>
                        پرداخت:{' '}
                        {
                          paymentLabels[
                            order
                              .paymentStatus
                          ] ||
                            order
                              .paymentStatus
                        }
                      </p>

                      <small>
                        {new Date(
                          order.createdAt
                        ).toLocaleString(
                          'fa-IR'
                        )}
                      </small>
                    </div>

                    <Link
                      href="/admin/orders"
                      className="button"
                    >
                      مدیریت سفارش
                    </Link>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gap: '8px',
                      marginTop: '14px',
                    }}
                  >
                    {order.items.map(
                      (item) => (
                        <div
                          key={
                            item.id
                          }
                          style={{
                            padding:
                              '12px',
                            borderRadius:
                              '10px',
                            background:
                              'rgba(255,255,255,0.04)',
                          }}
                        >
                          <strong>
                            {
                              item.productName
                            }
                          </strong>

                          <br />

                          <small>
                            تعداد:{' '}
                            {item.quantity.toLocaleString(
                              'fa-IR'
                            )}{' '}
                            • وزن:{' '}
                            {item.weight.toLocaleString(
                              'fa-IR'
                            )}{' '}
                            گرم • عیار:{' '}
                            {item.karat.toLocaleString(
                              'fa-IR'
                            )}
                          </small>

                          <br />

                          <small>
                            جمع:{' '}
                            {item.subtotal.toLocaleString(
                              'fa-IR'
                            )}{' '}
                            تومان
                          </small>
                        </div>
                      )
                    )}
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      {/* علاقه‌مندی‌ها */}
      <section
        style={{
          marginTop: '30px',
        }}
      >
        <h2>
          علاقه‌مندی‌های مشتری
        </h2>

        {customer.wishlist.length ===
        0 ? (
          <p>
            این مشتری علاقه‌مندی‌ای ثبت نکرده است.
          </p>
        ) : (
          <div
            className="products"
            style={{
              marginTop: '12px',
            }}
          >
            {customer.wishlist.map(
              (item) => (
                <article
                  className="product"
                  key={item.id}
                >
                  <div
                    className="productImage"
                  >
                    {item.product.image ? (
                      <img
                        src={
                          item
                            .product
                            .image
                        }
                        alt={
                          item.product.name
                        }
                        style={{
                          width:
                            '100%',
                          height:
                            '100%',
                          objectFit:
                            'cover',
                          borderRadius:
                            '12px',
                        }}
                      />
                    ) : (
                      <span>
                        {
                          item.product
                            .karat
                        }K
                      </span>
                    )}
                  </div>

                  <h3>
                    {
                      item.product
                        .name
                    }
                  </h3>

                  <p>
                    وزن:{' '}
                    {item.product.weight.toLocaleString(
                      'fa-IR'
                    )}{' '}
                    گرم
                  </p>

                  <p>
                    عیار:{' '}
                    {item.product.karat.toLocaleString(
                      'fa-IR'
                    )}
                  </p>

                  <p>
                    وضعیت:{' '}
                    {item.product
                      .active
                      ? item.product
                          .stock >
                        0
                        ? 'موجود'
                        : 'ناموجود'
                      : 'غیرفعال'}
                  </p>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}