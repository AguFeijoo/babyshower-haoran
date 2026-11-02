import Link from "next/link";
import { getStore } from "@/lib/db";
import { BABY_NAME, EVENT_DATE, EVENT_PLACE, EVENT_TIME } from "@/lib/config";
import { Hibiscus, Leaf, Stars, Wave } from "./components/Decorations";
import GiftList from "./components/GiftList";
import { publicGift } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const gifts = await getStore().listGifts();

  return (
    <main>
      <header className="hero">
        <Stars />
        <Leaf className="leaf-l" size={170} style={{ left: -40, top: -20, transform: "rotate(-10deg)" }} />
        <Leaf className="leaf-r" size={130} color="#3fb58a" style={{ right: -30, top: 30, transform: "scaleX(-1) rotate(-20deg)" }} />
        <Hibiscus className="hib-1" size={92} style={{ left: "6%", bottom: 120 }} />
        <Hibiscus className="hib-2" size={64} color="#e8505b" style={{ right: "9%", bottom: 150 }} />
        <Hibiscus className="hib-3" size={44} color="#fde4ef" style={{ right: "22%", top: 40 }} />

        <div className="container" style={{ position: "relative" }}>
          <span className="hero-kicker">Baby Shower · Aloha, bebé</span>
          <h1>
            Santino
            <span className="pink">
              <span className="hanzi" lang="zh">浩然</span> HaoRan
            </span>
          </h1>
          <p className="lead">
            ¡Ya casi llega! Armamos esta lista para que sepas qué nos hace falta.
            Elegí un regalo, contanos cuántos y listo.
          </p>
          {(EVENT_DATE || EVENT_TIME || EVENT_PLACE) && (
            <div className="event-chips">
              {EVENT_DATE && <span>🗓️ {EVENT_DATE}</span>}
              {EVENT_TIME && <span>🕐 {EVENT_TIME}</span>}
              {EVENT_PLACE && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT_PLACE)}`} target="_blank" rel="noopener noreferrer">
                  📍 {EVENT_PLACE}
                </a>
              )}
            </div>
          )}
        </div>
        <Wave />
      </header>

      <div className="container">
        <section className="how" aria-label="Cómo funciona">
          <div className="how-step">
            <span className="num">1</span>
            <div><b>Mirá la lista</b><small>Cada regalo muestra cuántos faltan.</small></div>
          </div>
          <div className="how-step">
            <span className="num">2</span>
            <div><b>Tocá “Lo regalo”</b><small>Poné tu nombre y la cantidad.</small></div>
          </div>
          <div className="how-step">
            <span className="num">3</span>
            <div><b>¿Regalan en grupo?</b><small>Sumá los nombres de quienes regalan con vos.</small></div>
          </div>
        </section>

        <GiftList initialGifts={gifts.map(publicGift)} />
      </div>

      <footer className="footer">
        <Wave fill="#23407f" className="wave-top" />
        <p style={{ margin: 0 }}>Hecho con mucho amor para {BABY_NAME} 🌺</p>
        <p style={{ margin: "8px 0 0", fontSize: 14 }}>
          <Link href="/admin">Solo para puchis</Link>
        </p>
      </footer>
    </main>
  );
}
