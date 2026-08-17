'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  productId: number;
};

export default function WishlistButton({
  productId,
}: Props) {
  const router = useRouter();

  const [liked, setLiked] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadWishlist();
  }, [productId]);

  async function loadWishlist() {
    try {
      const res = await fetch(
        '/api/customer/wishlist',
        {
          cache: 'no-store',
        }
      );

      if (res.status === 401) {
        setLoading(false);
        return;
      }

      const data =
        await res.json();

      if (!res.ok) {
        return;
      }

      const exists =
        data.some(
          (item: any) =>
            item.productId ===
            productId
        );

      setLiked(exists);
    } catch {
      // مهم نیست؛ وضعیت اولیه false باقی می‌ماند.
    } finally {
      setLoading(false);
    }
  }

  async function toggleWishlist() {
    try {
      setLoading(true);

      const res = await fetch(
        '/api/customer/wishlist',
        {
          method: liked
            ? 'DELETE'
            : 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            productId,
          }),
        }
      );

      const data =
        await res.json();

      if (res.status === 401) {
        router.push(
          `/account/login?next=/shop/${productId}`
        );

        return;
      }

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در علاقه‌مندی'
        );
      }

      setLiked(
        Boolean(data.liked)
      );
    } catch (error: any) {
      alert(
        error?.message ||
          'خطا در تغییر علاقه‌مندی'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="button"
      onClick={toggleWishlist}
      disabled={loading}
      aria-label={
        liked
          ? 'حذف از علاقه‌مندی‌ها'
          : 'افزودن به علاقه‌مندی‌ها'
      }
    >
      {liked
        ? '♥ حذف از علاقه‌مندی'
        : '♡ افزودن به علاقه‌مندی'}
    </button>
  );
}