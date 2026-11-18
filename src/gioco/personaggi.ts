export type Effetto = "pioggia" | "lancio" | "onda" | "cade" | "fuoco" | "vortice";
export type Oggetto =
  | "tarallo" | "oliva" | "moneta" | "cioccolato" | "uva" | "nota"
  | "campana" | "aquila" | "sedia" | "motorino" | "mattarello" | "ciabatta"
  | "pomodoro" | "uovo" | "peperoncino" | "fico" | "pagnotta" | "bottiglia" | "cucu";

/** Come si muove il lottatore in una mossa normale. */
export type Stile = "salto" | "capriola" | "carica" | "lancio";

export interface Mossa {
  nome: string;
  stile: Stile;
  oggetto?: Oggetto; // solo per "lancio"
}

export interface Aspetto {
  pelle: string;
  capelli: string;
  capigliatura: "crocchia" | "ricci" | "corti" | "pochi" | "lunghi";
  cappello: "fazzoletto" | "coppola" | "panama" | "paglia" | "banda" | "basco" | "plis" | "nessuno";
  baffi: "nessuno" | "sottili" | "folti" | "bianchi";
  barba: boolean;
  occhiali: "nessuno" | "vista" | "sole";
  corpo: "normale" | "pancia" | "gonna" | "tonaca" | "magro";
  maglia: string;
  maglia2: string;
  pantaloni: string;
  scarpe: string;
  dettaglio:
    | "grembiule" | "catena" | "gilet" | "papillon" | "toppe" | "croce"
    | "macchie" | "alamari" | "collarino" | "aquila";
  oggetto: "mattarello" | "zappa" | "nessuno" | "bastone" | "sedia" | "orologio" | "cesto" | "mazza" | "libro";
}

export interface Speciale { nome: string; effetto: Effetto; oggetto: Oggetto }

export interface Personaggio {
  id: string;
  nome: string;
  figura: string;
  descrizione: string;
  mosse: [Mossa, Mossa];
  /** 5 colpi speciali, usati a rotazione. */
  speciali: [Speciale, Speciale, Speciale, Speciale, Speciale];
  suono: [string, string]; // scritte da fumetto per i colpi
  aspetto: Aspetto;
}

/**
 * Personaggi di fantasia, caricature affettuose di figure di paese. Nessuna persona reale.
 * Nomi e colpi in salentino del nord (la variante di Fragagnano): parole come corpu, càuci, focu,
 * cielu, utte, mieru vengono dalla voce "Dialetti salentini"; le altre sono adattate con le regole
 * della variante (maschile in -u, LL > DD, "te" = di, "ca" = che). Da confermare in paese.
 */
