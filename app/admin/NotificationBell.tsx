"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoney, type Gift, type Pledge } from "@/lib/types";

const MAX_ITEMS = 40;

function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - Date.parse(iso)) / 1000;
  if (diff < 60) return "recién";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  const days = Math.floor(diff / 86400);
  if (days < 7) return days === 1 ? "ayer" : `hace ${days} días`;
  return new Date(iso).toLocaleDateString("es-UY", { day: "numeric", month: "short", timeZone: "America/Montevideo" });
}

export default function NotificationBell({
  pledges,
  gifts,
  seenAt: initialSeenAt,
  onGoTo,
}: {
  pledges: Pledge[];
  gifts: Gift[];
  seenAt: string | null;
  onGoTo: (giftId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState(initialSeenAt);
  // Lo que se resalta como "nuevo" mientras el panel está abierto (antes de marcarlo como leído).
  const [highlightAfter, setHighlightAfter] = useState<string | null>(initialSeenAt);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => setSeenAt((s) => (s && initialSeenAt && s > initialSeenAt ? s : initialSeenAt)), [initialSeenAt]);

  const isNew = (p: Pledge, after: string | null) => !after || Date.parse(p.createdAt) > Date.parse(after);
  const unread = pledges.filter((p) => isNew(p, seenAt)).length;
  const giftById = new Map(gifts.map((g) => [g.id, g]));

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function toggle() {
    if (open) return setOpen(false);
    setHighlightAfter(seenAt);
    setOpen(true);
    const newest = pledges[0]?.createdAt;
    if (newest && unread > 0) {
      setSeenAt(newest);
      try {
        await fetch("/api/admin/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ until: newest }),
        });
      } catch {}
    }
  }

  const items = pledges.slice(0, MAX_ITEMS);

  return (
    <div className="bell-wrap" ref={wrapRef}>
      <button
        className="bell"
        onClick={toggle}
        aria-label={unread ? `Notificaciones: ${unread} nuevas` : "Notificaciones"}
        aria-expanded={open}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 9a6 6 0 1 1 12 0c0 4.5 1.5 6.5 2.5 7.5h-17C4.5 15.5 6 13.5 6 9Z" fill="currentColor" />
          <path d="M9.5 19a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {unread > 0 && <span className="bell-dot">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div className="notif-panel" role="dialog" aria-label="Notificaciones">
          <div className="notif-head">
            <b>Notificaciones</b>
            <button className="close" onClick={() => setOpen(false)} aria-label="Cerrar">×</button>
          </div>
          {items.length === 0 ? (
            <p className="notif-empty">Todavía nadie eligió un regalo. Cuando alguien lo haga, aparece acá 💙</p>
          ) : (
            <ul className="notif-list">
              {items.map((p) => {
                const g = giftById.get(p.giftId);
                const fresh = isNew(p, highlightAfter);
                return (
                  <li key={p.id}>
                    <button
                      className={`notif-item ${fresh ? "fresh" : ""}`}
                      onClick={() => {
                        setOpen(false);
                        onGoTo(p.giftId);
                      }}
                    >
                      {fresh && <span className="notif-new" aria-label="Nuevo" />}
                      <span className="notif-text">
                        <b>{p.giverName}</b>
                        {g?.mode === "money" ? (
                          <> aportó <b>{formatMoney(p.quantity)}</b> en {g.name}</>
                        ) : (
                          <> regaló <b>{p.quantity} × {g?.name ?? "un regalo"}</b></>
                        )}
                        {p.coGivers.length > 0 && <span className="notif-co"> junto con {p.coGivers.join(", ")}</span>}
                        {p.message && <span className="notif-msg">“{p.message}”</span>}
                        <span className="notif-time">{timeAgo(p.createdAt)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
