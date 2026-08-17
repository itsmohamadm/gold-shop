import { NextResponse } from 'next/server';
import { fetchGoldPrice } from '@/lib/gold';

export const dynamic = 'force-dynamic';
export async function GET() {
  const price = await fetchGoldPrice();
  return NextResponse.json(price, { headers: { 'Cache-Control': 'no-store' } });
}
