'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch(
      '/api/admin/logout',
      {
        method: 'POST',
      }
    );

    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      className="button"
      onClick={logout}
    >
      خروج از پنل
    </button>
  );
}