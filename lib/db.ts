import { neon } from "@neondatabase/serverless";
import type { Gift, GiftInput, Pledge, PledgeInput } from "./types";
import { SEED_GIFTS } from "./seedGifts";


type Store = {
  listGifts(): Promise<Gift[]>;
  getGift(id: number): Promise<Gift | null>;
  createGift(input: GiftInput): Promise<void>;
  updateGift(id: number, input: GiftInput): Promise<boolean>;
  deleteGift(id: number): Promise<boolean>;
  createPledge(input: PledgeInput): Promise<boolean>;
  listPledges(): Promise<Pledge[]>;
  deletePledge(id: number): Promise<boolean>;
};

function withTotals(base: { id: number; category: string; name: string; description: string; link: string; quantity: number }, pledged: number): Gift {
  return { ...base, pledged, remaining: Math.max(0, base.quantity - pledged) };
}

/* ------------------------------ Neon (producción) ------------------------------ */

function neonStore(url: string): Store {
  const sql = neon(url);
  let ready: Promise<void> | null = null;

  async function setup() {
    await sql`CREATE TABLE IF NOT EXISTS gifts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      link TEXT NOT NULL DEFAULT '',
      quantity INT NOT NULL CHECK (quantity >= 0),
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS pledges (
      id SERIAL PRIMARY KEY,
      gift_id INT NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
      giver_name TEXT NOT NULL,
      quantity INT NOT NULL CHECK (quantity > 0),
      co_givers TEXT[] NOT NULL DEFAULT '{}',
      message TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS pledges_gift_id_idx ON pledges(gift_id)`;
    await sql`ALTER TABLE gifts ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT ''`;
    await sql`CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`;
    const seeded = await sql`INSERT INTO app_meta (key, value) VALUES ('seeded', '1')
      ON CONFLICT (key) DO NOTHING RETURNING key`;
    if (seeded.length > 0) {
      for (const [i, g] of SEED_GIFTS.entries()) {
        await sql`INSERT INTO gifts (category, name, description, link, quantity, sort_order)
          VALUES (${g.category}, ${g.name}, ${g.description}, ${g.link}, ${g.quantity}, ${i})`;
      }
    }
  }

  async function db() {
    if (!ready) ready = setup().catch((e) => { ready = null; throw e; });
    await ready;
    return sql;
  }

  function mapGift(r: Record<string, unknown>): Gift {
    return withTotals(
      { id: Number(r.id), category: String(r.category ?? ""), name: String(r.name), description: String(r.description), link: String(r.link), quantity: Number(r.quantity) },
      Number(r.pledged),
    );
  }

  return {
    async listGifts() {
      const s = await db();
      const rows = await s`SELECT g.*, COALESCE(SUM(p.quantity), 0)::int AS pledged
        FROM gifts g LEFT JOIN pledges p ON p.gift_id = g.id
        GROUP BY g.id ORDER BY g.sort_order, g.id`;
      return rows.map(mapGift);
    },
    async getGift(id) {
      const s = await db();
      const rows = await s`SELECT g.*, COALESCE(SUM(p.quantity), 0)::int AS pledged
        FROM gifts g LEFT JOIN pledges p ON p.gift_id = g.id
        WHERE g.id = ${id} GROUP BY g.id`;
      return rows[0] ? mapGift(rows[0]) : null;
    },
    async createGift(g) {
      const s = await db();
      await s`INSERT INTO gifts (category, name, description, link, quantity, sort_order)
        VALUES (${g.category}, ${g.name}, ${g.description}, ${g.link}, ${g.quantity},
          (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM gifts))`;
    },
    async updateGift(id, g) {
      const s = await db();
      const rows = await s`UPDATE gifts SET category = ${g.category}, name = ${g.name}, description = ${g.description},
        link = ${g.link}, quantity = ${g.quantity} WHERE id = ${id} RETURNING id`;
      return rows.length > 0;
    },
    async deleteGift(id) {
      const s = await db();
      const rows = await s`DELETE FROM gifts WHERE id = ${id} RETURNING id`;
      return rows.length > 0;
    },
    async createPledge(p) {
      const s = await db();
      // Inserta solo si todavía queda cantidad suficiente (validación atómica en una sola sentencia).
      const rows = await s`INSERT INTO pledges (gift_id, giver_name, quantity, co_givers, message)
        SELECT g.id, ${p.giverName}::text, ${p.quantity}::int, ${p.coGivers}::text[], ${p.message}::text
        FROM gifts g
        WHERE g.id = ${p.giftId}::int
          AND g.quantity - COALESCE((SELECT SUM(x.quantity) FROM pledges x WHERE x.gift_id = g.id), 0) >= ${p.quantity}::int
        RETURNING id`;
      return rows.length > 0;
    },
    async listPledges() {
      const s = await db();
      const rows = await s`SELECT * FROM pledges ORDER BY created_at DESC`;
      return rows.map((r) => ({
        id: Number(r.id),
        giftId: Number(r.gift_id),
        giverName: String(r.giver_name),
        quantity: Number(r.quantity),
        coGivers: (r.co_givers as string[]) ?? [],
        message: String(r.message ?? ""),
        createdAt: new Date(r.created_at as string).toISOString(),
      }));
    },
    async deletePledge(id) {
      const s = await db();
      const rows = await s`DELETE FROM pledges WHERE id = ${id} RETURNING id`;
      return rows.length > 0;
    },
  };
}

