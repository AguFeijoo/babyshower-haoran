import type { GiftInput, PledgeInput } from "./types";

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const toInt = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isInteger(n) ? n : NaN;
};

export function parseGift(body: unknown): { ok: true; value: GiftInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const category = clean(b.category, 60);
  const name = clean(b.name, 120);
  const description = clean(b.description, 400);
  let link = clean(b.link, 500);
  const quantity = toInt(b.quantity);
  if (!name) return { ok: false, error: "El regalo necesita un nombre." };
  if (!Number.isFinite(quantity) || quantity < 0 || quantity > 9999)
    return { ok: false, error: "La cantidad tiene que ser un número entero entre 0 y 9999." };
  if (link && !/^https?:\/\//i.test(link)) link = `https://${link}`;
  return { ok: true, value: { category, name, description, link, quantity } };
}

export function parsePledge(body: unknown): { ok: true; value: PledgeInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const giftId = toInt(b.giftId);
  const giverName = clean(b.giverName, 80);
  const quantity = toInt(b.quantity);
  const message = clean(b.message, 500);
  const coGivers = Array.isArray(b.coGivers)
    ? b.coGivers.map((x) => clean(x, 80)).filter(Boolean).slice(0, 20)
    : [];
  if (!Number.isFinite(giftId)) return { ok: false, error: "Regalo inválido." };
  if (!giverName) return { ok: false, error: "Contanos tu nombre." };
  if (!Number.isFinite(quantity) || quantity < 1) return { ok: false, error: "La cantidad mínima es 1." };
  return { ok: true, value: { giftId, giverName, quantity, coGivers, message } };
}
