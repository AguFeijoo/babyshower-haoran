"use client";

import { useState } from "react";
import { isOpen, type Gift } from "@/lib/types";
import { GiftIcon } from "./Decorations";
import PledgeModal from "./PledgeModal";
import { groupByCategory } from "@/lib/group";

const ICON_COLORS = [
  ["#3e74c9", "#f28db8"],
  ["#f28db8", "#3e74c9"],
  ["#2f9e78", "#ffc857"],
  ["#23407f", "#a9d6f2"],
  ["#e8505b", "#ffc857"],
];

type Filter = "pending" | "all";


export default function GiftList({ initialGifts }: { initialGifts: Gift[] }) {
  const [gifts, setGifts] = useState(initialGifts);
  const [selected, setSelected] = useState<Gift | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const shown = filter === "pending" ? gifts.filter(isOpen) : gifts;
  const pendingCount = gifts.filter((g) => g.mode === "fixed" && g.remaining > 0).length;
  const groups = groupByCategory(shown);

  function updateGift(updated: Gift) {
    setGifts((list) => list.map((g) => (g.id === updated.id ? updated : g)));
    setSelected((s) => (s && s.id === updated.id ? updated : s));
  }

  return (
    <>
      <div className="section-title">
        <div>
          <h2>Lista de regalos</h2>
          <p>
            {pendingCount === 0 && gifts.length > 0
              ? "¡Está todo cubierto! Gracias a todos 💙"
              : `${pendingCount} ${pendingCount === 1 ? "regalo todavía necesita" : "regalos todavía necesitan"} padrinos.`}
          </p>
        </div>
        <div className="filters" role="tablist">
          <button className={`chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Todos</button>
          <button className={`chip ${filter === "pending" ? "active" : ""}`} onClick={() => setFilter("pending")}>Faltan</button>
        </div>
      </div>

      {groups.length > 1 && (
        <nav className="cat-nav" aria-label="Categorías">
          {groups.map((g, i) => (
            <a key={g.name} href={`#cat-${i}`} className="cat-chip">
              {g.name}
              <span>{g.items.filter(isOpen).length}</span>
            </a>
          ))}
        </nav>
      )}

      {shown.length === 0 ? (
        <div className="empty">
          {gifts.length === 0 ? "Los papás todavía están armando la lista. ¡Volvé pronto!" : "No queda nada pendiente 🎉"}
        </div>
      ) : (
        groups.map((group, gi) => (
          <section key={group.name} id={`cat-${gi}`} className="cat-section">
            {groups.length > 1 && <h3 className="cat-title">{group.name}</h3>}
            <div className="grid">
              {group.items.map((g) => {
                const done = !isOpen(g);
                const open = g.mode !== "fixed";
                const pct = g.quantity > 0 ? Math.min(100, (g.pledged / g.quantity) * 100) : 100;
                const [c1, c2] = ICON_COLORS[g.id % ICON_COLORS.length];
                return (
                  <article key={g.id} className={`gift ${done ? "done" : ""} ${g.mode === "money" ? "money" : ""}`}>
                    <div className="gift-head">
                      <span className="gift-icon"><GiftIcon color={c1} ribbon={c2} /></span>
                      <div>
                        <h3>{g.name}</h3>
                        {g.description && <p className="desc">{g.description}</p>}
                      </div>
                    </div>
                    {g.link && (
                      <a className="ref" href={g.link} target="_blank" rel="noopener noreferrer">
                        💡 Ver sugerencia ↗
                      </a>
                    )}
                    <div className="gift-foot">
                    {open ? (
                      <div className="counts open-counts">
                        <span className="pill-open">{g.mode === "money" ? "💝 Monto libre" : "∞ Sin límite"}</span>
                        <span>
                          {g.pledgeCount === 0
                            ? "¡Sé el primero!"
                            : `${g.pledgeCount} ${g.pledgeCount === 1 ? "persona ya se sumó" : "personas ya se sumaron"}`}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="progress" aria-hidden><i style={{ width: `${pct}%` }} /></div>
                        <div className="counts">
                          <span>{done ? "Completo" : <>Faltan <b>{g.remaining}</b></>}</span>
                          <span>{g.pledged} de {g.quantity}</span>
                        </div>
                      </>
                    )}
                    {done ? (
                      <span className="badge-done">¡Completo! Gracias 💚</span>
                    ) : (
                      <button className="btn btn-primary" onClick={() => setSelected(g)}>
                        {g.mode === "money" ? "Quiero sumarme 💝" : "Lo regalo 🌺"}
                      </button>
                    )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}

      {selected && (
        <PledgeModal gift={selected} onClose={() => setSelected(null)} onGiftUpdate={updateGift} />
      )}
    </>
  );
}
