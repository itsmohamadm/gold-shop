'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type WishlistItem = {
  id: number;
  productId: number;

  product: {
    id: number;
    name: string;
    weight: number;
    karat: number;
    stock: number;
    active: boolean;
    image?: string | null;
  };
};

export default function WishlistPage() {
  const [items, setItems] =
    useState<WishlistItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [removing, setRemoving] =
    useState<number | null>(null);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    try {
      setLoading(true);

      const res = await fetch(
        '/api/customer/wishlist',
        {
          cache: 'no-store',
        }
      );

      const data =
        await res.json();

      if (res.status === 401) {
        window.location.href =
          '/account/login?next=/account/wishlist';

        return;
      }

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در دریافت علاقه‌مندی‌ها'
        );
      }

      setItems(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        'LOAD WISHLIST ERROR:',
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function removeFromWishlist(
    productId: number
  ) {
    try {
      setRemoving(productId);

      const res = await fetch(
        '/api/customer/wishlist',
        {
          method: 'DELETE',
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
        window.location.href =
          '/account/login?next=/account/wishlist';

        return;
      }

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در حذف محصول'
        );
      }

      setItems((current) =>
        current.filter(
          (item) =>
            item.productId !==
            productId
        )
      );
    } catch (error: any) {
      console.error(
        'REMOVE WISHLIST ERROR:',
        error
      );

      alert(
        error?.message ||
          'خطا در حذف از علاقه‌مندی‌ها'
      );
    } finally {
      setRemoving(null);
    }
  }

  if (loading) {
    return (
      <main className="container section">
        <div className="wishlistLoading">
          <span className="eyebrow">
            WISHLIST
          </span>

          <h1>
            علاقه‌مندی‌های من
          </h1>

          <p>
            در حال دریافت علاقه‌مندی‌ها...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container section wishlistPage">
      {/* Header */}
      <div className="wishlistHero">
        <div>
          <span className="eyebrow">
            WISHLIST
          </span>

          <h1>
            علاقه‌مندی‌های من
          </h1>

          <p>
            محصولاتی که برای بررسی یا خرید
            بعدی ذخیره کرده‌اید.
          </p>
        </div>

        <div className="wishlistCount">
          <span>
            تعداد
          </span>

          <strong>
            {items.length.toLocaleString(
              'fa-IR'
            )}
          </strong>

          <small>
            محصول
          </small>
        </div>
      </div>

      {/* Empty */}
      {items.length === 0 ? (
        <div className="wishlistEmpty">
          <div className="wishlistEmptyIcon">
            ♡
          </div>

          <span className="eyebrow">
            YOUR WISHLIST
          </span>

          <h2>
            هنوز محصولی ذخیره نکرده‌ای
          </h2>

          <p>
            وقتی محصولی را دوست داشتی، آن را
            به علاقه‌مندی‌ها اضافه کن تا بعداً
            سریع‌تر پیدایش کنی.
          </p>

          <Link
            href="/shop"
            className="button"
          >
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="wishlistToolbar">
            <div>
              <strong>
                {items.length.toLocaleString(
                  'fa-IR'
                )}{' '}
                محصول ذخیره شده
              </strong>
            </div>

            <Link
              href="/shop"
              className="button"
            >
              ادامه خرید
            </Link>
          </div>

          {/* Products */}
          <div className="products wishlistProducts">
            {items.map((item) => {
              const product =
                item.product;

              const outOfStock =
                !product.active ||
                product.stock <= 0;

              return (
                <article
                  className="product productCard wishlistCard"
                  key={item.id}
                >
                  <div className="wishlistImageWrap">
                    <Link
                      href={`/shop/${product.id}`}
                      className="productCardImageLink"
                    >
                      <div className="productImage productCardImage">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={
                              product.name
                            }
                          />
                        ) : (
                          <span>
                            {product.karat}
                            K
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="wishlistStatusBadge">
                      {outOfStock
                        ? 'ناموجود'
                        : 'موجود'}
                    </div>

                    <button
                      type="button"
                      className="wishlistRemoveButton"
                      onClick={() =>
                        removeFromWishlist(
                          product.id
                        )
                      }
                      disabled={
                        removing ===
                        product.id
                      }
                      aria-label="حذف از علاقه‌مندی‌ها"
                      title="حذف از علاقه‌مندی‌ها"
                    >
                      {removing ===
                      product.id
                        ? '...'
                        : '♥'}
                    </button>
                  </div>

                  <div className="wishlistCardContent">
                    <div className="productCardTop">
                      <span className="productCategory">
                        GOLD
                      </span>

                      <span className="productKarat">
                        {product.karat.toLocaleString(
                          'fa-IR'
                        )}{' '}
                        عیار
                      </span>
                    </div>

                    <Link
                      href={`/shop/${product.id}`}
                      className="productCardTitle"
                    >
                      {
                        product.name
                      }
                    </Link>

                    <div className="productMeta">
                      <span>
                        وزن{' '}
                        {product.weight.toLocaleString(
                          'fa-IR'
                        )}{' '}
                        گرم
                      </span>

                      <span>
                        {product.stock > 0
                          ? `موجودی ${product.stock.toLocaleString(
                              'fa-IR'
                            )}`
                          : 'ناموجود'}
                      </span>
                    </div>

                    <div className="wishlistCardBottom">
                      <div>
                        <small>
                          وضعیت
                        </small>

                        <strong
                          className={
                            outOfStock
                              ? 'stockOut'
                              : 'stockIn'
                          }
                        >
                          {product.active
                            ? product.stock >
                              0
                              ? 'موجود'
                              : 'ناموجود'
                            : 'غیرفعال'}
                        </strong>
                      </div>

                      <Link
                        href={`/shop/${product.id}`}
                        className="button"
                      >
                        مشاهده محصول
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}