export const PERSONAGGI: Personaggio[] = [
  {
    id: "nonna", nome: "Nonna Ninetta", figura: "La vecchietta",
    descrizione: "Ha cresciuto 4 figli e 9 nipoti. Il mattarello non lo molla mai.",
    mosse: [{ nome: "Corpu te mattareddu", stile: "lancio", oggetto: "mattarello" }, { nome: "La ciabatta ca vola", stile: "lancio", oggetto: "ciabatta" }],
    speciali: [
      { nome: "Taraddi te lu cielu", effetto: "pioggia", oggetto: "tarallo" },
      { nome: "Lu mattareddu ca gira", effetto: "lancio", oggetto: "mattarello" },
      { nome: "Ciabatta te focu", effetto: "lancio", oggetto: "ciabatta" },
      { nome: "Pummitori te lu cielu", effetto: "pioggia", oggetto: "pomodoro" },
      { nome: "Ova a giru", effetto: "vortice", oggetto: "uovo" },
    ],
    suono: ["SBAM!", "PAFF!"],
    aspetto: {
      pelle: "#f2c9a0", capelli: "#d9d9d9", capigliatura: "crocchia", cappello: "fazzoletto",
      baffi: "nessuno", barba: false, occhiali: "vista", corpo: "gonna",
      maglia: "#2c3e7a", maglia2: "#c0392b", pantaloni: "#2c3e7a", scarpe: "#3b2a1a",
      dettaglio: "grembiule", oggetto: "mattarello",
    },
  },
  {
    id: "contadino", nome: "Zziu Cosimu", figura: "Il contadino",
    descrizione: "In campagna dall'alba. Conosce ogni ulivo per nome.",
    mosse: [{ nome: "Corpu te zappa", stile: "salto" }, { nome: "Spallata te trattore", stile: "carica" }],
    speciali: [
      { nome: "Olive te lu cielu", effetto: "pioggia", oggetto: "oliva" },
      { nome: "La zappata ca trema", effetto: "onda", oggetto: "oliva" },
      { nome: "Focu te peperoncinu", effetto: "fuoco", oggetto: "peperoncino" },
      { nome: "Lu pane ca vola", effetto: "lancio", oggetto: "pagnotta" },
      { nome: "Fiche a giru", effetto: "vortice", oggetto: "fico" },
    ],
    suono: ["TUNF!", "STRACK!"],
    aspetto: {
      pelle: "#d9a066", capelli: "#9a9a9a", capigliatura: "corti", cappello: "coppola",
      baffi: "bianchi", barba: false, occhiali: "nessuno", corpo: "normale",
      maglia: "#6b8fb3", maglia2: "#6b4a2b", pantaloni: "#5a4632", scarpe: "#2b1d12",
      dettaglio: "gilet", oggetto: "zappa",
    },
  },
  {
    id: "tamarro", nome: "'Ntoni Tuta", figura: "Il tamarro",
    descrizione: "Tuta lucida, catenone d'oro e occhiali da sole anche di sera.",
    mosse: [{ nome: "Lu catinone ca gira", stile: "capriola" }, { nome: "Sgommata a la piazza", stile: "carica" }],
    speciali: [
      { nome: "Lu motorinu truccatu", effetto: "lancio", oggetto: "motorino" },
      { nome: "Sgommata te focu", effetto: "fuoco", oggetto: "peperoncino" },
      { nome: "Musica a tuttu volume", effetto: "onda", oggetto: "nota" },
      { nome: "Lu catinone a giru", effetto: "vortice", oggetto: "moneta" },
      { nome: "Peperoncini te lu cielu", effetto: "pioggia", oggetto: "peperoncino" },
    ],
    suono: ["VROOM!", "SDENG!"],
    aspetto: {
      pelle: "#e0b080", capelli: "#1a1a1a", capigliatura: "ricci", cappello: "nessuno",
      baffi: "sottili", barba: false, occhiali: "sole", corpo: "normale",
      maglia: "#9b1c31", maglia2: "#ffffff", pantaloni: "#9b1c31", scarpe: "#f5f5f5",
      dettaglio: "catena", oggetto: "nessuno",
    },
  },
  {
    id: "ricco", nome: "Lu Commendatore Nandu", figura: "Il ricco",
    descrizione: "Abito bianco, bastone dorato. Offre sempre lui il caffè.",
    mosse: [{ nome: "Corpu te bastone d'oru", stile: "salto" }, { nome: "La moneta ca vola", stile: "lancio", oggetto: "moneta" }],
    speciali: [
      { nome: "Sordi te lu cielu", effetto: "pioggia", oggetto: "moneta" },
      { nome: "La buttiglia ca vola", effetto: "lancio", oggetto: "bottiglia" },
      { nome: "Oru a giru", effetto: "vortice", oggetto: "moneta" },
      { nome: "Lu brindisi ca scoppia", effetto: "onda", oggetto: "bottiglia" },
      { nome: "Lu campanellu te lu servu", effetto: "cade", oggetto: "campana" },
    ],
    suono: ["DLIN!", "BONK!"],
    aspetto: {
      pelle: "#f0c39a", capelli: "#cfcfcf", capigliatura: "pochi", cappello: "panama",
      baffi: "folti", barba: false, occhiali: "nessuno", corpo: "pancia",
      maglia: "#f4f1e6", maglia2: "#b8860b", pantaloni: "#f4f1e6", scarpe: "#7a4a1f",
      dettaglio: "papillon", oggetto: "bastone",
    },
  },
  {
    id: "arrangiato", nome: "Peppinu l'Arrangiatu", figura: "Il povero (ma furbo)",
    descrizione: "Non ha una lira, ma aggiusta tutto con uno spago.",
    mosse: [{ nome: "Càuci cu la scarpa bucata", stile: "salto" }, { nome: "Capriola cu la toppa", stile: "capriola" }],
    speciali: [
      { nome: "La seggia ca vola", effetto: "lancio", oggetto: "sedia" },
      { nome: "Ciabatte te lu cielu", effetto: "pioggia", oggetto: "ciabatta" },
      { nome: "Seggie a giru", effetto: "vortice", oggetto: "sedia" },
      { nome: "Focu te paglia", effetto: "fuoco", oggetto: "peperoncino" },
      { nome: "Pane te tre giurni", effetto: "lancio", oggetto: "pagnotta" },
    ],
    suono: ["CRAC!", "PUF!"],
    aspetto: {
      pelle: "#e3b388", capelli: "#5a3b22", capigliatura: "corti", cappello: "basco",
      baffi: "nessuno", barba: true, occhiali: "nessuno", corpo: "magro",
      maglia: "#e8e2d0", maglia2: "#7a5c3a", pantaloni: "#4f5b66", scarpe: "#3a2a1c",
      dettaglio: "toppe", oggetto: "sedia",
    },
  },
  {
    id: "svizzero", nome: "Francu lu Svizzeru", figura: "Tornato dalla Svizzera",
    descrizione: "Partito con la valigia di cartone, tornato col macchinone.",
    mosse: [{ nome: "Pugnu puntuale", stile: "carica" }, { nome: "La cioccolata ca vola", stile: "lancio", oggetto: "cioccolato" }],
    speciali: [
      { nome: "Cioccolata te lu cielu", effetto: "pioggia", oggetto: "cioccolato" },
      { nome: "Lu cucù ca zumpa", effetto: "lancio", oggetto: "cucu" },
      { nome: "Orologi a giru", effetto: "vortice", oggetto: "cucu" },
      { nome: "Fonduta te focu", effetto: "fuoco", oggetto: "cioccolato" },
      { nome: "Lu campanazzu te le Alpi", effetto: "cade", oggetto: "campana" },
    ],
    suono: ["CUCÙ!", "TIC-TAC!"],
    aspetto: {
      pelle: "#f2c49b", capelli: "#7a5a3a", capigliatura: "pochi", cappello: "nessuno",
      baffi: "folti", barba: false, occhiali: "sole", corpo: "pancia",
      maglia: "#c8102e", maglia2: "#ffffff", pantaloni: "#3d3d3d", scarpe: "#1a1a1a",
      dettaglio: "croce", oggetto: "orologio",
    },
  },
  {
    id: "vignaiolo", nome: "Mesciu Vitu", figura: "Il vignaiolo",
    descrizione: "Il suo Primitivo è il migliore. Lo dice lui.",
    mosse: [{ nome: "Pigiata ca vola", stile: "salto" }, { nome: "Lu grappulu ca vola", stile: "lancio", oggetto: "uva" }],
    speciali: [
      { nome: "Uva te lu cielu", effetto: "pioggia", oggetto: "uva" },
      { nome: "La utte te mieru", effetto: "lancio", oggetto: "bottiglia" },
      { nome: "Vendemmia a giru", effetto: "vortice", oggetto: "uva" },
      { nome: "Pigiata te focu", effetto: "fuoco", oggetto: "uva" },
      { nome: "Fiche te lu cielu", effetto: "pioggia", oggetto: "fico" },
    ],
    suono: ["SPLASH!", "ZAC!"],
    aspetto: {
      pelle: "#d39a68", capelli: "#3a2a1a", capigliatura: "corti", cappello: "paglia",
      baffi: "folti", barba: false, occhiali: "nessuno", corpo: "normale",
      maglia: "#f0e6c8", maglia2: "#6a1b4d", pantaloni: "#3f4a3a", scarpe: "#2b1d12",
      dettaglio: "macchie", oggetto: "cesto",
    },
  },
  {
    id: "banda", nome: "Mesciu Totò", figura: "Il suonatore della banda",
    descrizione: "Non perde una processione. Batte il tempo anche quando dorme.",
    mosse: [{ nome: "La nota ca vola", stile: "lancio", oggetto: "nota" }, { nome: "La marcia te la banda", stile: "carica" }],
    speciali: [
      { nome: "Lu tamburru ca tona", effetto: "onda", oggetto: "nota" },
      { nome: "Note te lu cielu", effetto: "pioggia", oggetto: "nota" },
      { nome: "Musica a giru", effetto: "vortice", oggetto: "nota" },
      { nome: "Marcia te focu", effetto: "fuoco", oggetto: "nota" },
      { nome: "La campanella te lu mesciu", effetto: "cade", oggetto: "campana" },
    ],
    suono: ["BUM!", "TATÀ!"],
    aspetto: {
      pelle: "#eab48a", capelli: "#2a2a2a", capigliatura: "corti", cappello: "banda",
      baffi: "sottili", barba: false, occhiali: "nessuno", corpo: "normale",
      maglia: "#1d2b5a", maglia2: "#e0b13a", pantaloni: "#1d2b5a", scarpe: "#111111",
      dettaglio: "alamari", oggetto: "mazza",
    },
  },
  {
    id: "parroco", nome: "Don Saveriu", figura: "Il parroco",
    descrizione: "Conosce tutti in paese. Le sue prediche sono leggendarie.",
    mosse: [{ nome: "La predica ca tona", stile: "carica" }, { nome: "Scivolata cu la tonaca", stile: "capriola" }],
    speciali: [
      { nome: "La campana te la chiesa", effetto: "cade", oggetto: "campana" },
      { nome: "Predica a tuttu volume", effetto: "onda", oggetto: "nota" },
      { nome: "Campanelle a giru", effetto: "vortice", oggetto: "campana" },
      { nome: "Lu pane te la tumenica", effetto: "lancio", oggetto: "pagnotta" },
      { nome: "Focu te lu caminu", effetto: "fuoco", oggetto: "pagnotta" },
    ],
    suono: ["DONG!", "SWISH!"],
    aspetto: {
      pelle: "#f0c8a0", capelli: "#8a8a8a", capigliatura: "pochi", cappello: "nessuno",
      baffi: "nessuno", barba: false, occhiali: "vista", corpo: "tonaca",
      maglia: "#1c1c24", maglia2: "#ffffff", pantaloni: "#1c1c24", scarpe: "#111111",
      dettaglio: "collarino", oggetto: "libro",
    },
  },
  {
    id: "albanese", nome: "Arben", figura: "L'albanese",
    descrizione: "Arrivato da ragazzo, ormai è più fragagnanese di tutti.",
    mosse: [{ nome: "Càuci ca vola", stile: "salto" }, { nome: "Abbracciu ca stringe", stile: "carica" }],
    speciali: [
      { nome: "Lu volu te l'aquila", effetto: "lancio", oggetto: "aquila" },
      { nome: "Peperoncini te lu cielu", effetto: "pioggia", oggetto: "peperoncino" },
      { nome: "L'aquila a giru", effetto: "vortice", oggetto: "aquila" },
      { nome: "Càuci te focu", effetto: "fuoco", oggetto: "peperoncino" },
      { nome: "Fiche te lu cielu", effetto: "pioggia", oggetto: "fico" },
    ],
    suono: ["WHAM!", "STROC!"],
    aspetto: {
      pelle: "#e6b48c", capelli: "#2b1b10", capigliatura: "ricci", cappello: "plis",
      baffi: "nessuno", barba: true, occhiali: "nessuno", corpo: "normale",
      maglia: "#b3121f", maglia2: "#111111", pantaloni: "#2e2e3a", scarpe: "#1a1a1a",
      dettaglio: "aquila", oggetto: "nessuno",
    },
  },
];

export const trovaPersonaggio = (id: string): Personaggio =>
  PERSONAGGI.find((p) => p.id === id) ?? PERSONAGGI[0];

/** Il colpo speciale di turno: cambiano a rotazione, uno ogni 3 risposte giuste di fila. */
export const specialeDi = (p: Personaggio, giuste: number): Speciale =>
  p.speciali[Math.floor(Math.max(0, giuste - 1) / 3) % p.speciali.length];
