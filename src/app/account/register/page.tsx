'use client';

import Link from 'next/link';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const next =
    searchParams.get('next') ||
    '/account';

  const [name, setName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [address, setAddress] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  async function register(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);

      const res = await fetch(
        '/api/customer/register',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            name,
            phone,
            password,
            address,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در ثبت‌نام'
        );
      }

      router.push(next);
      router.refresh();
    } catch (error: any) {
      console.error(
        'CUSTOMER REGISTER ERROR:',
        error
      );

      alert(
        error?.message ||
          'خطا در ثبت‌نام'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container section accountAuthPage">
      <div className="authLayout">
        {/* معرفی */}
        <div className="authIntro">
          <span className="eyebrow">
            ZARIN GOLD
          </span>

          <h1>
            حساب خودت را بساز
          </h1>

          <p>
            با ساخت حساب در طلای زرین،
            سفارش‌ها، علاقه‌مندی‌ها و
            اطلاعات خریدت همیشه در دسترس
            خواهد بود.
          </p>

          <div className="authBenefits">
            <div>
              <span>
                ✓
              </span>

              <div>
                <strong>
                  مدیریت سفارش‌ها
                </strong>

                <small>
                  وضعیت سفارش و پرداخت‌ها را
                  پیگیری کن
                </small>
              </div>
            </div>

            <div>
              <span>
                ♡
              </span>

              <div>
                <strong>
                  ذخیره علاقه‌مندی‌ها
                </strong>

                <small>
                  محصولاتی که دوست داری را
                  برای بعد نگه دار
                </small>
              </div>
            </div>

            <div>
              <span>
                ✦
              </span>

              <div>
                <strong>
                  خرید راحت‌تر
                </strong>

                <small>
                  اطلاعاتت را یک‌بار ثبت کن
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* فرم */}
        <section className="authCard">
          <div className="authCardHead">
            <span className="eyebrow">
              ACCOUNT
            </span>

            <h2>
              ساخت حساب مشتری
            </h2>

            <p>
              اطلاعات خودت را وارد کن تا
              حساب کاربری ساخته شود.
            </p>
          </div>

          <form
            onSubmit={register}
            className="authForm"
          >
            <label>
              نام و نام خانوادگی

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(
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
                  placeholder="حداقل ۸ کاراکتر"
                  autoComplete="new-password"
                  minLength={8}
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

              <small
                style={{
                  marginTop: '4px',
                  fontSize: '10px',
                }}
              >
                رمز عبور باید حداقل ۸
                کاراکتر باشد.
              </small>
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
                placeholder="آدرس کامل برای دریافت سفارش"
                autoComplete="street-address"
              />

              <small
                style={{
                  marginTop: '2px',
                  fontSize: '10px',
                }}
              >
                وارد کردن آدرس فعلاً
                اختیاری است.
              </small>
            </label>

            <button
              className="button authSubmit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'در حال ساخت حساب...'
                : 'ساخت حساب و ادامه'}
            </button>
          </form>

          <div className="authFooter">
            <span>
              قبلاً حساب ساخته‌ای؟
            </span>

            <Link
              href={`/account/login?next=${encodeURIComponent(
                next
              )}`}
            >
              ورود به حساب
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}