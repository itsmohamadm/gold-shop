import { prisma } from '@/lib/prisma';

const API_URL =
  'https://baha24.com/api/v1/price';

const BAHA24_GOLD_PAGE =
  'https://baha24.com/قیمت-طلا';

type BahaPrice = {
  title: string;
  symbol: string;
  sell: string;
  last_update: string;
};

type GoldChangeDirection =
  | 'up'
  | 'down'
  | 'flat';

export type GoldData = {
  price18k: number;
  source: 'baha24' | 'fallback';
  lastUpdate: string;
  change24h: number | null;
  changeDirection:
    | GoldChangeDirection
    | null;
};

const CACHE_TIME =
  60 * 1000;

let cachedGold:
  GoldData | null = null;

let cachedAt = 0;

export type Product = {
  id: number;
  name: string;
  category: string;
  weight: number;
  karat: number;
  laborPercent: number;
  profitPercent: number;
  taxPercent: number;
  manualPrice?: number | null;
  stock: number;
  active: boolean;
  image?: string | null;
};

/* ==================================================
   دریافت درصد 24 ساعته از صفحه عمومی بها24
================================================== */

async function fetchBaha24Change24h(): Promise<
  number | null
> {
  try {
    const response = await fetch(
      'https://baha24.com/قیمت-طلا',
      {
        cache: 'no-store',
        headers: {
          'User-Agent':
            'Mozilla/5.0',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const html =
      await response.text();

    /*
     * متن خام صفحه را تمیز می‌کنیم.
     */
    const text = html
      .replace(
        /<script[\s\S]*?<\/script>/gi,
        ' '
      )
      .replace(
        /<style[\s\S]*?<\/style>/gi,
        ' '
      )
      .replace(
        /<[^>]+>/g,
        ' '
      )
      .replace(
        /&nbsp;/gi,
        ' '
      )
      .replace(
        /\s+/g,
        ' '
      )
      .trim();

    /*
     * بها۲۴ برای GOL18 معمولاً چیزی
     * شبیه این در صفحه دارد:
     *
     * گرم طلا GOL18 ... +3.00%
     *
     * پس فقط محدوده نزدیک GOL18
     * را بررسی می‌کنیم.
     */
    const match =
      text.match(
        /GOL18[\s\S]{0,500}?([+-]?\d+(?:[.,]\d+)?)\s*%/
      );

    if (!match) {
      console.warn(
        'GOL18 24H change not found'
      );

      return null;
    }

    const value = Number(
      match[1].replace(
        ',',
        '.'
      )
    );

    if (
      !Number.isFinite(value)
    ) {
      return null;
    }

    return value;
  } catch (error) {
    console.warn(
      'BAHA24 24H CHANGE ERROR:',
      error
    );

    return null;
  }
}

/* ==================================================
   قیمت طلا
================================================== */

export async function fetchGoldPrice(): Promise<GoldData> {
  const now = Date.now();

  if (
    cachedGold &&
    now - cachedAt < CACHE_TIME
  ) {
    return cachedGold;
  }

  try {
    const response = await fetch(
      API_URL,
      {
        cache: 'no-store',
      }
    );

    if (
      response.status === 429
    ) {
      console.warn(
        'Baha24 rate limit reached.'
      );

      if (cachedGold) {
        return cachedGold;
      }

      return {
        price18k: 19063670,
        source: 'fallback',
        lastUpdate:
          'fallback',
        change24h: null,
        changeDirection:
          null,
      };
    }

    if (!response.ok) {
      throw new Error(
        `Baha24 API error: ${response.status}`
      );
    }

    const data: BahaPrice[] =
      await response.json();

    const gold =
      data.find(
        (item) =>
          item.symbol ===
          'GOL18'
      );

    if (!gold) {
      throw new Error(
        'GOL18 price not found'
      );
    }

    const price18k = Number(
      gold.sell
    );

    if (
      !Number.isFinite(
        price18k
      )
    ) {
      throw new Error(
        'Invalid GOL18 price'
      );
    }

    const change24h =
      await fetchBaha24Change24h();

    let changeDirection:
      | GoldChangeDirection
      | null = null;

    if (
      change24h !== null
    ) {
      if (change24h > 0) {
        changeDirection =
          'up';
      } else if (
        change24h < 0
      ) {
        changeDirection =
          'down';
      } else {
        changeDirection =
          'flat';
      }
    }

    cachedGold = {
      price18k,
      source:
        'baha24',
      lastUpdate:
        gold.last_update,
      change24h,
      changeDirection,
    };

    cachedAt = now;

    return cachedGold;
  } catch (error) {
    console.error(
      'GOLD PRICE ERROR:',
      error
    );

    if (cachedGold) {
      return cachedGold;
    }

    return {
      price18k: 19063670,
      source:
        'fallback',
      lastUpdate:
        'fallback',
      change24h: null,
      changeDirection:
        null,
    };
  }
}

/* ==================================================
   محاسبه قیمت محصول
================================================== */

export function calculateProductPrice(
  weight: number,
  goldPrice: number,
  laborPercent = 0,
  profitPercent = 0,
  taxPercent = 0,
  manualPrice?: number | null
) {
  if (
    manualPrice !== null &&
    manualPrice !== undefined &&
    manualPrice > 0
  ) {
    return manualPrice;
  }

  const goldValue =
    weight * goldPrice;

  const labor =
    goldValue *
    (laborPercent / 100);

  const profit =
    (goldValue + labor) *
    (profitPercent / 100);

  const tax =
    (goldValue +
      labor +
      profit) *
    (taxPercent / 100);

  return Math.round(
    goldValue +
      labor +
      profit +
      tax
  );
}

/* ==================================================
   محصولات
================================================== */

export async function loadProducts(): Promise<
  Product[]
> {
  const products =
    await prisma.product.findMany({
      orderBy: {
        id: 'asc',
      },
    });

  return products.map(
    (product) => ({
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
      taxPercent:
        product.taxPercent,
      manualPrice:
        product.manualPrice,
      stock:
        product.stock,
      active:
        product.active,
      image:
        product.image,
    })
  );
}