/* ------------------- Memoria (desarrollo local sin DATABASE_URL) ------------------- */

type MemGift = GiftInput & { id: number };
type MemState = { gifts: MemGift[]; pledges: Pledge[]; nextGift: number; nextPledge: number };

function memoryStore(): Store {
  const g = globalThis as unknown as { __bsMem?: MemState };
  if (!g.__bsMem) {
    g.__bsMem = {
      gifts: SEED_GIFTS.map((x, i) => ({ ...x, id: i + 1 })),
      pledges: [],
      nextGift: SEED_GIFTS.length + 1,
      nextPledge: 1,
    };
  }
  const m = g.__bsMem;
  const pledgedFor = (id: number) => m.pledges.filter((p) => p.giftId === id).reduce((a, p) => a + p.quantity, 0);
  const toGift = (x: MemGift) => withTotals(x, pledgedFor(x.id));

  return {
    async listGifts() { return m.gifts.map(toGift); },
    async getGift(id) { const x = m.gifts.find((y) => y.id === id); return x ? toGift(x) : null; },
    async createGift(input) { m.gifts.push({ ...input, id: m.nextGift++ }); },
    async updateGift(id, input) {
      const x = m.gifts.find((y) => y.id === id);
      if (!x) return false;
      Object.assign(x, input);
      return true;
    },
    async deleteGift(id) {
      const before = m.gifts.length;
      m.gifts = m.gifts.filter((y) => y.id !== id);
      m.pledges = m.pledges.filter((p) => p.giftId !== id);
      return m.gifts.length < before;
    },
    async createPledge(p) {
      const x = m.gifts.find((y) => y.id === p.giftId);
      if (!x || x.quantity - pledgedFor(x.id) < p.quantity) return false;
      m.pledges.push({ ...p, id: m.nextPledge++, createdAt: new Date().toISOString() });
      return true;
    },
    async listPledges() { return [...m.pledges].reverse(); },
    async deletePledge(id) {
      const before = m.pledges.length;
      m.pledges = m.pledges.filter((p) => p.id !== id);
      return m.pledges.length < before;
    },
  };
}

let store: Store | null = null;
export function getStore(): Store {
  if (!store) store = process.env.DATABASE_URL ? neonStore(process.env.DATABASE_URL) : memoryStore();
  return store;
}

export const usingMemory = () => !process.env.DATABASE_URL;
