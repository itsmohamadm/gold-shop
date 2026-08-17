'use client';

import {
  FormEvent,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  async function handleLogin(
    event: FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);

      const res = await fetch(
        '/api/admin/login',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'ورود ناموفق بود'
        );
      }

      router.push('/admin');
      router.refresh();
    } catch (error: any) {
      alert(
        error?.message ||
          'خطا در ورود'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container section">
      <div
        style={{
          maxWidth: '450px',
          margin: '60px auto',
        }}
      >
        <span className="eyebrow">
          ADMIN LOGIN
        </span>

        <h1>
          ورود به پنل مدیریت
        </h1>

        <form
          onSubmit={handleLogin}
          style={{
            display: 'grid',
            gap: '14px',
            marginTop: '24px',
          }}
        >
          <label>
            نام کاربری

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              autoComplete="username"
              required
            />
          </label>

          <label>
            رمز عبور

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            className="button"
            disabled={loading}
          >
            {loading
              ? 'در حال ورود...'
              : 'ورود'}
          </button>
        </form>
      </div>
    </main>
  );
}