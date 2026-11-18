/**
 * Sfondi delle sfide: luoghi di Fragagnano, immagini fornite dal gestore (crediti in docs/crediti.md),
 * ridotte a 320 px di larghezza e 64 colori per l'aspetto a pixel grossi delle sale giochi anni '90.
 * Così pesano circa 25 KB l'una; il browser le ingrandisce senza sfumare (image-rendering: pixelated).
 * I lottatori stanno sul terreno in basso: "fuoco" dice quale parte dell'immagine tenere quando si taglia.
 */
export type Luogo = "chiesa" | "scuola" | "cappella" | "municipio" | "piazza";

export const NOMI_LUOGHI: Record<Luogo, string> = {
  chiesa: "Davanti alla chiesa",
  scuola: "Nel cortile della scuola",
  cappella: "Alla cappella in campagna",
  municipio: "Davanti al Municipio",
  piazza: "In piazza, vicino al monumento",
};

const FUOCO: Record<Luogo, string> = {
  chiesa: "50% 70%",
  scuola: "35% 75%",
  cappella: "62% 75%",
  municipio: "52% 72%",
  piazza: "50% 75%",
};

export function Sfondo({ luogo }: { luogo: Luogo }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/sfondi/${luogo}-pixel.png`}
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable={false}
      className="absolute inset-0 w-full h-full object-cover select-none"
      style={{ objectPosition: FUOCO[luogo], imageRendering: "pixelated" }}
    />
  );
}
