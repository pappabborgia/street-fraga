/**
 * Sfondi delle sfide: luoghi di Fragagnano disegnati in stile videogioco, immagini fornite dal gestore
 * (crediti in docs/crediti.md). Ogni immagine ha due misure leggere: 720 px per il telefono e
 * 1280 px per tablet e computer; il browser scarica solo quella che serve, e solo per il luogo della sfida.
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
      src={`/sfondi/${luogo}-720.webp`}
      srcSet={`/sfondi/${luogo}-720.webp 720w, /sfondi/${luogo}-1280.webp 1280w`}
      sizes="(min-width: 768px) 70vw, 100vw"
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable={false}
      className="absolute inset-0 w-full h-full object-cover select-none"
      style={{ objectPosition: FUOCO[luogo], imageRendering: "auto" }}
    />
  );
}
