import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { publicGift } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const gifts = await getStore().listGifts();
  return NextResponse.json({ gifts: gifts.map(publicGift) });
}
