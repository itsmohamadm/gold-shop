'use client';

import { useCart } from './CartProvider';

type Props = {
  product: {
    id: number;
    name: string;
    weight: number;
    karat: number;
    price: number;
    stock: number;
    image?: string | null;
  };
};

export default function AddToCartButton({
  product,
}: Props) {
  const {
    items,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const cartItem = items.find(
    (item) => item.id === product.id
  );

  const quantity =
    cartItem?.quantity ?? 0;

  const remaining = Math.max(
    product.stock - quantity,
    0
  );

  const outOfStock =
    product.stock <= 0;

  const maxReached =
    quantity >= product.stock;

  function handleAdd() {
    if (outOfStock) {
      return;
    }

    addToCart(product);
  }

  function handleIncrease() {
    if (maxReached) {
      return;
    }

    increaseQuantity(product.id);
  }

  function handleDecrease() {
    decreaseQuantity(product.id);
  }

  function handleRemove() {
    removeFromCart(product.id);
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: '10px',
        marginTop: '12px',
      }}
    >
      {/* وضعیت موجودی */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(3, minmax(0, 1fr))',
          gap: '8px',
          fontSize: '14px',
        }}
      >
        <div>
          موجودی:{' '}
          <strong>
            {product.stock.toLocaleString(
              'fa-IR'
            )}
          </strong>
        </div>

        <div>
          در سبد:{' '}
          <strong>
            {quantity.toLocaleString(
              'fa-IR'
            )}
          </strong>
        </div>

        <div>
          باقی‌مانده:{' '}
          <strong>
            {remaining.toLocaleString(
              'fa-IR'
            )}
          </strong>
        </div>
      </div>

      {/* وقتی محصول داخل سبد نیست */}
      {quantity === 0 ? (
        <button
          type="button"
          className="button"
          onClick={handleAdd}
          disabled={outOfStock}
          style={{
            width: '100%',
          }}
        >
          {outOfStock
            ? 'ناموجود'
            : 'افزودن به سبد خرید'}
        </button>
      ) : (
        <>
          {/* کنترل تعداد */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <button
              type="button"
              className="button"
              onClick={
                handleDecrease
              }
              style={{
                minWidth: '45px',
              }}
            >
              −
            </button>

            <div
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '10px',
                borderRadius: '10px',
                background:
                  'rgba(255,255,255,0.05)',
                fontWeight: 700,
              }}
            >
              {quantity.toLocaleString(
                'fa-IR'
              )}
            </div>

            <button
              type="button"
              className="button"
              onClick={
                handleIncrease
              }
              disabled={maxReached}
              style={{
                minWidth: '45px',
              }}
            >
              +
            </button>
          </div>

          {/* حذف کامل */}
          <button
            type="button"
            className="button"
            onClick={handleRemove}
            style={{
              width: '100%',
            }}
          >
            حذف از سبد خرید
          </button>

          {maxReached && (
            <small
              style={{
                opacity: 0.7,
                textAlign: 'center',
              }}
            >
              تمام موجودی این محصول
              در سبد شماست.
            </small>
          )}
        </>
      )}
    </div>
  );
}