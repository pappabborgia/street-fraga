import type { Metadata, Viewport } from "next";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource/bungee/400.css";
import "./globals.css";

export const metadata: Metadata = {
  // indirizzo completo del sito: serve a WhatsApp e ai social per trovare l'immagine di anteprima
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITO ?? "https://street-fraga.vercel.app"),
  title: "Street Fraga",
  description: "Il picchiaduro a colpi di risposte, ambientato a Fragagnano.",
  openGraph: {
    title: "Street Fraga",
    description: "Il picchiaduro a colpi di risposte, ambientato a Fragagnano.",
    url: "/",
    siteName: "Street Fraga",
    locale: "it_IT",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Street Fraga", description: "Il picchiaduro a colpi di risposte, ambientato a Fragagnano." },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1b0f2e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
