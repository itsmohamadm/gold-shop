'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Customer = {
  id: number;
  name: string;
  phone: string;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  pendingOrders: number;
  totalPurchased: number;

  lastOrder: {
    id: number;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  } | null;
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

export default function AdminCustomersPage() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      setLoading(true);

      const res = await fetch(
        '/api/admin/customers',
        {
          cache: 'no-store',
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در دریافت مشتری‌ها'
        );
      }

      setCustomers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error: any) {
      console.error(
        'LOAD CUSTOMERS ERROR:',
        error
      );

      alert(
        error?.message ||
          'خطا در دریافت مشتری‌ها'
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return customers;
      }

      return customers.filter(
        (customer) =>
          customer.name
            .toLowerCase()
            .includes(query) ||
          customer.phone
            .toLowerCase()
            .includes(query)
      );
    }, [
      customers,
      search,
    ]);

  const totalCustomers =
    customers.length;

  const totalOrders =
    customers.reduce(
      (sum, customer) =>
        sum + customer.orderCount,
      0
    );

  const totalSales =
    customers.reduce(
      (sum, customer) =>
        sum +
        customer.totalPurchased,
      0
    );

  const activeCustomers =
    customers.filter(
      (customer) =>
        customer.orderCount > 0
    ).length;

  if (loading) {
    return (
      <main className="container section">
        <span className="eyebrow">
          ADMIN CUSTOMERS
        </span>

        <h1>
          مدیریت مشتری‌ها
        </h1>

        <p>
          در حال دریافت مشتری‌ها...
        </p>
      </main>
    );
  }

  return (
    <main className="container section">
      <div className="sectionHead">
        <div>
          <span className="eyebrow">
            ADMIN CUSTOMERS
          </span>

          <h1>
            مدیریت مشتری‌ها
          </h1>
        </div>

        <strong>
          {filteredCustomers.length.toLocaleString(
            'fa-IR'
          )}{' '}
          مشتری
        </strong>
      </div>

      {/* آمار */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(4, minmax(0, 1fr))',
          gap: '12px',
          marginTop: '24px',
          marginBottom: '24px',
        }}
      >
        <div className="product">
          <small>
            کل مشتری‌ها
          </small>

          <strong
            style={{
              display: 'block',
              marginTop: '8px',
              fontSize: '26px',
            }}
          >
            {totalCustomers.toLocaleString(
              'fa-IR'
            )}
          </strong>
        </div>

        <div className="product">
          <small>
            مشتری دارای سفارش
          </small>

          <strong
            style={{
              display: 'block',
              marginTop: '8px',
              fontSize: '26px',
            }}
          >
            {activeCustomers.toLocaleString(
              'fa-IR'
            )}
          </strong>
        </div>

        <div className="product">
          <small>
            کل سفارش‌ها
          </small>

          <strong
            style={{
              display: 'block',
              marginTop: '8px',
              fontSize: '26px',
            }}
          >
            {totalOrders.toLocaleString(
              'fa-IR'
            )}
          </strong>
        </div>

        <div className="product">
          <small>
            مجموع فروش
          </small>

          <strong
            style={{
              display: 'block',
              marginTop: '8px',
              fontSize: '21px',
            }}
          >
            {totalSales.toLocaleString(
              'fa-IR'
            )}{' '}
            تومان
          </strong>
        </div>
      </div>

      {/* جستجو */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="search"
          placeholder="جستجو با نام یا شماره تماس..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={{
            flex: 1,
            minWidth: '260px',
          }}
        />

        <button
          type="button"
          className="button"
          onClick={() =>
            setSearch('')
          }
        >
          پاک کردن
        </button>
      </div>

      {/* مشتری‌ها */}
      {filteredCustomers.length ===
      0 ? (
        <div className="product">
          <p>
            مشتری‌ای پیدا نشد.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '16px',
          }}
        >
          {filteredCustomers.map(
            (customer) => (
              <article
                key={customer.id}
                className="product"
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems:
                      'flex-start',
                    gap: '20px',
                    flexWrap:
                      'wrap',
                  }}
                >
                  <div>
                    <span className="eyebrow">
                      CUSTOMER
                    </span>

                    <h2
                      style={{
                        marginTop:
                          '8px',
                      }}
                    >
                      {customer.name}
                    </h2>

                    <p>
                      شماره تماس:{' '}
                      <strong>
                        {customer.phone}
                      </strong>
                    </p>

                    <p>
                      آدرس:{' '}
                      {customer.address ||
                        'ثبت نشده'}
                    </p>

                    <small
                      style={{
                        opacity: 0.7,
                      }}
                    >
                      ثبت‌نام:{' '}
                      {new Date(
                        customer.createdAt
                      ).toLocaleString(
                        'fa-IR'
                      )}
                    </small>
                  </div>

                  <div
                    style={{
                      textAlign: 'left',
                    }}
                  >
                    <small>
                      مجموع خرید
                    </small>

                    <strong
                      style={{
                        display:
                          'block',
                        marginTop:
                          '6px',
                        fontSize:
                          '20px',
                      }}
                    >
                      {customer.totalPurchased.toLocaleString(
                        'fa-IR'
                      )}{' '}
                      تومان
                    </strong>
                  </div>
                </div>

                <hr />

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(3, minmax(0, 1fr))',
                    gap: '10px',
                  }}
                >
                  <div>
                    <small>
                      سفارش‌ها
                    </small>

                    <strong
                      style={{
                        display:
                          'block',
                        marginTop:
                          '5px',
                      }}
                    >
                      {customer.orderCount.toLocaleString(
                        'fa-IR'
                      )}
                    </strong>
                  </div>

                  <div>
                    <small>
                      در انتظار بررسی
                    </small>

                    <strong
                      style={{
                        display:
                          'block',
                        marginTop:
                          '5px',
                      }}
                    >
                      {customer.pendingOrders.toLocaleString(
                        'fa-IR'
                      )}
                    </strong>
                  </div>

                  <div>
                    <small>
                      آخرین سفارش
                    </small>

                    <strong
                      style={{
                        display:
                          'block',
                        marginTop:
                          '5px',
                      }}
                    >
                      {customer.lastOrder
                        ? customer.lastOrder
                            .status ===
                          'cancelled'
                          ? 'لغو شده'
                          : statusLabels[
                              customer
                                .lastOrder
                                .status
                            ] ||
                            customer
                              .lastOrder
                              .status
                        : 'ندارد'}
                    </strong>
                  </div>
                </div>

                {customer.lastOrder && (
                  <div
                    style={{
                      marginTop:
                        '16px',
                      padding:
                        '14px',
                      borderRadius:
                        '12px',
                      background:
                        'rgba(255,255,255,0.04)',
                    }}
                  >
                    <p>
                      آخرین سفارش:{' '}
                      <strong>
                        سفارش #
                        {
                          customer
                            .lastOrder
                            .id
                        }
                      </strong>
                    </p>

                    <p>
                      مبلغ:{' '}
                      {customer.lastOrder.total.toLocaleString(
                        'fa-IR'
                      )}{' '}
                      تومان
                    </p>

                    <p>
                      پرداخت:{' '}
                      {
                        paymentLabels[
                          customer
                            .lastOrder
                            .paymentStatus
                        ] ||
                          customer
                            .lastOrder
                            .paymentStatus
                      }
                    </p>

                    <small>
                      {new Date(
                        customer
                          .lastOrder
                          .createdAt
                      ).toLocaleString(
                        'fa-IR'
                      )}
                    </small>

                    <div
                      style={{
                        marginTop:
                          '12px',
                        display: 'flex',
                        gap: '10px',
                        flexWrap:
                          'wrap',
                      }}
                    >
                      <Link
                        href="/admin/orders"
                        className="button"
                      >
                        مشاهده سفارش‌ها
                      </Link>

                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="button"
                      >
                        مشاهده جزئیات
                      </Link>
                    </div>
                  </div>
                )}
              </article>
            )
          )}
        </div>
      )}
    </main>
  );
}