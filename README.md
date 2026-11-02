# Baby Shower de HaoRan Santino 🌺

Web de lista de regalos hecha con **Next.js + React** (interfaz y API en el mismo proyecto), base de datos **Neon** y deploy en **Vercel**. El prompt original está en `PROMPT.md`.

- `/` → lista pública: cualquiera elige un regalo, pone su nombre, la cantidad y, si regala en grupo, los nombres de los demás.
- `/admin` → panel de los papás: ver quién regala qué, editar, agregar o eliminar regalos y respuestas.

## Login de los papás

| Usuario | Contraseña |
|---|---|
| `papas` | `haoran2026` |

Están hardcodeados en `lib/config.ts`. En Vercel conviene cambiarlos con las variables `ADMIN_USERNAME` y `ADMIN_PASSWORD`.

## Probar en tu compu

```bash
npm install
npm run dev
```

Abrí http://localhost:3000. Sin `DATABASE_URL` funciona en **modo prueba** (los datos se guardan en memoria y se borran al reiniciar). Para usar Neon en local, copiá `.env.example` a `.env.local` y pegá la cadena de conexión.

## Deploy en Vercel + Neon

1. Subí esta carpeta a un repo de GitHub.
2. En Vercel: **Add New → Project**, importá el repo (detecta Next.js solo).
3. En el proyecto de Vercel: **Storage → Create Database → Neon** (o creala en neon.tech y copiá la cadena). Eso agrega `DATABASE_URL` automáticamente.
4. En **Settings → Environment Variables** agregá:
   - `ADMIN_USERNAME` y `ADMIN_PASSWORD` (opcional, para cambiar el login)
   - `SESSION_SECRET` = cualquier texto largo y aleatorio
5. Redeploy. Las tablas se crean solas la primera vez, con una lista de regalos de ejemplo que pueden editar o borrar desde `/admin`.

## Personalizar

- Fecha y lugar del evento: `EVENT_DATE` y `EVENT_PLACE` en `lib/config.ts` (si están vacíos no se muestran).
- Colores: variables al principio de `app/globals.css`.
- Regalos de ejemplo iniciales: `SEED_GIFTS` en `lib/db.ts`.
