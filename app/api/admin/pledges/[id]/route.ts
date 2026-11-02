import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { parseId } from "@/lib/types";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const id = parseId((await params).id);
  if (id === null) return NextResponse.json({ error: "No existe." }, { status: 404 });
  const ok = await getStore().deletePledge(id);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "No existe." }, { status: 404 });
}
