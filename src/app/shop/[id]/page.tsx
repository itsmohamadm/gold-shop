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
      include: {
        // اطلاعات اضافی در صورت وجود رابطه
      },
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
      {/* ==================================================
          BACK
      ================================================== */}

      <Link
        href="/shop"
        className="productBack"
      >
        <span>→</span>
        بازگشت به فروشگاه
      </Link>

      {/* ==================================================
          PRODUCT MAIN
      ================================================== */}

      <section className="productDetail">
        {/* تصویر */}
        <div className="productDetailVisual">
          <div className="productDetailImage">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
              />
            ) : (
              <div className="productDetailPlaceholder">
                <span>
                  {product.karat}K
                </span>

                <small>
                  GOLD
                </small>
              </div>
            )}

            <div className="productDetailImageBadge">
              {isOutOfStock
                ? 'ناموجود'
                : 'موجود'}
            </div>

            <div className="productDetailImageKarat">
              {product.karat.toLocaleString(
                'fa-IR'
              )}{' '}
              عیار
            </div>
          </div>
        </div>

        {/* اطلاعات محصول */}
        <div className="productDetailInfo">
          <div className="productDetailCategory">
            <span className="eyebrow">
              GOLD PRODUCT
            </span>

            <span>
              {product.category}
            </span>
          </div>

          <h1 className="productDetailTitle">
            {product.name}
          </h1>

          <p className="productDetailIntro">
            یک انتخاب اصیل برای کسانی که
            کیفیت، ظرافت و شفافیت قیمت را
            مهم می‌دانند.
          </p>

          {/* مشخصات */}
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

          {/* قیمت */}
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
              قیمت بر اساس نرخ فعلی طلا،
              وزن و هزینه‌های محصول محاسبه شده
              است.
            </small>
          </div>

          {/* عملیات */}
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

          {/* اطلاعات خرید */}
          <div className="productTrust">
            <div>
              <span>
                ✓
              </span>

              <div>
                <strong>
                  قیمت شفاف
                </strong>

                <small>
                  محاسبه بر اساس نرخ روز طلا
                </small>
              </div>
            </div>

            <div>
              <span>
                ✓
              </span>

              <div>
                <strong>
                  موجودی واقعی
                </strong>

                <small>
                  کنترل موجودی قبل از ثبت سفارش
                </small>
              </div>
            </div>

            <div>
              <span>
                ✓
              </span>

              <div>
                <strong>
                  خرید امن
                </strong>

                <small>
                  سفارش به نام حساب شما ثبت می‌شود
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}