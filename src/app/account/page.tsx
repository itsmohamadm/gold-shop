'use client';

import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';

type Customer = {
  id: number;
  name: string;
  phone: string;
  address: string | null;
};

type Order = {
  id: number;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus?: string;
  createdAt: string;
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

export default function AccountPage() {
  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [editingProfile, setEditingProfile] =
    useState(false);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [name, setName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [address, setAddress] =
    useState('');

  const [
    showPasswordForm,
    setShowPasswordForm,
  ] = useState(false);

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState('');

  const [
    newPassword,
    setNewPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    savingPassword,
    setSavingPassword,
  ] = useState(false);

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    try {
      setLoading(true);

      const [
        customerRes,
        ordersRes,
      ] = await Promise.all([
        fetch('/api/customer/me', {
          cache: 'no-store',
        }),
        fetch(
          '/api/customer/orders',
          {
            cache: 'no-store',
          }
        ),
      ]);

      if (
        customerRes.status === 401 ||
        ordersRes.status === 401
      ) {
        window.location.href =
          '/account/login';

        return;
      }

      const customerData =
        await customerRes.json();

      const ordersData =
        await ordersRes.json();

      setCustomer(customerData);

      setOrders(
        Array.isArray(ordersData)
          ? ordersData
          : []
      );

      setName(
        customerData.name || ''
      );

      setPhone(
        customerData.phone || ''
      );

      setAddress(
        customerData.address || ''
      );
    } catch (error) {
      console.error(
        'LOAD ACCOUNT ERROR:',
        error
      );
    } finally {
      setLoading(false);
    }
  }

  function startEditingProfile() {
    if (!customer) return;

    setName(customer.name);
    setPhone(customer.phone);
    setAddress(
      customer.address || ''
    );

    setEditingProfile(true);
  }

  function cancelEditingProfile() {
    if (!customer) return;

    setName(customer.name);
    setPhone(customer.phone);
    setAddress(
      customer.address || ''
    );

    setEditingProfile(false);
  }

  async function saveProfile(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setSavingProfile(true);

      const res = await fetch(
        '/api/customer/me',
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            name,
            phone,
            address,
          }),
        }
      );

      const data =
        await res.json();

      if (res.status === 401) {
        window.location.href =
          '/account/login';

        return;
      }

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در ذخیره پروفایل'
        );
      }

      setCustomer(data);
      setName(data.name);
      setPhone(data.phone);
      setAddress(
        data.address || ''
      );

      setEditingProfile(false);

      alert(
        'پروفایل با موفقیت به‌روزرسانی شد'
      );
    } catch (error: any) {
      console.error(
        'SAVE PROFILE ERROR:',
        error
      );

      alert(
        error?.message ||
          'خطا در ذخیره پروفایل'
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (
      newPassword !==
      confirmPassword
    ) {
      alert(
        'تکرار رمز جدید یکسان نیست'
      );

      return;
    }

    if (newPassword.length < 8) {
      alert(
        'رمز جدید باید حداقل ۸ کاراکتر باشد'
      );

      return;
    }

    try {
      setSavingPassword(true);

      const res = await fetch(
        '/api/customer/password',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data =
        await res.json();

      if (res.status === 401) {
        window.location.href =
          '/account/login';

        return;
      }

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در تغییر رمز'
        );
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);

      alert(
        'رمز عبور با موفقیت تغییر کرد'
      );
    } catch (error: any) {
      console.error(
        'CHANGE PASSWORD ERROR:',
        error
      );

      alert(
        error?.message ||
          'خطا در تغییر رمز عبور'
      );
    } finally {
      setSavingPassword(false);
    }
  }

  async function logout() {
    try {
      await fetch(
        '/api/customer/logout',
        {
          method: 'POST',
        }
      );
    } finally {
      window.location.href = '/';
    }
  }

  const dashboardStats =
    useMemo(() => {
      const activeOrders =
        orders.filter(
          (order) =>
            order.status !==
            'cancelled'
        );

      const pendingOrders =
        orders.filter(
          (order) =>
            order.status ===
            'pending'
        );

      const totalPurchased =
        activeOrders.reduce(
          (sum, order) =>
            sum + order.total,
          0
        );

      const latestOrder =
        [...orders].sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        )[0] || null;

      return {
        totalOrders:
          orders.length,

        pendingOrders:
          pendingOrders.length,

        totalPurchased,

        latestOrder,
      };
    }, [orders]);

  if (loading) {
    return (
      <main className="container section">
        <div className="accountLoading">
          <span className="eyebrow">
            MY ACCOUNT
          </span>

          <h1>
            حساب کاربری
          </h1>

          <p>
            در حال دریافت اطلاعات حساب...
          </p>
        </div>
      </main>
    );
  }

  if (!customer) {
    return (
      <main className="container section">
        <div className="accountEmpty">
          <span className="eyebrow">
            MY ACCOUNT
          </span>

          <h1>
            حساب کاربری پیدا نشد
          </h1>

          <Link
            href="/account/login"
            className="button"
          >
            ورود به حساب
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container section accountPage">
      {/* Header */}
      <div className="accountHero">
        <div className="accountHeroInfo">
          <div className="accountAvatar">
            {customer.name
              .trim()
              .charAt(0)
              .toUpperCase() || 'م'}
          </div>

          <div>
            <span className="eyebrow">
              MY ACCOUNT
            </span>

            <h1>
              حساب کاربری
            </h1>

            <p>
              خوش آمدی،{' '}
              <strong>
                {customer.name}
              </strong>
            </p>

            <small>
              {customer.phone}
            </small>
          </div>
        </div>

        <button
          type="button"
          className="button accountLogout"
          onClick={logout}
        >
          خروج از حساب
        </button>
      </div>

      {/* Stats */}
      <section className="accountStats">
        <div className="accountStatCard">
          <small>
            کل سفارش‌ها
          </small>

          <strong>
            {dashboardStats.totalOrders.toLocaleString(
              'fa-IR'
            )}
          </strong>
        </div>

        <div className="accountStatCard">
          <small>
            در انتظار بررسی
          </small>

          <strong>
            {dashboardStats.pendingOrders.toLocaleString(
              'fa-IR'
            )}
          </strong>
        </div>

        <div className="accountStatCard accountStatGold">
          <small>
            مجموع خرید
          </small>

          <strong>
            {dashboardStats.totalPurchased.toLocaleString(
              'fa-IR'
            )}{' '}
            تومان
          </strong>
        </div>

        <div className="accountStatCard">
          <small>
            آخرین سفارش
          </small>

          <strong>
            {dashboardStats.latestOrder
              ? dashboardStats
                  .latestOrder
                  .orderNumber
              : 'ندارد'}
          </strong>
        </div>
      </section>

      {/* Quick actions */}
      <section className="accountQuickActions">
        <Link
          href="/account/orders"
          className="accountQuickAction"
        >
          <span>
            ◈
          </span>

          <div>
            <strong>
              سفارش‌های من
            </strong>

            <small>
              مشاهده و پیگیری سفارش‌ها
            </small>
          </div>
        </Link>

        <Link
          href="/account/wishlist"
          className="accountQuickAction"
        >
          <span>
            ♡
          </span>

          <div>
            <strong>
              علاقه‌مندی‌ها
            </strong>

            <small>
              محصولات ذخیره‌شده شما
            </small>
          </div>
        </Link>

        <Link
          href="/shop"
          className="accountQuickAction"
        >
          <span>
            ✦
          </span>

          <div>
            <strong>
              خرید جدید
            </strong>

            <small>
              مشاهده مجموعه طلا
            </small>
          </div>
        </Link>
      </section>

      {/* Latest Order */}
      {dashboardStats.latestOrder && (
        <section className="accountPanel accountLatestOrder">
          <div className="accountPanelHead">
            <div>
              <span className="eyebrow">
                LATEST ORDER
              </span>

              <h2>
                آخرین سفارش
              </h2>
            </div>

            <Link
              href={`/account/orders/${dashboardStats.latestOrder.id}`}
              className="button"
            >
              مشاهده سفارش
            </Link>
          </div>

          <div className="latestOrderGrid">
            <div>
              <small>
                شماره سفارش
              </small>

              <strong>
                {
                  dashboardStats
                    .latestOrder
                    .orderNumber
                }
              </strong>
            </div>

            <div>
              <small>
                وضعیت
              </small>

              <strong>
                {statusLabels[
                  dashboardStats
                    .latestOrder
                    .status
                ] ||
                  dashboardStats
                    .latestOrder
                    .status}
              </strong>
            </div>

            <div>
              <small>
                پرداخت
              </small>

              <strong>
                {paymentLabels[
                  dashboardStats
                    .latestOrder
                    .paymentStatus ||
                    'unpaid'
                ] ||
                  dashboardStats
                    .latestOrder
                    .paymentStatus ||
                  'پرداخت نشده'}
              </strong>
            </div>

            <div>
              <small>
                مبلغ
              </small>

              <strong>
                {dashboardStats.latestOrder.total.toLocaleString(
                  'fa-IR'
                )}{' '}
                تومان
              </strong>
            </div>
          </div>
        </section>
      )}

      {/* Account information */}
      <section className="accountPanel">
        {!editingProfile ? (
          <>
            <div className="accountPanelHead">
              <div>
                <span className="eyebrow">
                  PROFILE
                </span>

                <h2>
                  اطلاعات حساب
                </h2>
              </div>

              <div className="accountPanelActions">
                <button
                  type="button"
                  className="button"
                  onClick={
                    startEditingProfile
                  }
                >
                  ویرایش پروفایل
                </button>

                <button
                  type="button"
                  className="button"
                  onClick={() =>
                    setShowPasswordForm(
                      !showPasswordForm
                    )
                  }
                >
                  {showPasswordForm
                    ? 'بستن تغییر رمز'
                    : 'تغییر رمز عبور'}
                </button>
              </div>
            </div>

            <div className="profileInfoGrid">
              <div>
                <small>
                  نام و نام خانوادگی
                </small>

                <strong>
                  {customer.name}
                </strong>
              </div>

              <div>
                <small>
                  شماره تماس
                </small>

                <strong>
                  {customer.phone}
                </strong>
              </div>

              <div className="profileAddress">
                <small>
                  آدرس
                </small>

                <strong>
                  {customer.address ||
                    'ثبت نشده'}
                </strong>
              </div>
            </div>
          </>
        ) : (
          <form
            onSubmit={
              saveProfile
            }
            className="accountForm"
          >
            <div className="accountPanelHead">
              <div>
                <span className="eyebrow">
                  EDIT PROFILE
                </span>

                <h2>
                  ویرایش پروفایل
                </h2>
              </div>
            </div>

            <label>
              نام و نام خانوادگی

              <input
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
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
                autoComplete="tel"
                required
              />
            </label>

            <label>
              آدرس

              <textarea
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                rows={4}
              />
            </label>

            <div className="accountFormActions">
              <button
                type="submit"
                className="button"
                disabled={
                  savingProfile
                }
              >
                {savingProfile
                  ? 'در حال ذخیره...'
                  : 'ذخیره تغییرات'}
              </button>

              <button
                type="button"
                className="button"
                onClick={
                  cancelEditingProfile
                }
                disabled={
                  savingProfile
                }
              >
                انصراف
              </button>
            </div>
          </form>
        )}

        {/* Change password */}
        {showPasswordForm && (
          <form
            onSubmit={
              changePassword
            }
            className="accountPasswordForm"
          >
            <div className="accountPanelHead">
              <div>
                <span className="eyebrow">
                  SECURITY
                </span>

                <h2>
                  تغییر رمز عبور
                </h2>
              </div>
            </div>

            <label>
              رمز فعلی

              <input
                type="password"
                value={
                  currentPassword
                }
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                autoComplete="current-password"
                required
              />
            </label>

            <label>
              رمز جدید

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label>
              تکرار رمز جدید

              <input
                type="password"
                value={
                  confirmPassword
                }
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <button
              type="submit"
              className="button"
              disabled={
                savingPassword
              }
            >
              {savingPassword
                ? 'در حال تغییر...'
                : 'ذخیره رمز جدید'}
            </button>
          </form>
        )}
      </section>

      {/* Orders */}
      <section className="accountPanel">
        <div className="accountPanelHead">
          <div>
            <span className="eyebrow">
              ORDER HISTORY
            </span>

            <h2>
              سفارش‌های من
            </h2>
          </div>

          <Link
            href="/shop"
            className="button"
          >
            خرید جدید
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="accountNoOrders">
            <div className="accountNoOrdersIcon">
              ◌
            </div>

            <h3>
              هنوز سفارشی ثبت نکرده‌اید
            </h3>

            <p>
              اولین انتخاب طلای خود را از
              مجموعه ما شروع کنید.
            </p>

            <Link
              href="/shop"
              className="button"
            >
              رفتن به فروشگاه
            </Link>
          </div>
        ) : (
          <div className="accountOrders">
            {orders.map(
              (order) => (
                <article
                  key={order.id}
                  className="accountOrder"
                >
                  <div className="accountOrderIcon">
                    ✦
                  </div>

                  <div className="accountOrderInfo">
                    <span className="accountOrderNumber">
                      {order.orderNumber}
                    </span>

                    <strong>
                      {order.total.toLocaleString(
                        'fa-IR'
                      )}{' '}
                      تومان
                    </strong>

                    <small>
                      {new Date(
                        order.createdAt
                      ).toLocaleString(
                        'fa-IR'
                      )}
                    </small>
                  </div>

                  <div className="accountOrderStatus">
                    <span>
                      وضعیت
                    </span>

                    <strong>
                      {
                        statusLabels[
                          order.status
                        ] ||
                          order.status
                      }
                    </strong>
                  </div>

                  <div className="accountOrderPayment">
                    <span>
                      پرداخت
                    </span>

                    <strong>
                      {
                        paymentLabels[
                          order
                            .paymentStatus ||
                            'unpaid'
                        ] ||
                          order
                            .paymentStatus ||
                          'پرداخت نشده'
                      }
                    </strong>
                  </div>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="button"
                  >
                    جزئیات
                  </Link>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}