"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import type { Gift, Pledge } from "@/lib/types";

type Draft = { name: string; description: string; link: string; quantity: string };
const emptyDraft: Draft = { name: "", description: "", link: "", quantity: "1" };

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Algo salió mal.");
  return data;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("es-UY", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function Dashboard({ gifts, pledges, memoryMode }: { gifts: Gift[]; pledges: Pledge[]; memoryMode: boolean }) {
  const router = useRouter();
  const [newGift, setNewGift] = useState<Draft>(emptyDraft);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const people = new Set<string>();
  for (const p of pledges) {
    people.add(p.giverName.trim().toLowerCase());
    p.coGivers.forEach((c) => people.add(c.trim().toLowerCase()));
  }
  const totalNeeded = gifts.reduce((a, g) => a + g.quantity, 0);
  const totalPledged = gifts.reduce((a, g) => a + Math.min(g.pledged, g.quantity), 0);

  async function run(fn: () => Promise<unknown>) {
    setError("");
    setBusy(true);
    try {
      await fn();
      router.refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo salió mal.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function addGift(e: React.FormEvent) {
    e.preventDefault();
    const ok = await run(() => call("/api/admin/gifts", "POST", { ...newGift, quantity: Number(newGift.quantity) }));
    if (ok) setNewGift(emptyDraft);
  }

  async function saveGift(id: number) {
    const ok = await run(() => call(`/api/admin/gifts/${id}`, "PATCH", { ...draft, quantity: Number(draft.quantity) }));
    if (ok) setEditing(null);
  }

  function startEdit(g: Gift) {
    setEditing(g.id);
    setDraft({ name: g.name, description: g.description, link: g.link, quantity: String(g.quantity) });
  }

  async function removeGift(g: Gift) {
    const extra = g.pledged > 0 ? ` También se borran las ${g.pledged} unidades que ya prometieron.` : "";
    if (!confirm(`¿Eliminar "${g.name}"?${extra}`)) return;
    await run(() => call(`/api/admin/gifts/${g.id}`, "DELETE"));
  }

  async function removePledge(p: Pledge) {
    if (!confirm(`¿Eliminar la respuesta de ${p.giverName}?`)) return;
    await run(() => call(`/api/admin/pledges/${p.id}`, "DELETE"));
  }

  async function logout() {
    await call("/api/admin/logout", "POST");
    router.refresh();
  }

  return (
    <main style={{ paddingBottom: 48 }}>
      <div className="admin-top">
        <div className="container">
          <div>
            <h1>Panel de los papás</h1>
            <span style={{ opacity: 0.85 }}>Todo lo que dijeron que van a regalar</span>
          </div>
          <div className="actions">
            <Link href="/" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>Ver la web</Link>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Salir</button>
          </div>
        </div>
      </div>

      <div className="container">
        {memoryMode && (
          <div className="memory-note">
            Modo prueba: no hay DATABASE_URL, los datos se guardan en memoria y se pierden al reiniciar.
          </div>
        )}

        <div className="stats">
          <div className="stat"><b>{gifts.length}</b><span>regalos en la lista</span></div>
          <div className="stat"><b>{totalPledged}/{totalNeeded}</b><span>unidades prometidas</span></div>
          <div className="stat"><b>{gifts.filter((g) => g.remaining === 0).length}</b><span>regalos completos</span></div>
          <div className="stat"><b>{people.size}</b><span>personas participando</span></div>
        </div>

        {error && <div className="error">{error}</div>}

        <section className="panel">
          <h2>Agregar regalo</h2>
          <form className="gift-form" onSubmit={addGift}>
            <div className="field">
              <label htmlFor="ng-name">Nombre</label>
              <input id="ng-name" className="input" value={newGift.name} onChange={(e) => setNewGift({ ...newGift, name: e.target.value })} placeholder="Ej: Cochecito" required maxLength={120} />
            </div>
            <div className="field">
              <label htmlFor="ng-desc">Descripción</label>
              <input id="ng-desc" className="input" value={newGift.description} onChange={(e) => setNewGift({ ...newGift, description: e.target.value })} placeholder="Color, talle, marca…" maxLength={400} />
            </div>
            <div className="field">
              <label htmlFor="ng-link">Link (opcional)</label>
              <input id="ng-link" className="input" value={newGift.link} onChange={(e) => setNewGift({ ...newGift, link: e.target.value })} placeholder="https://…" maxLength={500} />
            </div>
            <div className="field">
              <label htmlFor="ng-qty">Cantidad</label>
              <input id="ng-qty" type="number" min={0} max={9999} className="input" value={newGift.quantity} onChange={(e) => setNewGift({ ...newGift, quantity: e.target.value })} required />
            </div>
            <button className="btn btn-pink" disabled={busy} style={{ gridColumn: "1 / -1", justifySelf: "start" }}>+ Agregar a la lista</button>
          </form>
        </section>

        <section className="panel">
          <h2>Regalos y respuestas</h2>
          {gifts.length === 0 && <p className="no-pledges">Todavía no hay regalos en la lista.</p>}
          {gifts.map((g) => {
            const list = pledges.filter((p) => p.giftId === g.id);
            const isEditing = editing === g.id;
            return (
              <div className="admin-gift" key={g.id}>
                {isEditing ? (
                  <form className="gift-form" onSubmit={(e) => { e.preventDefault(); saveGift(g.id); }}>
                    <div className="field">
                      <label>Nombre</label>
                      <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required maxLength={120} />
                    </div>
                    <div className="field">
                      <label>Descripción</label>
                      <input className="input" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} maxLength={400} />
                    </div>
                    <div className="field">
                      <label>Link</label>
                      <input className="input" value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} maxLength={500} />
                    </div>
                    <div className="field">
                      <label>Cantidad</label>
                      <input type="number" min={0} max={9999} className="input" value={draft.quantity} onChange={(e) => setDraft({ ...draft, quantity: e.target.value })} required />
                    </div>
                    <div className="actions" style={{ gridColumn: "1 / -1" }}>
                      <button className="btn btn-primary btn-sm" disabled={busy}>Guardar</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancelar</button>
                    </div>
                  </form>
                ) : (
                  <div className="admin-gift-head">
                    <div>
                      <h3>
                        {g.name}{" "}
                        <span className={`pill ${g.remaining === 0 ? "pill-ok" : "pill-wait"}`}>
                          {g.remaining === 0 ? "Completo" : `Faltan ${g.remaining}`}
                        </span>
                      </h3>
                      <div className="meta">
                        {g.pledged} de {g.quantity} prometidos
                        {g.pledged > g.quantity && " (prometieron más de lo que pedían ahora)"}
                        {g.description && ` · ${g.description}`}
                        {g.link && <> · <a href={g.link} target="_blank" rel="noopener noreferrer">link</a></>}
                      </div>
                    </div>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(g)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => removeGift(g)} disabled={busy}>Eliminar</button>
                    </div>
                  </div>
                )}

                {list.length === 0 ? (
                  <p className="no-pledges">Nadie lo eligió todavía.</p>
                ) : (
                  <div className="pledges">
                    {list.map((p) => (
                      <div className="pledge" key={p.id}>
                        <div>
                          <div className="who">{p.giverName}</div>
                          {p.coGivers.length > 0 && <div className="co">junto con {p.coGivers.join(", ")}</div>}
                          {p.message && <div className="msg">“{p.message}”</div>}
                          <div className="co">{fmtDate(p.createdAt)}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="qty">× {p.quantity}</div>
                          <button className="link-btn" style={{ color: "var(--hibiscus)", fontSize: 13 }} onClick={() => removePledge(p)} disabled={busy}>Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
