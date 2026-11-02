import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getStore } from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const ok = await getStore().deletePledge(Number((await params).id));
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "No existe." }, { status: 404 });
}
