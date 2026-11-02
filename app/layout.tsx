import type { Metadata, Viewport } from "next";
import { BABY_NAME } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: `Baby Shower de ${BABY_NAME}`,
  description: `Lista de regalos para el baby shower de ${BABY_NAME}. Elegí qué regalar y avisanos.`,
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#3e74c9" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@400;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
