import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { parsePledge } from "@/lib/validate";

export async function POST(req: Request) {
  const parsed = parsePledge(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const store = getStore();
  const gift = await store.getGift(parsed.value.giftId);
  if (!gift) return NextResponse.json({ error: "Ese regalo ya no está en la lista." }, { status: 404 });

  const ok = await store.createPledge(parsed.value);
  if (!ok) {
    const fresh = await store.getGift(parsed.value.giftId);
    const left = fresh?.remaining ?? 0;
    return NextResponse.json(
      {
        error: left === 0
          ? "¡Alguien se te adelantó! Este regalo ya está completo."
          : `Solo faltan ${left}. Ajustá la cantidad, por favor.`,
        gift: fresh,
      },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true, gift: await store.getGift(parsed.value.giftId) });
}
