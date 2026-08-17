'use client';

import Link from 'next/link';

import AddToCartButton from '@/components/cart/AddToCartButton';

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    category: string;
    weight: number;
    karat: number;
    laborPercent: number;
    profitPercent: number;
    stock: number;
    image?: string | null;
    price: number;
  };
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const isOutOfStock =
    product.stock <= 0;

  return (
    <article className="product productCard">
      <div className="productCardImageWrap">
        <Link
          href={`/shop/${product.id}`}
          className="productCardImageLink"
        >
          <div className="productImage productCardImage">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
              />
            ) : (
              <span>
                {product.karat}K
              </span>
            )}
          </div>
        </Link>

        <div className="productCardBadge">
          {isOutOfStock
            ? 'ناموجود'
            : 'موجود'}
        </div>
      </div>

      <div className="productCardContent">
        <div className="productCardTop">
          <span className="productCategory">
            {product.category}
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
          {product.name}
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
            اجرت {product.laborPercent}٪
          </span>

          <span>
            سود {product.profitPercent}٪
          </span>
        </div>

        <div className="productCardBottom">
          <div>
            <small>
              قیمت نهایی
            </small>

            <strong className="productPrice">
              {product.price.toLocaleString(
                'fa-IR'
              )}{' '}
              <span>
                تومان
              </span>
            </strong>
          </div>
        </div>

        <div className="productStockRow">
          {isOutOfStock ? (
            <span className="stockOut">
              موجود نیست
            </span>
          ) : (
            <span className="stockIn">
              موجودی:{' '}
              {product.stock.toLocaleString(
                'fa-IR'
              )}{' '}
              عدد
            </span>
          )}
        </div>

        <div className="productCardAction">
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              weight: product.weight,
              karat: product.karat,
              price: product.price,
              stock: product.stock,
              image: product.image,
            }}
          />
        </div>
      </div>
    </article>
  );
}