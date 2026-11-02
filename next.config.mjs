/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite abrir `npm run dev` desde el celular usando la IP de la compu en la red local
  // (ej: http://192.168.1.20:3000). Sin esto, Next.js bloquea sus scripts en desarrollo
  // y los botones no responden. No afecta a la versión publicada en Vercel.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
};
export default nextConfig;
