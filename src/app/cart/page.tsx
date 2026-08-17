'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import {
  useCart,
} from '@/components/cart/CartProvider';

export default function CartPage() {
  const {
    items,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    syncCartProducts,
    totalItems,
    totalPrice,
  } = useCart();

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    let mounted = true;

    async function refreshCart() {
      try {
        const res = await fetch(
          '/api/cart/refresh',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              ids: items.map(
                (item) => item.id
              ),
            }),
            cache: 'no-store',
          }
        );

        const text =
          await res.text();

        let data: any = null;

        try {
          data = text
            ? JSON.parse(text)
            : null;
        } catch {
          console.error(
            'CART REFRESH INVALID RESPONSE:',
            text
          );
        }

        if (!res.ok) {
          throw new Error(
            data?.error ||
              'خطا در به‌روزرسانی سبد'
          );
        }

        if (
          !Array.isArray(data)
        ) {
          throw new Error(
            'پاسخ نامعتبر از سرور دریافت شد'
          );
        }

        if (mounted) {
          syncCartProducts(data);
        }
      } catch (error) {
        console.error(
          'CART REFRESH ERROR:',
          error
        );
      }
    }

    refreshCart();

    return () => {
      mounted = false;
    };
  }, [
    items.length,
    syncCartProducts,
  ]);

  const totalWeight =
    items.reduce(
      (sum, item) =>
        sum +
        item.weight *
          item.quantity,
      0
    );

  if (items.length === 0) {
    return (
      <main className="container section">
        <div className="cartEmpty">
          <div className="cartEmptyIcon">
            🛒
          </div>

          <span className="eyebrow">
            SHOPPING CART
          </span>

          <h1>
            سبد خرید شما خالی است
          </h1>

          <p>
            هنوز محصولی به سبد خرید اضافه
            نکرده‌اید. مجموعه طلاها را
            مشاهده کنید و انتخاب خودتان را
            انجام دهید.
          </p>

          <Link
            href="/shop"
            className="button"
            style={{
              marginTop: '14px',
            }}
          >
            رفتن به فروشگاه
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container section cartPage">
      {/* Header */}
      <div className="sectionHead">
        <div>
          <span className="eyebrow">
            SHOPPING CART
          </span>

          <h1
            style={{
              marginTop: '10px',
            }}
          >
            سبد خرید
          </h1>

          <p
            style={{
              marginTop: '8px',
              color:
                'var(--text-soft)',
            }}
          >
            محصولات انتخاب‌شده خود را
            بررسی کنید.
          </p>
        </div>

        <div className="cartHeaderBadge">
          {totalItems.toLocaleString(
            'fa-IR'
          )}{' '}
          کالا
        </div>
      </div>

      {/* Summary */}
      <section className="cartSummaryGrid">
        <div className="cartSummaryCard">
          <small>
            تعداد کالا
          </small>

          <strong>
            {totalItems.toLocaleString(
              'fa-IR'
            )}
          </strong>
        </div>

        <div className="cartSummaryCard">
          <small>
            وزن کل
          </small>

          <strong>
            {totalWeight.toLocaleString(
              'fa-IR',
              {
                maximumFractionDigits: 2,
              }
            )}{' '}
            <span>
              گرم
            </span>
          </strong>
        </div>

        <div className="cartSummaryCard cartSummaryCardGold">
          <small>
            مبلغ کل
          </small>

          <strong>
            {totalPrice.toLocaleString(
              'fa-IR'
            )}{' '}
            <span>
              تومان
            </span>
          </strong>
        </div>
      </section>

      {/* Products */}
      <section className="cartItemsSection">
        <div className="cartSectionTitle">
          <div>
            <span className="eyebrow">
              YOUR ITEMS
            </span>

            <h2>
              محصولات سبد
            </h2>
          </div>
        </div>

        <div className="cartItems">
          {items.map((item) => {
            const remaining =
              Math.max(
                item.stock -
                  item.quantity,
                0
              );

            const subtotal =
              item.price *
              item.quantity;

            return (
              <article
                key={item.id}
                className="cartItem"
              >
                {/* Image */}
                <Link
                  href={`/shop/${item.id}`}
                  className="cartItemImageLink"
                >
                  <div className="cartItemImage">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    ) : (
                      <span>
                        {item.karat}K
                      </span>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="cartItemInfo">
                  <div className="cartItemTop">
                    <div>
                      <span className="cartItemCategory">
                        GOLD
                      </span>

                      <Link
                        href={`/shop/${item.id}`}
                        className="cartItemTitle"
                      >
                        {item.name}
                      </Link>
                    </div>

                    <button
                      type="button"
                      className="cartRemoveIcon"
                      onClick={() =>
                        removeFromCart(
                          item.id
                        )
                      }
                      aria-label="حذف محصول"
                      title="حذف محصول"
                    >
                      ×
                    </button>
                  </div>

                  <div className="cartItemMeta">
                    <span>
                      وزن:{' '}
                      {item.weight.toLocaleString(
                        'fa-IR'
                      )}{' '}
                      گرم
                    </span>

                    <span>
                      عیار:{' '}
                      {item.karat.toLocaleString(
                        'fa-IR'
                      )}
                    </span>

                    <span>
                      موجودی:{' '}
                      {item.stock.toLocaleString(
                        'fa-IR'
                      )}
                    </span>
                  </div>

                  <div className="cartItemPrice">
                    <small>
                      قیمت واحد
                    </small>

                    <strong>
                      {item.price.toLocaleString(
                        'fa-IR'
                      )}{' '}
                      <span>
                        تومان
                      </span>
                    </strong>
                  </div>

                  <div className="cartItemBottom">
                    <div className="quantityControl">
                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(
                            item.id
                          )
                        }
                        aria-label="کاهش تعداد"
                      >
                        −
                      </button>

                      <strong>
                        {item.quantity.toLocaleString(
                          'fa-IR'
                        )}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(
                            item.id
                          )
                        }
                        disabled={
                          item.quantity >=
                          item.stock
                        }
                        aria-label="افزایش تعداد"
                      >
                        +
                      </button>
                    </div>

                    <div className="cartItemSubtotal">
                      <small>
                        جمع این محصول
                      </small>

                      <strong>
                        {subtotal.toLocaleString(
                          'fa-IR'
                        )}{' '}
                        <span>
                          تومان
                        </span>
                      </strong>
                    </div>
                  </div>

                  <div className="cartStockHint">
                    {remaining > 0 ? (
                      <span className="stockIn">
                        امکان افزودن{' '}
                        {remaining.toLocaleString(
                          'fa-IR'
                        )}{' '}
                        عدد دیگر
                      </span>
                    ) : (
                      <span className="stockOut">
                        حداکثر موجودی انتخاب شده
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Final Summary */}
      <section className="cartCheckoutPanel">
        <div className="cartCheckoutContent">
          <div>
            <span className="eyebrow">
              ORDER SUMMARY
            </span>

            <h2>
              خلاصه سفارش
            </h2>

            <div className="cartFinalRows">
              <div>
                <span>
                  تعداد کالا
                </span>

                <strong>
                  {totalItems.toLocaleString(
                    'fa-IR'
                  )}
                </strong>
              </div>

              <div>
                <span>
                  وزن کل
                </span>

                <strong>
                  {totalWeight.toLocaleString(
                    'fa-IR',
                    {
                      maximumFractionDigits: 2,
                    }
                  )}{' '}
                  گرم
                </strong>
              </div>

              <div className="cartFinalTotal">
                <span>
                  مبلغ نهایی
                </span>

                <strong>
                  {totalPrice.toLocaleString(
                    'fa-IR'
                  )}{' '}
                  تومان
                </strong>
              </div>
            </div>
          </div>

          <div className="cartCheckoutActions">
            <Link
              href="/shop"
              className="button"
            >
              ادامه خرید
            </Link>

            <Link
              href="/checkout"
              className="button"
            >
              ادامه و ثبت سفارش
            </Link>

            <button
              type="button"
              className="button"
              onClick={() => {
                const confirmed =
                  window.confirm(
                    'آیا از خالی کردن کل سبد خرید مطمئن هستید؟'
                  );

                if (confirmed) {
                  clearCart();
                }
              }}
            >
              خالی کردن سبد
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}