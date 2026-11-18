import type { Metadata } from "next";

// Pagina riservata: non deve comparire nei motori di ricerca
export const metadata: Metadata = {
  title: "Gestione · Street Fraga",
  robots: { index: false, follow: false, nocache: true },
};

export default function LayoutGestione({ children }: { children: React.ReactNode }) {
  return children;
}
