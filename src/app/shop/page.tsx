import Link from 'next/link';

import {
  fetchGoldPrice,
  loadProducts,
  calculateProductPrice,
} from '@/lib/gold';

import { prisma } from '@/lib/prisma';

import ProductCard from '@/components/shop/ProductCard';

export const dynamic = 'force-dynamic';

type ShopProps = {
  searchParams: {
    category?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    minWeight?: string;
    maxWeight?: string;
    karat?: string;
    sort?: string;
  };
};

export default async function Shop({
  searchParams,
}: ShopProps) {
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
    }),
  ]);

  const selectedCategory =
    searchParams.category || 'all';

  const searchQuery =
    (searchParams.q || '').trim();

  const minPrice = Number(
    searchParams.minPrice || 0
  );

  const maxPrice = Number(
    searchParams.maxPrice || 0
  );

  const minWeight = Number(
    searchParams.minWeight || 0
  );

  const maxWeight = Number(
    searchParams.maxWeight || 0
  );

  const selectedKarat =
    Number(searchParams.karat || 0);

  const selectedSort =
    searchParams.sort || 'newest';

  const validCategory =
    selectedCategory === 'all' ||
    categories.some(
      (category) =>
        category.value ===
        selectedCategory
    );

  const filteredProducts =
    products
      .filter((product) => {
        if (!product.active) {
          return false;
        }

        if (
          validCategory &&
          selectedCategory !==
            'all' &&
          product.category !==
            selectedCategory
        ) {
          return false;
        }

        if (searchQuery) {
          if (
            !product.name
              .toLowerCase()
              .includes(
                searchQuery.toLowerCase()
              )
          ) {
            return false;
          }
        }

        if (
          selectedKarat > 0 &&
          product.karat !==
            selectedKarat
        ) {
          return false;
        }

        if (
          minWeight > 0 &&
          product.weight <
            minWeight
        ) {
          return false;
        }

        if (
          maxWeight > 0 &&
          product.weight >
            maxWeight
        ) {
          return false;
        }

        return true;
      })
      .map((product) => {
        const calculatedPrice =
          calculateProductPrice(
            product.weight,
            gold.price18k,
            product.laborPercent,
            product.profitPercent,
            product.taxPercent,
            product.manualPrice
          );

        return {
          ...product,
          calculatedPrice,
        };
      })
      .filter((product) => {
        if (
          minPrice > 0 &&
          product.calculatedPrice <
            minPrice
        ) {
          return false;
        }

        if (
          maxPrice > 0 &&
          product.calculatedPrice >
            maxPrice
        ) {
          return false;
        }

        return true;
      });

  const sortedProducts = [
    ...filteredProducts,
  ];

  sortedProducts.sort(
    (a, b) => {
      switch (selectedSort) {
        case 'price-asc':
          return (
            a.calculatedPrice -
            b.calculatedPrice
          );

        case 'price-desc':
          return (
            b.calculatedPrice -
            a.calculatedPrice
          );

        case 'weight-asc':
          return (
            a.weight - b.weight
          );

        case 'weight-desc':
          return (
            b.weight - a.weight
          );

        case 'name-asc':
          return a.name.localeCompare(
            b.name,
            'fa'
          );

        default:
          return b.id - a.id;
      }
    }
  );

  function buildShopUrl(
    overrides: Record<
      string,
      string | undefined
    > = {}
  ) {
    const params =
      new URLSearchParams();

    const values = {
      category:
        selectedCategory !==
        'all'
          ? selectedCategory
          : undefined,

      q:
        searchQuery ||
        undefined,

      minPrice:
        minPrice > 0
          ? String(minPrice)
          : undefined,

      maxPrice:
        maxPrice > 0
          ? String(maxPrice)
          : undefined,

      minWeight:
        minWeight > 0
          ? String(minWeight)
          : undefined,

      maxWeight:
        maxWeight > 0
          ? String(maxWeight)
          : undefined,

      karat:
        selectedKarat > 0
          ? String(selectedKarat)
          : undefined,

      sort:
        selectedSort !==
        'newest'
          ? selectedSort
          : undefined,

      ...overrides,
    };

    Object.entries(values).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== ''
        ) {
          params.set(
            key,
            value
          );
        }
      }
    );

    const query =
      params.toString();

    return query
      ? `/shop?${query}`
      : '/shop';
  }

  const clearUrl =
    '/shop';

  return (
    <main className="container section">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="sectionHead">
        <div>
          <span className="eyebrow">
            STORE
          </span>

          <h1
            style={{
              marginTop: '10px',
            }}
          >
            فروشگاه طلا
          </h1>

          <p
            style={{
              color:
                'var(--text-soft)',
              marginTop: '10px',
              maxWidth: '650px',
            }}
          >
            مجموعه‌ای از محصولات طلا با
            قیمت‌گذاری شفاف، فیلترهای دقیق
            و موجودی به‌روز.
          </p>
        </div>

        <div className="livePrice">
          ۱۸ عیار:{' '}
          <b>
            {gold.price18k.toLocaleString(
              'fa-IR'
            )}
          </b>{' '}
          تومان
        </div>
      </div>

      {/* ==================================================
          FILTERS
      ================================================== */}

      <form
        method="GET"
        action="/shop"
        className="shopFilters"
      >
        {selectedCategory !==
          'all' && (
          <input
            type="hidden"
            name="category"
            value={
              selectedCategory
            }
          />
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(240px, 1fr) 180px 180px',
            gap: '10px',
          }}
        >
          <input
            type="search"
            name="q"
            defaultValue={
              searchQuery
            }
            placeholder="جستجوی نام محصول..."
          />

          <input
            type="number"
            name="minPrice"
            min="0"
            defaultValue={
              minPrice > 0
                ? minPrice
                : ''
            }
            placeholder="حداقل قیمت"
          />

          <input
            type="number"
            name="maxPrice"
            min="0"
            defaultValue={
              maxPrice > 0
                ? maxPrice
                : ''
            }
            placeholder="حداکثر قیمت"
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, minmax(150px, 1fr))',
            gap: '10px',
            marginTop: '10px',
          }}
        >
          <input
            type="number"
            name="minWeight"
            min="0"
            step="0.01"
            defaultValue={
              minWeight > 0
                ? minWeight
                : ''
            }
            placeholder="حداقل وزن (گرم)"
          />

          <input
            type="number"
            name="maxWeight"
            min="0"
            step="0.01"
            defaultValue={
              maxWeight > 0
                ? maxWeight
                : ''
            }
            placeholder="حداکثر وزن (گرم)"
          />

          <select
            name="karat"
            defaultValue={
              selectedKarat > 0
                ? String(
                    selectedKarat
                  )
                : ''
            }
          >
            <option value="">
              همه عیارها
            </option>

            <option value="18">
              ۱۸ عیار
            </option>

            <option value="21">
              ۲۱ عیار
            </option>

            <option value="24">
              ۲۴ عیار
            </option>
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginTop: '14px',
          }}
        >
          <button
            type="submit"
            className="button"
          >
            اعمال فیلتر
          </button>

          <Link
            href={clearUrl}
            className="button"
          >
            پاک کردن فیلتر
          </Link>
        </div>
      </form>

      {/* ==================================================
          CATEGORIES
      ================================================== */}

      <div className="shopCategories">
        <Link
          href={buildShopUrl({
            category:
              undefined,
          })}
          className="button"
        >
          همه
        </Link>

        {categories.map(
          (category) => {
            const active =
              selectedCategory ===
              category.value;

            return (
              <Link
                key={category.id}
                href={buildShopUrl({
                  category:
                    category.value,
                })}
                className="button"
                style={
                  active
                    ? {
                        background:
                          'linear-gradient(135deg, rgba(212,175,55,0.32), rgba(212,175,55,0.10))',
                        borderColor:
                          'var(--gold-light)',
                        color:
                          'var(--gold-light)',
                      }
                    : undefined
                }
              >
                {category.label}
              </Link>
            );
          }
        )}
      </div>

      {/* ==================================================
          TOOLBAR
      ================================================== */}

      <div className="shopToolbar">
        <div className="shopResultCount">
          <strong>
            {sortedProducts.length.toLocaleString(
              'fa-IR'
            )}
          </strong>{' '}
          محصول پیدا شد
        </div>

        <div className="shopToolbarSort">
          <Link
            href={buildShopUrl({
              sort: 'newest',
            })}
            className="button"
            style={
              selectedSort ===
              'newest'
                ? {
                    borderColor:
                      'var(--gold-light)',
                    color:
                      'var(--gold-light)',
                  }
                : undefined
            }
          >
            جدیدترین
          </Link>

          <Link
            href={buildShopUrl({
              sort:
                'price-asc',
            })}
            className="button"
            style={
              selectedSort ===
              'price-asc'
                ? {
                    borderColor:
                      'var(--gold-light)',
                    color:
                      'var(--gold-light)',
                  }
                : undefined
            }
          >
            ارزان‌ترین
          </Link>

          <Link
            href={buildShopUrl({
              sort:
                'price-desc',
            })}
            className="button"
            style={
              selectedSort ===
              'price-desc'
                ? {
                    borderColor:
                      'var(--gold-light)',
                    color:
                      'var(--gold-light)',
                  }
                : undefined
            }
          >
            گران‌ترین
          </Link>

          <Link
            href={buildShopUrl({
              sort:
                'weight-asc',
            })}
            className="button"
            style={
              selectedSort ===
              'weight-asc'
                ? {
                    borderColor:
                      'var(--gold-light)',
                    color:
                      'var(--gold-light)',
                  }
                : undefined
            }
          >
            سبک‌ترین
          </Link>

          <Link
            href={buildShopUrl({
              sort:
                'weight-desc',
            })}
            className="button"
            style={
              selectedSort ===
              'weight-desc'
                ? {
                    borderColor:
                      'var(--gold-light)',
                    color:
                      'var(--gold-light)',
                  }
                : undefined
            }
          >
            سنگین‌ترین
          </Link>

          <Link
            href={buildShopUrl({
              sort:
                'name-asc',
            })}
            className="button"
            style={
              selectedSort ===
              'name-asc'
                ? {
                    borderColor:
                      'var(--gold-light)',
                    color:
                      'var(--gold-light)',
                  }
                : undefined
            }
          >
            الفبا
          </Link>
        </div>
      </div>

      {/* ==================================================
          PRODUCTS
      ================================================== */}

      {sortedProducts.length ===
      0 ? (
        <div
          className="product"
          style={{
            padding:
              '38px',
            textAlign:
              'center',
          }}
        >
          <span className="eyebrow">
            NO PRODUCTS
          </span>

          <h2
            style={{
              marginTop: '12px',
            }}
          >
            محصولی با این مشخصات پیدا نشد
          </h2>

          <p
            style={{
              color:
                'var(--text-soft)',
              marginTop:
                '10px',
            }}
          >
            فیلترها را تغییر بده یا همه
            محصولات را دوباره مشاهده کن.
          </p>

          <Link
            href="/shop"
            className="button"
            style={{
              marginTop: '10px',
            }}
          >
            نمایش همه محصولات
          </Link>
        </div>
      ) : (
        <div className="products">
          {sortedProducts.map(
            (p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  category:
                    p.category,
                  weight:
                    p.weight,
                  karat:
                    p.karat,
                  laborPercent:
                    p.laborPercent,
                  profitPercent:
                    p.profitPercent,
                  stock:
                    p.stock,
                  image:
                    p.image,
                  price:
                    p.calculatedPrice,
                }}
              />
            )
          )}
        </div>
      )}
    </main>
  );
}