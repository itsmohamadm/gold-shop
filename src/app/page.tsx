import Link from 'next/link';

import ProductCard from '@/components/shop/ProductCard';

import {
  fetchGoldPrice,
  loadProducts,
  calculateProductPrice,
} from '@/lib/gold';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
      take: 6,
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
    <main>
      {/* ==================================================
          HERO
      ================================================== */}
      <section className="hero">
        <div className="container heroGrid">
          <div>
            <span className="eyebrow">
              GOLD • JEWELRY • PREMIUM
            </span>

            <h1>
              طلا را متفاوت انتخاب کن.
            </h1>

            <p>
              مجموعه‌ای از زیورآلات طلا با
              قیمت‌گذاری شفاف، موجودی واقعی
              و تجربه خرید مدرن.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                marginTop: '26px',
              }}
            >
              <Link
                href="/shop"
                className="button"
              >
                مشاهده مجموعه
              </Link>

              <Link
                href="/shop?sort=newest"
                className="button"
              >
                جدیدترین محصولات
              </Link>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '22px',
                flexWrap: 'wrap',
                marginTop: '28px',
                color: 'var(--text-muted)',
                fontSize: '14px',
              }}
            >
              <span>
                ✓ قیمت‌گذاری شفاف
              </span>

              <span>
                ✓ موجودی واقعی
              </span>

              <span>
                ✓ خرید امن
              </span>
            </div>
          </div>

          <div className="priceCard">
            <span>
              قیمت لحظه‌ای طلا
            </span>

            <small
              style={{
                marginTop: '16px',
                fontSize: '14px',
              }}
            >
              طلای ۱۸ عیار
            </small>

            <strong>
              {gold.price18k.toLocaleString(
                'fa-IR'
              )}{' '}
              تومان
            </strong>

            <div
              style={{
                height: '1px',
                background:
                  'rgba(212,175,55,0.18)',
                margin:
                  '22px 0 14px',
              }}
            />

            <small>
              منبع: Baha24
            </small>

            <small>
              آخرین بروزرسانی:{' '}
              {gold.lastUpdate}
            </small>

            <Link
              href="/shop"
              className="button"
              style={{
                marginTop: '22px',
                width: '100%',
              }}
            >
              خرید طلا
            </Link>
          </div>
        </div>
      </section>

      {/* ==================================================
          GOLD TICKER
      ================================================== */}
      <section
        style={{
          borderBottom:
            '1px solid rgba(212,175,55,0.12)',
          background:
            'rgba(212,175,55,0.025)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
              gap: '20px',
              padding: '18px 0',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background:
                    'var(--success)',
                  boxShadow:
                    '0 0 14px rgba(85,201,133,0.6)',
                }}
              />

              <strong>
                قیمت لحظه‌ای
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                طلای ۱۸ عیار
              </span>

              <strong
                style={{
                  color:
                    'var(--gold-light)',
                  fontSize: '18px',
                }}
              >
                {gold.price18k.toLocaleString(
                  'fa-IR'
                )}{' '}
                تومان
              </strong>

              <small>
                {gold.lastUpdate}
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          BENEFITS
      ================================================== */}
      <section className="container section">
        <div className="sectionHead">
          <div>
            <span className="eyebrow">
              WHY ZARIN GOLD
            </span>

            <h2
              style={{
                marginTop: '10px',
              }}
            >
              خرید مطمئن، بدون پیچیدگی
            </h2>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, minmax(0, 1fr))',
            gap: '16px',
          }}
        >
          <article className="product">
            <div
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',
                borderRadius: '14px',
                background:
                  'rgba(212,175,55,0.10)',
                color:
                  'var(--gold-light)',
                fontSize: '22px',
                marginBottom: '18px',
              }}
            >
              ◈
            </div>

            <h3>
              قیمت شفاف
            </h3>

            <p>
              قیمت محصولات بر اساس قیمت
              روز طلا محاسبه می‌شود.
            </p>
          </article>

          <article className="product">
            <div
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',
                borderRadius: '14px',
                background:
                  'rgba(212,175,55,0.10)',
                color:
                  'var(--gold-light)',
                fontSize: '22px',
                marginBottom: '18px',
              }}
            >
              ◉
            </div>

            <h3>
              موجودی واقعی
            </h3>

            <p>
              موجودی فروشگاه به‌صورت
              مستقیم کنترل می‌شود.
            </p>
          </article>

          <article className="product">
            <div
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',
                borderRadius: '14px',
                background:
                  'rgba(212,175,55,0.10)',
                color:
                  'var(--gold-light)',
                fontSize: '22px',
                marginBottom: '18px',
              }}
            >
              ◇
            </div>

            <h3>
              تجربه خرید امن
            </h3>

            <p>
              حساب کاربری، سفارش‌ها و
              پرداخت‌ها در یک محیط یکپارچه.
            </p>
          </article>
        </div>
      </section>

      {/* ==================================================
          CATEGORIES
      ================================================== */}
      {categories.length > 0 && (
        <section
          style={{
            paddingBottom: '24px',
          }}
        >
          <div className="container">
            <div className="sectionHead">
              <div>
                <span className="eyebrow">
                  COLLECTIONS
                </span>

                <h2
                  style={{
                    marginTop: '10px',
                  }}
                >
                  دسته‌بندی‌ها
                </h2>
              </div>

              <Link href="/shop">
                مشاهده همه →
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(6, minmax(0, 1fr))',
                gap: '12px',
              }}
            >
              {categories.map(
                (category) => (
                  <Link
                    key={category.id}
                    href={`/shop?category=${encodeURIComponent(
                      category.value
                    )}`}
                    className="product"
                    style={{
                      textAlign:
                        'center',
                      padding: '22px 14px',
                    }}
                  >
                    <span
                      style={{
                        display:
                          'block',
                        color:
                          'var(--gold-light)',
                        fontSize:
                          '28px',
                        marginBottom:
                          '8px',
                      }}
                    >
                      ✦
                    </span>

                    <strong>
                      {category.label}
                    </strong>
                  </Link>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          FEATURED PRODUCTS
      ================================================== */}
      <section className="container section">
        <div className="sectionHead">
          <div>
            <span className="eyebrow">
              FEATURED
            </span>

            <h2
              style={{
                marginTop: '10px',
              }}
            >
              محصولات منتخب
            </h2>

            <p
              style={{
                marginTop: '10px',
                color:
                  'var(--text-soft)',
              }}
            >
              بخشی از انتخاب‌های محبوب
              فروشگاه را ببینید.
            </p>
          </div>

          <Link href="/shop">
            همه محصولات →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="product">
            <p>
              در حال حاضر محصول فعالی
              برای نمایش وجود ندارد.
            </p>

            <Link
              href="/shop"
              className="button"
            >
              رفتن به فروشگاه
            </Link>
          </div>
        ) : (
          <div className="products">
            {featured.map((product) => {
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
                    id: product.id,
                    name: product.name,
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
            })}
          </div>
        )}
      </section>

      {/* ==================================================
          CTA
      ================================================== */}
      <section
        className="container"
        style={{
          paddingBottom: '80px',
        }}
      >
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '48px',
            borderRadius:
              'var(--radius-lg)',
            border:
              '1px solid rgba(212,175,55,0.32)',
            background:
              'linear-gradient(135deg, rgba(212,175,55,0.11), rgba(255,255,255,0.025))',
          }}
        >
          <div
            style={{
              position: 'relative',
              zIndex: 1,
            }}
          >
            <span className="eyebrow">
              FIND YOUR GOLD
            </span>

            <h2
              style={{
                marginTop: '12px',
              }}
            >
              انتخاب بعدی تو شاید همین‌جا باشد.
            </h2>

            <p
              style={{
                maxWidth: '650px',
                color:
                  'var(--text-soft)',
                marginTop: '12px',
              }}
            >
              مجموعه کامل محصولات را ببین،
              بر اساس قیمت، وزن و عیار فیلتر
              کن و انتخابت را با خیال راحت
              انجام بده.
            </p>

            <Link
              href="/shop"
              className="button"
              style={{
                marginTop: '10px',
              }}
            >
              ورود به فروشگاه
            </Link>
          </div>

          <div
            style={{
              position: 'absolute',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background:
                'rgba(212,175,55,0.10)',
              filter: 'blur(70px)',
              left: '-80px',
              bottom: '-130px',
            }}
          />
        </div>
      </section>
    </main>
  );
}