import { pricingConfig } from '@/config/pricing';
import { prisma } from '@/lib/prisma';

const API_URL = 'https://baha24.com/api/v1/price';

type BahaPrice = {
  title: string;
  symbol: string;
  sell: string;
  last_update: string;
};

export type GoldData = {
  price18k: number;
  source: 'baha24' | 'fallback';
  lastUpdate: string;
};

const CACHE_TIME = 60 * 1000;

let cachedGold: GoldData | null = null;
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

export async function fetchGoldPrice(): Promise<GoldData> {
  const now = Date.now();

  if (cachedGold && now - cachedAt < CACHE_TIME) {
    return cachedGold;
  }

  try {
    const response = await fetch(API_URL, {
      cache: 'no-store',
    });

    if (response.status === 429) {
      console.warn('Baha24 rate limit reached. Using fallback price.');

      if (cachedGold) {
        return cachedGold;
      }

      return {
        price18k: 19063670,
        source: 'fallback',
        lastUpdate: 'fallback',
      };
    }

    if (!response.ok) {
      throw new Error(`Baha24 API error: ${response.status}`);
    }

    const data: BahaPrice[] = await response.json();

    const gold = data.find((item) => item.symbol === 'GOL18');

    if (!gold) {
      throw new Error('GOL18 price not found');
    }

    const price18k = Number(gold.sell);

    if (!Number.isFinite(price18k)) {
      throw new Error('Invalid GOL18 price');
    }

    cachedGold = {
      price18k,
      source: 'baha24',
      lastUpdate: gold.last_update,
    };

    cachedAt = now;

    return cachedGold;
  } catch (error) {
    console.error('GOLD PRICE ERROR:', error);

    if (cachedGold) {
      return cachedGold;
    }

    return {
      price18k: 19063670,
      source: 'fallback',
      lastUpdate: 'fallback',
    };
  }
}

export function calculateProductPrice(
  weight: number,
  goldPrice: number,
  laborPercent = 0,
  profitPercent = 0,
  taxPercent = 0,
  manualPrice?: number | null
) {
  if (manualPrice !== null && manualPrice !== undefined && manualPrice > 0) {
    return manualPrice;
  }

  const goldValue = weight * goldPrice;

  const labor = goldValue * (laborPercent / 100);

  const profit =
    (goldValue + labor) * (profitPercent / 100);

  const tax =
    (goldValue + labor + profit) * (taxPercent / 100);

  return Math.round(
    goldValue + labor + profit + tax
  );
}

/**
 * دریافت محصولات از دیتابیس
 */
export async function loadProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    orderBy: {
      id: 'asc',
    },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    weight: product.weight,
    karat: product.karat,
    laborPercent: product.laborPercent,
    profitPercent: product.profitPercent,
    taxPercent: product.taxPercent,
    manualPrice: product.manualPrice,
    stock: product.stock,
    active: product.active,
    image: product.image,
  }));
}