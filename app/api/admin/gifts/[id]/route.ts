import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { parseGift } from "@/lib/validate";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const id = Number((await params).id);
  const parsed = parseGift(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const ok = await getStore().updateGift(id, parsed.value);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "No existe." }, { status: 404 });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const ok = await getStore().deleteGift(Number((await params).id));
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "No existe." }, { status: 404 });
}
