import Link from 'next/link';
import { notFound } from 'next/navigation';

import AddToCartButton from '@/components/cart/AddToCartButton';
import WishlistButton from '@/components/wishlist/WishlistButton';

import {
  fetchGoldPrice,
  calculateProductPrice,
} from '@/lib/gold';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Props = {
  params: {
    id: string;
  };
};

export default async function ProductPage({
  params,
}: Props) {
  const id = Number(params.id);

  if (!Number.isInteger(id)) {
    notFound();
  }

  const product =
    await prisma.product.findUnique({
      where: {
        id,
      },
      include: {},
    });

  if (!product || !product.active) {
    notFound();
  }

  const gold =
    await fetchGoldPrice();

  const price =
    calculateProductPrice(
      product.weight,
      gold.price18k,
      product.laborPercent,
      product.profitPercent,
      product.taxPercent,
      product.manualPrice
    );

  const isOutOfStock =
    product.stock <= 0;

  return (
    <main className="container section productDetailPage">
      {/* BACK */}

      <Link
        href="/shop"
        className="productBack"
      >
        <span>←</span>
        بازگشت به فروشگاه
      </Link>

      {/* PRODUCT MAIN */}

      <section className="productDetail">
        {/* IMAGE */}

        <div className="productImagePanel">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="productDetailImage"
            />
          ) : (
            <div className="productImagePlaceholder">
              بدون تصویر
            </div>
          )}
        </div>

        {/* INFO */}

        <div className="productInfo">
          <span className="eyebrow">
            GOLD COLLECTION
          </span>

          <h1>
            {product.name}
          </h1>

          <div className="productMeta">
            <span>
              {product.category}
            </span>

            <span>
              کد محصول: {product.id}
            </span>
          </div>

          {/* SPECS */}

          <div className="productSpecs">
            <div className="productSpec">
              <small>
                وزن
              </small>

              <strong>
                {product.weight.toLocaleString(
                  'fa-IR'
                )}{' '}
                گرم
              </strong>
            </div>

            <div className="productSpec">
              <small>
                عیار
              </small>

              <strong>
                {product.karat.toLocaleString(
                  'fa-IR'
                )}
              </strong>
            </div>

            <div className="productSpec">
              <small>
                اجرت
              </small>

              <strong>
                {product.laborPercent}٪
              </strong>
            </div>

            <div className="productSpec">
              <small>
                سود
              </small>

              <strong>
                {product.profitPercent}٪
              </strong>
            </div>

            <div className="productSpec">
              <small>
                مالیات
              </small>

              <strong>
                {product.taxPercent}٪
              </strong>
            </div>

            <div className="productSpec">
              <small>
                موجودی
              </small>

              <strong
                className={
                  isOutOfStock
                    ? 'stockOut'
                    : 'stockIn'
                }
              >
                {product.stock.toLocaleString(
                  'fa-IR'
                )}{' '}
                عدد
              </strong>
            </div>
          </div>

          {/* PRICE */}

          <div className="productPricePanel">
            <div className="productGoldPrice">
              <div>
                <small>
                  قیمت لحظه‌ای طلای ۱۸ عیار
                </small>

                <strong>
                  {gold.price18k.toLocaleString(
                    'fa-IR'
                  )}{' '}
                  تومان
                </strong>
              </div>

              <span className="livePrice">
                آنلاین
              </span>
            </div>

            <div className="productFinalPrice">
              <small>
                قیمت نهایی محصول
              </small>

              <strong>
                {price.toLocaleString(
                  'fa-IR'
                )}{' '}
                <span>
                  تومان
                </span>
              </strong>
            </div>

            <small className="productPriceNote">
              قیمت بر اساس نرخ لحظه‌ای طلا،
              وزن و هزینه‌های محصول محاسبه شده است.
            </small>
          </div>

          {/* ACTIONS */}

          <div className="productActions">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                weight:
                  product.weight,
                karat:
                  product.karat,
                price,
                stock:
                  product.stock,
                image:
                  product.image,
              }}
            />

            <WishlistButton
              productId={product.id}
            />
          </div>

          {/* SHOPPING BENEFITS */}

          <div className="productTrust productBenefits">
            <div className="productBenefit">
              <span className="productBenefitIcon">
                ↩
              </span>

              <div>
                <strong>
                  ضمانت بازگشت
                </strong>

                <small>
                  خرید با خیال راحت
                </small>
              </div>
            </div>

            <div className="productBenefit">
              <span className="productBenefitIcon">
                ✓
              </span>

              <div>
                <strong>
                  خرید و پرداخت امن
                </strong>

                <small>
                  پرداخت مطمئن و امن
                </small>
              </div>
            </div>

            <div className="productBenefit">
              <span className="productBenefitIcon">
                ⚡
              </span>

              <div>
                <strong>
                  تحویل اکسپرس
                </strong>

                <small>
                  ارسال سریع سفارش
                </small>
              </div>
            </div>

            <div className="productBenefit">
              <span className="productBenefitIcon">
                ◆
              </span>

              <div>
                <strong>
                  ضمانت اصل بودن کالا
                </strong>

                <small>
                  اصالت محصول تضمین می‌شود
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}