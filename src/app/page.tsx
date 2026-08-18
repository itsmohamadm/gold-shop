import Link from 'next/link';

import ProductCard from '@/components/shop/ProductCard';

import {
  fetchGoldPrice,
  loadProducts,
  calculateProductPrice,
} from '@/lib/gold';

import { prisma } from '@/lib/prisma';

export const dynamic =
  'force-dynamic';

export default async function Home() {
  const [
    gold,
    products,
    categories,
  ] = await Promise.all([
    fetchGoldPrice(),
    loadProducts(),
    prisma.category.findMany({
      where: {
        active: true,
      },
      orderBy: {
        id: 'asc',
      },
      take: 8,
    }),
  ]);

  const featured =
    products
      .filter(
        (product) =>
          product.active &&
          product.stock > 0
      )
      .slice(0, 6);

  return (
    <main className="homePage">
      {/* ==================================================
          HERO
      ================================================== */}

      <section className="homeHero">
        <div className="homeHeroGlow" />

        <div className="container homeHeroInner">
          <div className="homeHeroCopy">
            <span className="eyebrow">
              ZARIN GOLD
            </span>

            <h1>
              طلای مورد علاقه‌ات
              <br />

              <span>
                همین‌جاست.
              </span>
            </h1>

            <p>
              خرید طلا با قیمت شفاف، موجودی
              واقعی و تجربه‌ای ساده و مطمئن.
            </p>

            <div className="homeHeroActions">
              <Link
                href="/shop"
                className="button homePrimaryButton"
              >
                مشاهده محصولات
                <span>
                  ←
                </span>
              </Link>

              <Link
                href="/shop?sort=newest"
                className="homeSecondaryButton"
              >
                جدیدترین‌ها
              </Link>
            </div>

            <div className="homeTrustLine">
              <span>
                ✓ قیمت لحظه‌ای
              </span>

              <span>
                ✓ موجودی واقعی
              </span>

              <span>
                ✓ خرید امن
              </span>
            </div>
          </div>

          {/* قیمت */}
          <div className="homeGoldCard">
            <div className="homeGoldCardTop">
              <div>
                <small>
                  قیمت لحظه‌ای
                </small>

                <strong>
                  طلای ۱۸ عیار
                </strong>
              </div>

              <span className="homeLiveDot">
                LIVE
              </span>
            </div>

            <div className="homeGoldPrice">
              {gold.price18k.toLocaleString(
                'fa-IR'
              )}

              <span>
                تومان
              </span>
            </div>

            {gold.change24h !==
              null && (
              <div
                className={`homeGoldChange ${
                  gold.changeDirection ===
                  'down'
                    ? 'isDown'
                    : gold.changeDirection ===
                      'flat'
                    ? 'isFlat'
                    : 'isUp'
                }`}
              >
                <span>
                  {gold.changeDirection ===
                  'down'
                    ? '▼'
                    : gold.changeDirection ===
                      'flat'
                    ? '—'
                    : '▲'}
                </span>

                <strong>
                  {Math.abs(
                    gold.change24h
                  ).toLocaleString(
                    'fa-IR',
                    {
                      maximumFractionDigits: 2,
                    }
                  )}
                  ٪
                </strong>

                <small>
                  تغییر ۲۴ ساعت
                </small>
              </div>
            )}

            <div className="homeGoldDetails">
              <span>
                آخرین بروزرسانی
              </span>

              <strong>
                {gold.lastUpdate}
              </strong>
            </div>

            <div className="homeGoldFooter">
              <span>
                منبع قیمت: بها۲۴
              </span>

              <Link href="/shop">
                خرید طلا →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          MARKET BAR
      ================================================== */}

      <section className="marketBar">
        <div className="container marketBarInner">
          <div className="marketStatus">
            <span />
            <strong>
              بازار آنلاین
            </strong>

            <small>
              قیمت‌ها به‌صورت لحظه‌ای بررسی
              می‌شوند
            </small>
          </div>

          <div className="marketPrice">
            <span>
              طلای ۱۸ عیار
            </span>

            <strong>
              {gold.price18k.toLocaleString(
                'fa-IR'
              )}{' '}
              تومان
            </strong>

            {gold.change24h !==
              null && (
              <b
                className={
                  gold.changeDirection ===
                  'down'
                    ? 'marketDown'
                    : 'marketUp'
                }
              >
                {gold.changeDirection ===
                'down'
                  ? '▼'
                  : '▲'}{' '}
                {Math.abs(
                  gold.change24h
                ).toLocaleString(
                  'fa-IR',
                  {
                    maximumFractionDigits: 2,
                  }
                )}
                ٪
              </b>
            )}
          </div>
        </div>
      </section>

      {/* ==================================================
          CATEGORIES
      ================================================== */}

      {categories.length > 0 && (
        <section className="container homeSection">
          <div className="homeSectionHead">
            <div>
              <span className="eyebrow">
                COLLECTIONS
              </span>

              <h2>
                برای هر سلیقه
                <span>
                  یک انتخاب
                </span>
              </h2>
            </div>

            <Link
              href="/shop"
              className="homeSectionLink"
            >
              همه دسته‌بندی‌ها →
            </Link>
          </div>

          <div className="homeCategories">
            {categories.map(
              (category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${encodeURIComponent(
                    category.value
                  )}`}
                  className="homeCategory"
                >
                  <span className="homeCategoryIcon">
                    ✦
                  </span>

                  <strong>
                    {category.label}
                  </strong>

                  <span>
                    مشاهده →
                  </span>
                </Link>
              )
            )}
          </div>
        </section>
      )}

      {/* ==================================================
          BENEFITS
      ================================================== */}

      <section className="container homeSection homeBenefitsSection">
        <div className="homeBenefits">
          <article>
            <span>
              ◈
            </span>

            <div>
              <strong>
                قیمت شفاف
              </strong>

              <p>
                قیمت‌گذاری بر اساس نرخ روز
                طلا.
              </p>
            </div>
          </article>

          <article>
            <span>
              ◉
            </span>

            <div>
              <strong>
                موجودی واقعی
              </strong>

              <p>
                موجودی محصولات قبل از سفارش
                بررسی می‌شود.
              </p>
            </div>
          </article>

          <article>
            <span>
              ✓
            </span>

            <div>
              <strong>
                خرید مطمئن
              </strong>

              <p>
                حساب، سفارش و پرداخت در یک
                محیط یکپارچه.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ==================================================
          FEATURED
      ================================================== */}

      <section className="container homeSection">
        <div className="homeSectionHead">
          <div>
            <span className="eyebrow">
              FEATURED
            </span>

            <h2>
              انتخاب‌های
              <span>
                محبوب
              </span>
            </h2>

            <p>
              چند محصول منتخب برای شروع
              انتخابت.
            </p>
          </div>

          <Link
            href="/shop"
            className="homeSectionLink"
          >
            مشاهده همه →
          </Link>
        </div>

        {featured.length ===
        0 ? (
          <div className="homeEmpty">
            <h3>
              فعلاً محصول فعالی وجود ندارد.
            </h3>

            <Link
              href="/shop"
              className="button"
            >
              فروشگاه
            </Link>
          </div>
        ) : (
          <div className="products homeProducts">
            {featured.map(
              (product) => {
                const price =
                  calculateProductPrice(
                    product.weight,
                    gold.price18k,
                    product.laborPercent,
                    product.profitPercent,
                    product.taxPercent,
                    product.manualPrice
                  );

                return (
                  <ProductCard
                    key={product.id}
                    product={{
                      id:
                        product.id,
                      name:
                        product.name,
                      category:
                        product.category,
                      weight:
                        product.weight,
                      karat:
                        product.karat,
                      laborPercent:
                        product.laborPercent,
                      profitPercent:
                        product.profitPercent,
                      stock:
                        product.stock,
                      image:
                        product.image,
                      price,
                    }}
                  />
                );
              }
            )}
          </div>
        )}
      </section>

      {/* ==================================================
          CTA
      ================================================== */}

      <section className="container homeSection homeCtaSection">
        <div className="homeCta">
          <div>
            <span className="eyebrow">
              FIND YOUR GOLD
            </span>

            <h2>
              انتخابی که
              <span>
                ماندگار می‌ماند.
              </span>
            </h2>

            <p>
              مجموعه کامل را ببین، بر اساس
              قیمت، وزن و عیار فیلتر کن و
              انتخابت را انجام بده.
            </p>

            <Link
              href="/shop"
              className="button"
            >
              ورود به فروشگاه
            </Link>
          </div>

          <div className="homeCtaOrb" />
        </div>
      </section>
    </main>
  );
}