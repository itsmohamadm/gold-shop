'use client';

import Link from 'next/link';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const next =
    searchParams.get('next') ||
    '/account';

  const [phone, setPhone] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  async function login(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);

      const res = await fetch(
        '/api/customer/login',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            phone,
            password,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در ورود'
        );
      }

      router.push(next);
      router.refresh();
    } catch (error: any) {
      console.error(
        'CUSTOMER LOGIN ERROR:',
        error
      );

      alert(
        error?.message ||
          'خطا در ورود'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container section accountAuthPage">
      <div className="authLayout">
        {/* بخش معرفی */}
        <div className="authIntro">
          <span className="eyebrow">
            ZARIN GOLD
          </span>

          <h1>
            خوش آمدی
          </h1>

          <p>
            وارد حساب کاربری خودت شو و
            سفارش‌ها، علاقه‌مندی‌ها و
            اطلاعات حسابت را مدیریت کن.
          </p>

          <div className="authBenefits">
            <div>
              <span>
                ✓
              </span>

              <div>
                <strong>
                  سفارش‌های من
                </strong>

                <small>
                  پیگیری سفارش‌ها و وضعیت
                  پرداخت
                </small>
              </div>
            </div>

            <div>
              <span>
                ♡
              </span>

              <div>
                <strong>
                  علاقه‌مندی‌ها
                </strong>

                <small>
                  محصولات مورد علاقه‌ات را
                  ذخیره کن
                </small>
              </div>
            </div>

            <div>
              <span>
                ✦
              </span>

              <div>
                <strong>
                  خرید سریع‌تر
                </strong>

                <small>
                  اطلاعات حساب را یک‌بار
                  ذخیره کن
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* فرم ورود */}
        <section className="authCard">
          <div className="authCardHead">
            <span className="eyebrow">
              ACCOUNT
            </span>

            <h2>
              ورود مشتری
            </h2>

            <p>
              برای ادامه وارد حساب خود
              شوید.
            </p>
          </div>

          <form
            onSubmit={login}
            className="authForm"
          >
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
                inputMode="tel"
                required
              />
            </label>

            <label>
              رمز عبور

              <div className="authPasswordField">
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="رمز عبور خود را وارد کنید"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="authPasswordToggle"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? 'مخفی کردن رمز'
                      : 'نمایش رمز'
                  }
                >
                  {showPassword
                    ? 'مخفی'
                    : 'نمایش'}
                </button>
              </div>
            </label>

            <div className="authFormMeta">
              <Link
                href={`/account/register?next=${encodeURIComponent(
                  next
                )}`}
              >
                حساب ندارید؟
              </Link>
            </div>

            <button
              className="button authSubmit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'در حال ورود...'
                : 'ورود به حساب'}
            </button>
          </form>

          <div className="authFooter">
            <span>
              هنوز عضو طلای زرین نیستی؟
            </span>

            <Link
              href={`/account/register?next=${encodeURIComponent(
                next
              )}`}
            >
              ساخت حساب جدید
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}