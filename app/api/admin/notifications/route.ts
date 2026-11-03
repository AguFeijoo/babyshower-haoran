import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getStore } from "@/lib/db";

// Marca las notificaciones como leídas hasta la respuesta más nueva que vieron los papás.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { until?: string };
  const until = Date.parse(String(body.until ?? ""));
  if (!Number.isFinite(until)) return NextResponse.json({ error: "Fecha inválida." }, { status: 400 });
  const store = getStore();
  const current = await store.getSeenAt();
  // Nunca retrocede (por si dos dispositivos marcan a la vez).
  if (!current || Date.parse(current) < until) await store.setSeenAt(new Date(until).toISOString());
  return NextResponse.json({ ok: true });
}
