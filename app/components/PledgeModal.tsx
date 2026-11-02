"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoney, type Gift } from "@/lib/types";
import { BABY_NAME } from "@/lib/config";
import { Hibiscus } from "./Decorations";

const NAME_KEY = "bs_giver_name";

export default function PledgeModal({
  gift,
  onClose,
  onGiftUpdate,
}: {
  gift: Gift;
  onClose: () => void;
  onGiftUpdate: (g: Gift) => void;
}) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [group, setGroup] = useState(false);
  const [coGivers, setCoGivers] = useState<string[]>([""]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  // Si el regalo tiene link, primero mostramos la sugerencia antes del formulario.
  const [showHint, setShowHint] = useState(Boolean(gift.link));
  const [viewedLink, setViewedLink] = useState(false);

  const [amount, setAmount] = useState("");
  const isMoney = gift.mode === "money";
  const max = gift.mode === "fixed" ? Math.max(1, gift.remaining) : 999;
  const amountNum = Math.round(Number(amount.replace(/[^\d]/g, "")));

  // El nombre guardado se carga una sola vez al abrir (no pisa lo que la persona escribe).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NAME_KEY);
      if (saved) setName((current) => current || saved);
    } catch {}
  }, []);

  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (qty > max) setQty(max);
  }, [max, qty]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const others = group ? coGivers.map((c) => c.trim()).filter(Boolean) : [];
    if (!name.trim()) return setError("Contanos tu nombre.");
    if (isMoney && !(amountNum > 0)) return setError("Escribí el monto que te gustaría regalar.");
    if (group && others.length === 0) return setError("Agregá al menos una persona con la que regalás.");

    setSending(true);
    try {
      const res = await fetch("/api/pledges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId: gift.id, giverName: name, quantity: isMoney ? amountNum : qty, coGivers: others, message }),
      });
      const data = await res.json();
      if (data.gift) onGiftUpdate(data.gift);
      if (!res.ok) {
        setError(data.error || "No se pudo guardar. Probá de nuevo.");
        return;
      }
      try { localStorage.setItem(NAME_KEY, name.trim()); } catch {}
      setDone(true);
    } catch {
      setError("Hubo un problema de conexión. Probá de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="pledge-title" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Cerrar">×</button>

        {done ? (
          <div className="thanks">
            <Hibiscus size={84} style={{ position: "static" }} />
            <h3 id="pledge-title">¡Mahalo, {name.trim().split(" ")[0]}!</h3>
            <p className="sub">
              {isMoney ? <>Anotamos tu aporte de {formatMoney(amountNum)}</> : <>Anotamos {qty} × {gift.name}</>}
              {group && coGivers.some((c) => c.trim()) ? " para el regalo en grupo" : ""}.
              {" "}{BABY_NAME} ya te lo agradece 💙
            </p>
            <button className="btn btn-pink" onClick={onClose}>Volver a la lista</button>
          </div>
        ) : gift.mode === "fixed" && gift.remaining === 0 ? (
          <div className="thanks">
            <span className="hint-icon" aria-hidden>🎉</span>
            <h3 id="pledge-title">¡Este regalo ya se completó!</h3>
            <p className="sub">Alguien se te adelantó con {gift.name}. Fijate en la lista: hay otros que todavía faltan 💙</p>
            <button className="btn btn-primary" onClick={onClose}>Ver otros regalos</button>
          </div>
        ) : showHint ? (
          <div className="hint">
            <span className="hint-icon" aria-hidden>💡</span>
            <h3 id="pledge-title">{gift.name}</h3>
            <p className="hint-title">¡Tenemos una sugerencia!</p>
            <p className="sub">
              Para este regalo elegimos uno que nos encantó. Miralo antes de comprar: podés regalar ese mismo o uno parecido.
            </p>
            <div className="hint-actions">
              <a
                className={`btn ${viewedLink ? "btn-ghost" : "btn-pink"}`}
                href={gift.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setViewedLink(true)}
              >
                Ver la sugerencia ↗
              </a>
              <button type="button" className={`btn ${viewedLink ? "btn-primary" : "btn-ghost"}`} onClick={() => setShowHint(false)}>
                {viewedLink ? "Listo, quiero regalarlo" : "Continuar sin verla"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h3 id="pledge-title">{gift.name}</h3>
            <p className="sub">
              {isMoney
                ? "Elegí el monto que quieras, cualquier aporte suma. Solo lo ven los papás 💙"
                : gift.mode === "unlimited"
                  ? "¿Cuántos regalás?"
                  : `Faltan ${gift.remaining} de ${gift.quantity}. ¿Cuántos regalás?`}
            </p>
            {isMoney && gift.description && <p className="money-desc">{gift.description}</p>}
            {gift.link && (
              <a className="hint-inline" href={gift.link} target="_blank" rel="noopener noreferrer">
                💡 Ver la sugerencia de los papás ↗
              </a>
            )}

            {error && <div className="error">{error}</div>}

            <div className="field">
              <label htmlFor="giver">Tu nombre</label>
              <input id="giver" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Tía Laura" maxLength={80} autoComplete="name" />
            </div>

            {isMoney ? (
              <div className="field">
                <label htmlFor="amount">Monto (en pesos)</label>
                <div className="money-input">
                  <span>$</span>
                  <input
                    id="amount"
                    className="input"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 8);
                      setAmount(digits ? Number(digits).toLocaleString("es-UY") : "");
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="field">
                <span className="label">Cantidad</span>
                <div className="stepper">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Menos">−</button>
                  <output aria-live="polite">{qty}</output>
                  <button type="button" onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max} aria-label="Más">+</button>
                  {gift.mode === "fixed" && <small>máx. {max}</small>}
                </div>
              </div>
            )}

            <label className="toggle">
              <input type="checkbox" checked={group} onChange={(e) => setGroup(e.target.checked)} />
              <span>{isMoney ? "Lo regalamos entre varios" : "Lo regalo junto con otras personas"} <em>(opcional)</em></span>
            </label>

            {group && (
              <div className="field">
                <span className="label">¿Con quiénes?</span>
                <div className="co-list">
                  {coGivers.map((c, i) => (
                    <div className="co-row" key={i}>
                      <input
                        className="input"
                        value={c}
                        placeholder={`Persona ${i + 1}`}
                        maxLength={80}
                        onChange={(e) => setCoGivers((list) => list.map((x, j) => (j === i ? e.target.value : x)))}
                      />
                      {coGivers.length > 1 && (
                        <button type="button" className="icon-btn" aria-label="Quitar" onClick={() => setCoGivers((list) => list.filter((_, j) => j !== i))}>×</button>
                      )}
                    </div>
                  ))}
                </div>
                {coGivers.length < 20 && (
                  <button type="button" className="link-btn" onClick={() => setCoGivers((list) => [...list, ""])}>+ Agregar otra persona</button>
                )}
              </div>
            )}

            <div className="field">
              <label htmlFor="msg">Mensaje para los papás <span style={{ fontWeight: 400, color: "var(--muted)" }}>(opcional)</span></label>
              <textarea id="msg" className="input" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} placeholder="Unas palabras lindas…" />
            </div>

            <button className="btn btn-primary" style={{ width: "100%" }} disabled={sending}>
              {sending
                ? "Guardando…"
                : isMoney
                  ? `Confirmar aporte${amountNum > 0 ? ` de ${formatMoney(amountNum)}` : ""}`
                  : `Confirmar ${qty} ${qty === 1 ? "regalo" : "regalos"}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
