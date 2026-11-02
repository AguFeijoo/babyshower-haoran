import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { parseGift } from "@/lib/validate";
import { parseId } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const id = parseId((await params).id);
  if (id === null) return NextResponse.json({ error: "No existe." }, { status: 404 });
  const parsed = parseGift(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const store = getStore();
  const current = await store.getGift(id);
  if (!current) return NextResponse.json({ error: "No existe." }, { status: 404 });
  // Unidades y pesos no se pueden mezclar: si ya hay respuestas, no se cambia entre dinero y unidades.
  const wasMoney = current.mode === "money";
  const isMoney = parsed.value.mode === "money";
  if (current.pledgeCount > 0 && wasMoney !== isMoney) {
    return NextResponse.json(
      { error: wasMoney
          ? "Este aporte ya tiene montos anotados, así que no puede pasar a ser un regalo por unidades. Creá un regalo nuevo."
          : "Este regalo ya tiene unidades prometidas, así que no puede pasar a ser de dinero. Creá un regalo nuevo para los aportes." },
      { status: 400 },
    );
  }
  const ok = await store.updateGift(id, parsed.value);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "No existe." }, { status: 404 });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const id = parseId((await params).id);
  if (id === null) return NextResponse.json({ error: "No existe." }, { status: 404 });
  const ok = await getStore().deleteGift(id);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "No existe." }, { status: 404 });
}
