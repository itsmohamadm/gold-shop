'use client';

import { useEffect, useMemo, useState } from 'react';

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
  paymentRef?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt?: string;
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

const statuses = [
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'completed',
  'cancelled',
];

const paymentStatuses = [
  'unpaid',
  'paid',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState<number | null>(null);

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('all');

  const [paymentFilter, setPaymentFilter] =
    useState('all');

  const [sortOrder, setSortOrder] =
    useState('newest');

  const [expanded, setExpanded] =
    useState<number | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);

      const res = await fetch(
        '/api/admin/orders',
        {
          cache: 'no-store',
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در دریافت سفارش‌ها'
        );
      }

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        'LOAD ADMIN ORDERS ERROR:',
        error
      );

      alert(
        'خطا در دریافت سفارش‌ها'
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    orderId: number,
    status: string
  ) {
    try {
      setUpdating(orderId);

      const res = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در تغییر وضعیت'
        );
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === data.id
            ? data
            : order
        )
      );
    } catch (error: any) {
      console.error(
        'UPDATE ADMIN ORDER ERROR:',
        error
      );

      alert(
        error?.message ||
          'خطا در تغییر وضعیت سفارش'
      );
    } finally {
      setUpdating(null);
    }
  }

  const filteredOrders =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      const result = orders.filter(
        (order) => {
          const matchesSearch =
            !query ||
            order.orderNumber
              .toLowerCase()
              .includes(query) ||
            order.customerName
              .toLowerCase()
              .includes(query) ||
            order.phone
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === 'all' ||
            order.status ===
              statusFilter;

          const matchesPayment =
            paymentFilter === 'all' ||
            order.paymentStatus ===
              paymentFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPayment
          );
        }
      );

      return [...result].sort(
        (a, b) => {
          const aTime =
            new Date(
              a.createdAt
            ).getTime();

          const bTime =
            new Date(
              b.createdAt
            ).getTime();

          if (
            sortOrder ===
            'oldest'
          ) {
            return aTime - bTime;
          }

          if (
            sortOrder ===
            'price-desc'
          ) {
            return (
              b.total - a.total
            );
          }

          if (
            sortOrder ===
            'price-asc'
          ) {
            return (
              a.total - b.total
            );
          }

          return bTime - aTime;
        }
      );
    }, [
      orders,
      search,
      statusFilter,
      paymentFilter,
      sortOrder,
    ]);

  const stats = useMemo(() => {
    const pending =
      orders.filter(
        (order) =>
          order.status ===
          'pending'
      ).length;

    const active =
      orders.filter(
        (order) =>
          order.status !==
            'cancelled' &&
          order.status !==
            'completed'
      ).length;

    const paid =
      orders.filter(
        (order) =>
          order.paymentStatus ===
          'paid'
      ).length;

    const totalSales =
      orders
        .filter(
          (order) =>
            order.status !==
            'cancelled'
        )
        .reduce(
          (sum, order) =>
            sum + order.total,
          0
        );

    return {
      pending,
      active,
      paid,
      totalSales,
    };
  }, [orders]);

  function clearFilters() {
    setSearch('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setSortOrder('newest');
  }

  if (loading) {
    return (
      <main className="container section">
        <span className="eyebrow">
          ADMIN ORDERS
        </span>

        <h1>
          مدیریت سفارش‌ها
        </h1>

        <p>
          در حال دریافت سفارش‌ها...
        </p>
      </main>
    );
  }

  return (
    <main className="container section">
      <div className="sectionHead">
        <div>
          <span className="eyebrow">
            ADMIN ORDERS
          </span>

          <h1>
            مدیریت سفارش‌ها
          </h1>
        </div>

        <strong>
          {filteredOrders.length.toLocaleString(
            'fa-IR'
          )}{' '}
          از{' '}
          {orders.length.toLocaleString(
            'fa-IR'
          )}{' '}
          سفارش
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
            در انتظار بررسی
          </small>

          <strong
            style={{
              display: 'block',
              marginTop: '8px',
              fontSize: '26px',
            }}
          >
            {stats.pending.toLocaleString(
              'fa-IR'
            )}
          </strong>
        </div>

        <div className="product">
          <small>
            سفارش‌های فعال
          </small>

          <strong
            style={{
              display: 'block',
              marginTop: '8px',
              fontSize: '26px',
            }}
          >
            {stats.active.toLocaleString(
              'fa-IR'
            )}
          </strong>
        </div>

        <div className="product">
          <small>
            پرداخت‌شده
          </small>

          <strong
            style={{
              display: 'block',
              marginTop: '8px',
              fontSize: '26px',
            }}
          >
            {stats.paid.toLocaleString(
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
              fontSize: '20px',
            }}
          >
            {stats.totalSales.toLocaleString(
              'fa-IR'
            )}{' '}
            تومان
          </strong>
        </div>
      </div>

      {/* فیلترها */}
      {orders.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(220px, 1fr) repeat(3, 180px) auto',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <input
            type="text"
            placeholder="شماره سفارش، نام یا شماره تماس..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >
            <option value="all">
              همه وضعیت‌ها
            </option>

            {statuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {
                    statusLabels[
                      status
                    ]
                  }
                </option>
              )
            )}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) =>
              setPaymentFilter(
                e.target.value
              )
            }
          >
            <option value="all">
              همه پرداخت‌ها
            </option>

            {paymentStatuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {
                    paymentLabels[
                      status
                    ]
                  }
                </option>
              )
            )}
          </select>

          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(
                e.target.value
              )
            }
          >
            <option value="newest">
              جدیدترین
            </option>

            <option value="oldest">
              قدیمی‌ترین
            </option>

            <option value="price-desc">
              گران‌ترین
            </option>

            <option value="price-asc">
              ارزان‌ترین
            </option>
          </select>

          <button
            type="button"
            className="button"
            onClick={
              clearFilters
            }
          >
            پاک کردن
          </button>
        </div>
      )}

      {/* سفارش‌ها */}
      {orders.length === 0 ? (
        <div className="product">
          <p>
            هنوز سفارشی ثبت نشده است.
          </p>
        </div>
      ) : filteredOrders.length ===
        0 ? (
        <div className="product">
          <p>
            سفارشی با این فیلتر پیدا نشد.
          </p>

          <button
            type="button"
            className="button"
            onClick={
              clearFilters
            }
          >
            نمایش همه سفارش‌ها
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '18px',
          }}
        >
          {filteredOrders.map(
            (order) => {
              const isExpanded =
                expanded === order.id;

              const isUpdating =
                updating === order.id;

              return (
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
                        'flex-start',
                      gap: '20px',
                      flexWrap:
                        'wrap',
                    }}
                  >
                    <div>
                      <span className="eyebrow">
                        سفارش
                      </span>

                      <h2
                        style={{
                          marginTop:
                            '8px',
                        }}
                      >
                        {
                          order.orderNumber
                        }
                      </h2>

                      <p>
                        مشتری:{' '}
                        <strong>
                          {
                            order.customerName
                          }
                        </strong>
                      </p>

                      <p>
                        تماس:{' '}
                        {order.phone}
                      </p>
                    </div>

                    <div
                      style={{
                        textAlign:
                          'left',
                      }}
                    >
                      <small>
                        مبلغ
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
                        {order.total.toLocaleString(
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
                        وضعیت سفارش
                      </small>

                      <strong
                        style={{
                          display:
                            'block',
                          marginTop:
                            '6px',
                        }}
                      >
                        {
                          statusLabels[
                            order.status
                          ] ||
                            order.status
                        }
                      </strong>
                    </div>

                    <div>
                      <small>
                        وضعیت پرداخت
                      </small>

                      <strong
                        style={{
                          display:
                            'block',
                          marginTop:
                            '6px',
                        }}
                      >
                        {
                          paymentLabels[
                            order.paymentStatus
                          ] ||
                            order.paymentStatus
                        }
                      </strong>
                    </div>

                    <div>
                      <small>
                        تاریخ ثبت
                      </small>

                      <strong
                        style={{
                          display:
                            'block',
                          marginTop:
                            '6px',
                          fontSize:
                            '14px',
                        }}
                      >
                        {new Date(
                          order.createdAt
                        ).toLocaleString(
                          'fa-IR'
                        )}
                      </strong>
                    </div>
                  </div>

                  <div
                    style={{
                      display:
                        'flex',
                      gap: '10px',
                      flexWrap:
                        'wrap',
                      marginTop:
                        '18px',
                    }}
                  >
                    <button
                      type="button"
                      className="button"
                      onClick={() =>
                        setExpanded(
                          isExpanded
                            ? null
                            : order.id
                        )
                      }
                    >
                      {isExpanded
                        ? 'بستن جزئیات'
                        : 'مشاهده جزئیات'}
                    </button>

                    {order.status !==
                      'cancelled' &&
                      order.status !==
                        'completed' && (
                        <button
                          type="button"
                          className="button"
                          disabled={
                            isUpdating
                          }
                          onClick={() =>
                            updateStatus(
                              order.id,
                              'cancelled'
                            )
                          }
                        >
                          {isUpdating
                            ? 'در حال پردازش...'
                            : 'لغو سفارش'}
                        </button>
                      )}
                  </div>

                  {isExpanded && (
                    <div
                      style={{
                        marginTop:
                          '20px',
                      }}
                    >
                      <div
                        className="product"
                        style={{
                          marginBottom:
                            '16px',
                        }}
                      >
                        <h3>
                          اطلاعات مشتری
                        </h3>

                        <p>
                          نام:{' '}
                          {
                            order.customerName
                          }
                        </p>

                        <p>
                          شماره تماس:{' '}
                          {order.phone}
                        </p>

                        <p>
                          آدرس:{' '}
                          {order.address}
                        </p>

                        {order.notes && (
                          <p>
                            توضیحات:{' '}
                            {
                              order.notes
                            }
                          </p>
                        )}
                      </div>

                      <h3>
                        محصولات
                      </h3>

                      <div
                        style={{
                          display:
                            'grid',
                          gap: '8px',
                          marginTop:
                            '12px',
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
                                  '14px',
                                border:
                                  '1px solid rgba(255,255,255,0.1)',
                                borderRadius:
                                  '10px',
                              }}
                            >
                              <strong>
                                {
                                  item.productName
                                }
                              </strong>

                              {' × '}

                              {item.quantity.toLocaleString(
                                'fa-IR'
                              )}

                              <br />

                              <small>
                                وزن:{' '}
                                {item.weight.toLocaleString(
                                  'fa-IR'
                                )}{' '}
                                گرم
                                {' • '}
                                عیار:{' '}
                                {item.karat.toLocaleString(
                                  'fa-IR'
                                )}
                              </small>

                              <br />

                              <small>
                                قیمت واحد:{' '}
                                {item.unitPrice.toLocaleString(
                                  'fa-IR'
                                )}{' '}
                                تومان
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

                      {/* وضعیت */}
                      <div
                        style={{
                          marginTop:
                            '20px',
                          display:
                            'flex',
                          alignItems:
                            'center',
                          gap: '10px',
                          flexWrap:
                            'wrap',
                        }}
                      >
                        <strong>
                          تغییر وضعیت:
                        </strong>

                        <select
                          value={
                            order.status
                          }
                          disabled={
                            isUpdating ||
                            order.status ===
                              'cancelled'
                          }
                          onChange={(
                            e
                          ) =>
                            updateStatus(
                              order.id,
                              e.target.value
                            )
                          }
                        >
                          {statuses.map(
                            (status) => (
                              <option
                                key={
                                  status
                                }
                                value={
                                  status
                                }
                              >
                                {
                                  statusLabels[
                                    status
                                  ]
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      {/* پرداخت */}
                      <div
                        style={{
                          marginTop:
                            '16px',
                          padding:
                            '14px',
                          borderRadius:
                            '10px',
                          background:
                            'rgba(255,255,255,0.04)',
                        }}
                      >
                        <p>
                          وضعیت پرداخت:{' '}
                          <strong>
                            {
                              paymentLabels[
                                order
                                  .paymentStatus
                              ] ||
                                order
                                  .paymentStatus
                            }
                          </strong>
                        </p>

                        {order.paymentRef && (
                          <p>
                            شماره پیگیری:{' '}
                            {
                              order.paymentRef
                            }
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
                      </div>
                    </div>
                  )}

                  <small
                    style={{
                      display:
                        'block',
                      marginTop:
                        '14px',
                      opacity: 0.7,
                    }}
                  >
                    ثبت شده:{' '}
                    {new Date(
                      order.createdAt
                    ).toLocaleString(
                      'fa-IR'
                    )}
                  </small>
                </article>
              );
            }
          )}
        </div>
      )}
    </main>
  );
}