// Datos del evento que se muestran en la portada (si alguno queda vacío, no se muestra).
export const BABY_NAME = "HaoRan Santino";
export const EVENT_DATE = "Domingo 15 de noviembre";
export const EVENT_TIME = "13 a 16 h";
export const EVENT_PLACE = "Palmar 2170, Montevideo";

// Usuario único de los papás. Se puede sobrescribir con ADMIN_USERNAME / ADMIN_PASSWORD en Vercel.
const HARDCODED_USER = "papas";
const HARDCODED_PASSWORD = "haoran2026";

export function adminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || HARDCODED_USER,
    password: process.env.ADMIN_PASSWORD || HARDCODED_PASSWORD,
  };
}

export function sessionSecret() {
  return (
    process.env.SESSION_SECRET ||
    `babyshower-${adminCredentials().username}-${adminCredentials().password}`
  );
}
