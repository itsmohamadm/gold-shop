import Link from 'next/link';

import {
  fetchGoldPrice,
  loadProducts,
  calculateProductPrice,
} from '@/lib/gold';

import { prisma } from '@/lib/prisma';

import ProductCard from '@/components/shop/ProductCard';

export const dynamic =
  'force-dynamic';

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
    searchParams.category ||
    'all';

  const searchQuery =
    (
      searchParams.q || ''
    ).trim();

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
    Number(
      searchParams.karat || 0
    );

  const selectedSort =
    searchParams.sort ||
    'newest';

  const filteredProducts =
    products
      .filter((product) => {
        if (!product.active) {
          return false;
        }

        if (
          selectedCategory !==
            'all' &&
          product.category !==
            selectedCategory
        ) {
          return false;
        }

        if (
          searchQuery &&
          !product.name
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            )
        ) {
          return false;
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
      .map((product) => ({
        ...product,

        calculatedPrice:
          calculateProductPrice(
            product.weight,
            gold.price18k,
            product.laborPercent,
            product.profitPercent,
            product.taxPercent,
            product.manualPrice
          ),
      }))
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
      switch (
        selectedSort
      ) {
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

    Object.entries(
      values
    ).forEach(
      ([key, value]) => {
        if (
          value !==
            undefined &&
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

  return (
    <main className="shopPage container">
      {/* Header */}

      <section className="shopHero">
        <div>
          <span className="eyebrow">
            GOLD COLLECTION
          </span>

          <h1>
            فروشگاه
            <span>
              طلا
            </span>
          </h1>

          <p>
            محصولات را جستجو کن، فیلتر کن و
            با قیمت لحظه‌ای طلا انتخاب کن.
          </p>
        </div>

        <div className="shopLivePrice">
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
      </section>

      {/* Search */}

      <form
        method="GET"
        action="/shop"
        className="shopSearch"
      >
        <input
          type="hidden"
          name="category"
          value={
            selectedCategory !==
            'all'
              ? selectedCategory
              : ''
          }
        />

        <div className="shopSearchInput">
          <span>
            ⌕
          </span>

          <input
            type="search"
            name="q"
            value={
              searchQuery
            }
            onChange={
              undefined
            }
            placeholder="چه چیزی می‌خواهی پیدا کنی؟"
            aria-label="جستجوی محصول"
          />
        </div>

        <button
          type="submit"
          className="button"
        >
          جستجو
        </button>
      </form>

      {/* Categories */}

      <div className="shopCategoryScroller">
        <Link
          href="/shop"
          className={
            selectedCategory ===
            'all'
              ? 'shopCategoryPill active'
              : 'shopCategoryPill'
          }
        >
          همه
        </Link>

        {categories.map(
          (category) => (
            <Link
              key={category.id}
              href={buildShopUrl({
                category:
                  category.value,
              })}
              className={
                selectedCategory ===
                category.value
                  ? 'shopCategoryPill active'
                  : 'shopCategoryPill'
              }
            >
              {category.label}
            </Link>
          )
        )}
      </div>

      <div className="shopLayout">
        {/* Filters */}

        <aside className="shopFiltersPanel">
          <div className="shopFiltersHead">
            <div>
              <span className="eyebrow">
                FILTER
              </span>

              <h2>
                فیلترها
              </h2>
            </div>

            <Link href="/shop">
              پاک کردن
            </Link>
          </div>

          <form
            method="GET"
            action="/shop"
            className="shopFiltersForm"
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

            <label>
              جستجو

              <input
                type="search"
                name="q"
                defaultValue={
                  searchQuery
                }
                placeholder="نام محصول..."
              />
            </label>

            <div className="shopFilterBlock">
              <span>
                قیمت
              </span>

              <div className="shopTwoInputs">
                <input
                  type="number"
                  name="minPrice"
                  min="0"
                  defaultValue={
                    minPrice > 0
                      ? minPrice
                      : ''
                  }
                  placeholder="از"
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
                  placeholder="تا"
                />
              </div>

              <small>
                تومان
              </small>
            </div>

            <div className="shopFilterBlock">
              <span>
                وزن
              </span>

              <div className="shopTwoInputs">
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
                  placeholder="از"
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
                  placeholder="تا"
                />
              </div>

              <small>
                گرم
              </small>
            </div>

            <div className="shopFilterBlock">
              <span>
                عیار
              </span>

              <div className="karatOptions">
                {[
                  {
                    value: '',
                    label:
                      'همه',
                  },
                  {
                    value:
                      '18',
                    label:
                      '۱۸',
                  },
                  {
                    value:
                      '21',
                    label:
                      '۲۱',
                  },
                  {
                    value:
                      '24',
                    label:
                      '۲۴',
                  },
                ].map(
                  (option) => (
                    <label
                      key={
                        option.value
                      }
                      className="karatOption"
                    >
                      <input
                        type="radio"
                        name="karat"
                        value={
                          option.value
                        }
                        defaultChecked={
                          String(
                            selectedKarat ||
                              ''
                          ) ===
                          option.value
                        }
                      />

                      <span>
                        {
                          option.label
                        }
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>

            <button
              type="submit"
              className="button shopApplyFilter"
            >
              اعمال فیلتر
            </button>
          </form>
        </aside>

        {/* Products */}

        <section className="shopResults">
          <div className="shopResultsToolbar">
            <div>
              <strong>
                {sortedProducts.length.toLocaleString(
                  'fa-IR'
                )}
              </strong>

              <span>
                محصول
              </span>
            </div>

            <div className="shopSort">
              <label>
                مرتب‌سازی

                <select
                  name="sort"
                  defaultValue={
                    selectedSort
                  }
                  onChange={
                    undefined
                  }
                >
                  <option value="newest">
                    جدیدترین
                  </option>

                  <option value="price-asc">
                    ارزان‌ترین
                  </option>

                  <option value="price-desc">
                    گران‌ترین
                  </option>

                  <option value="weight-asc">
                    سبک‌ترین
                  </option>

                  <option value="weight-desc">
                    سنگین‌ترین
                  </option>

                  <option value="name-asc">
                    الفبایی
                  </option>
                </select>
              </label>
            </div>
          </div>

          {/* mobile filter */}

          <details className="mobileShopFilters">
            <summary>
              <span>
                فیلتر و مرتب‌سازی
              </span>

              <span>
                + 
              </span>
            </summary>

            <form
              method="GET"
              action="/shop"
              className="mobileShopFilterContent"
            >
              <input
                type="hidden"
                name="category"
                value={
                  selectedCategory !==
                  'all'
                    ? selectedCategory
                    : ''
                }
              />

              <input
                type="search"
                name="q"
                defaultValue={
                  searchQuery
                }
                placeholder="جستجوی محصول..."
              />

              <div className="shopTwoInputs">
                <input
                  type="number"
                  name="minPrice"
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
                  defaultValue={
                    maxPrice > 0
                      ? maxPrice
                      : ''
                  }
                  placeholder="حداکثر قیمت"
                />
              </div>

              <div className="shopTwoInputs">
                <input
                  type="number"
                  name="minWeight"
                  defaultValue={
                    minWeight > 0
                      ? minWeight
                      : ''
                  }
                  placeholder="حداقل وزن"
                />

                <input
                  type="number"
                  name="maxWeight"
                  defaultValue={
                    maxWeight > 0
                      ? maxWeight
                      : ''
                  }
                  placeholder="حداکثر وزن"
                />
              </div>

              <select
                name="karat"
                defaultValue={
                  selectedKarat
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

              <select
                name="sort"
                defaultValue={
                  selectedSort
                }
              >
                <option value="newest">
                  جدیدترین
                </option>

                <option value="price-asc">
                  ارزان‌ترین
                </option>

                <option value="price-desc">
                  گران‌ترین
                </option>

                <option value="weight-asc">
                  سبک‌ترین
                </option>

                <option value="weight-desc">
                  سنگین‌ترین
                </option>
              </select>

              <button
                type="submit"
                className="button"
              >
                اعمال
              </button>
            </form>
          </details>

          {sortedProducts.length ===
          0 ? (
            <div className="shopNoResults">
              <span className="eyebrow">
                NO RESULTS
              </span>

              <h2>
                محصولی پیدا نشد
              </h2>

              <p>
                فیلترها را تغییر بده یا
                جستجوی دیگری انجام بده.
              </p>

              <Link
                href="/shop"
                className="button"
              >
                پاک کردن فیلترها
              </Link>
            </div>
          ) : (
            <div className="products shopProducts">
              {sortedProducts.map(
                (product) => (
                  <ProductCard
                    key={
                      product.id
                    }
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
                      price:
                        product.calculatedPrice,
                    }}
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}