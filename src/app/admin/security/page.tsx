'use client';

import { useState } from 'react';

export default function SecurityPage() {
  const [username, setUsername] =
    useState('admin');

  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [saving, setSaving] =
    useState(false);

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
      setSaving(true);

      const res = await fetch(
        '/api/admin/password',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            username,
            currentPassword,
            newPassword,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در تغییر رمز'
        );
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      alert(
        'رمز عبور با موفقیت تغییر کرد'
      );
    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ||
          'خطا در تغییر رمز'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container section">
      <div
        style={{
          maxWidth: '550px',
          margin: '0 auto',
        }}
      >
        <span className="eyebrow">
          SECURITY
        </span>

        <h1>
          امنیت پنل
        </h1>

        <form
          onSubmit={changePassword}
          style={{
            display: 'grid',
            gap: '14px',
            marginTop: '24px',
          }}
        >
          <label>
            نام کاربری

            <input
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              required
            />
          </label>

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
              minLength={8}
              required
            />
          </label>

          <button
            type="submit"
            className="button"
            disabled={saving}
          >
            {saving
              ? 'در حال تغییر...'
              : 'تغییر رمز عبور'}
          </button>
        </form>
      </div>
    </main>
  );
}