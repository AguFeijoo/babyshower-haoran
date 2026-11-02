# Prompt — Web del Baby Shower de HaoRan Santino

Construí una web para el baby shower de **HaoRan Santino** con estas condiciones:

## Stack
- **Next.js (App Router) + React + TypeScript** en un solo proyecto: la interfaz y la API (Route Handlers) viven juntas, sin backend y frontend separados.
- **Base de datos: Neon (Postgres serverless)** con `@neondatabase/serverless`, conectada por la variable `DATABASE_URL`.
- **Deploy en Vercel** sin configuración extra: las tablas se crean solas la primera vez que la app se conecta.
- Si no hay `DATABASE_URL` (desarrollo local), usar un almacenamiento en memoria para poder probar sin base.

## Ambientación
- Inspirada en la paleta de colores de Stitch: azul Stitch, azul marino, celeste, rosa Angel, más acentos tropicales/hawaianos (hibiscos, hojas de palmera, olas, arena).
- Decoración original (flores, hojas, olas, estrellitas). No dibujar al personaje ni usar imágenes con copyright.
- Tipografía redondeada y amigable, tono cálido, todo en español rioplatense.
- Responsive: tiene que verse bien en el celular (la mayoría va a entrar desde WhatsApp).

## Página pública (sin login)
- Cualquiera entra y ve la lista de regalos que necesitan los papás: nombre, descripción, link opcional de referencia, cantidad que se necesita y cuántos faltan.
- Cada regalo tiene un botón **"Lo regalo"** que abre un formulario:
  - Nombre de quien regala (obligatorio).
  - Cantidad (de 1 hasta lo que falta).
  - Opción **"Lo regalo junto con otras personas"**, que permite agregar los nombres de cada persona con la que regala.
  - Mensaje opcional para los papás.
- Al confirmar se descuenta del faltante. El servidor valida que no se pase de lo que falta.
- Los regalos completos se muestran como "¡Completo!" y no aceptan más.
- El público no ve quién regaló qué (privacidad); solo ve lo que falta.

## Login de los papás
- Un único usuario hardcodeado (sobrescribible con variables de entorno `ADMIN_USERNAME` / `ADMIN_PASSWORD`).
- Sesión con cookie firmada (HMAC) httpOnly.

## Panel de los papás (`/admin`)
- Resumen: cantidad de regalos, unidades pedidas, unidades comprometidas, personas que participaron.
- Por cada regalo: ver quién dijo que lo regala, la cantidad, con quién lo regala y su mensaje.
- Editar nombre, descripción, link y cantidad de cada regalo.
- Agregar regalos nuevos y eliminar regalos.
- Eliminar una respuesta (por si alguien se equivocó).

## Modelo de datos
- `gifts`: id, name, description, link, quantity, sort_order, created_at.
- `pledges`: id, gift_id → gifts (on delete cascade), giver_name, quantity, co_givers (text[]), message, created_at.
