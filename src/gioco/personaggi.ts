export type Effetto = "pioggia" | "lancio" | "onda" | "cade";
export type Oggetto =
  | "tarallo" | "oliva" | "moneta" | "cioccolato" | "uva" | "nota"
  | "campana" | "aquila" | "sedia" | "motorino" | "mattarello" | "ciabatta";

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

export interface Personaggio {
  id: string;
  nome: string;
  figura: string;
  descrizione: string;
  mosse: [Mossa, Mossa];
  speciale: { nome: string; effetto: Effetto; oggetto: Oggetto };
  suono: [string, string]; // scritte da fumetto per i colpi
  aspetto: Aspetto;
}

/** Personaggi di fantasia, caricature affettuose di figure di paese. Nessuna persona reale. */
export const PERSONAGGI: Personaggio[] = [
  {
    id: "nonna", nome: "Nonna Ninetta", figura: "La vecchietta",
    descrizione: "Ha cresciuto 4 figli e 9 nipoti. Il mattarello non lo molla mai.",
    mosse: [{ nome: "Mattarellata rotante", stile: "lancio", oggetto: "mattarello" }, { nome: "Ciabatta volante", stile: "lancio", oggetto: "ciabatta" }],
    speciale: { nome: "Pioggia di taralli", effetto: "pioggia", oggetto: "tarallo" },
    suono: ["SBAM!", "PAFF!"],
    aspetto: {
      pelle: "#f2c9a0", capelli: "#d9d9d9", capigliatura: "crocchia", cappello: "fazzoletto",
      baffi: "nessuno", barba: false, occhiali: "vista", corpo: "gonna",
      maglia: "#2c3e7a", maglia2: "#c0392b", pantaloni: "#2c3e7a", scarpe: "#3b2a1a",
      dettaglio: "grembiule", oggetto: "mattarello",
    },
  },
  {
    id: "contadino", nome: "Zio Cosimo", figura: "Il contadino",
    descrizione: "In campagna dall'alba. Conosce ogni ulivo per nome.",
    mosse: [{ nome: "Zappata tellurica", stile: "salto" }, { nome: "Spallata del trattore", stile: "carica" }],
    speciale: { nome: "Tempesta di olive", effetto: "pioggia", oggetto: "oliva" },
    suono: ["TUNF!", "STRACK!"],
    aspetto: {
      pelle: "#d9a066", capelli: "#9a9a9a", capigliatura: "corti", cappello: "coppola",
      baffi: "bianchi", barba: false, occhiali: "nessuno", corpo: "normale",
      maglia: "#6b8fb3", maglia2: "#6b4a2b", pantaloni: "#5a4632", scarpe: "#2b1d12",
      dettaglio: "gilet", oggetto: "zappa",
    },
  },
  {
    id: "tamarro", nome: "Tony Tuta", figura: "Il tamarro",
    descrizione: "Tuta lucida, catenone d'oro e occhiali da sole anche di sera.",
    mosse: [{ nome: "Catenone rotante", stile: "capriola" }, { nome: "Sgommata in piazza", stile: "carica" }],
    speciale: { nome: "Motorino truccato", effetto: "lancio", oggetto: "motorino" },
    suono: ["VROOM!", "SDENG!"],
    aspetto: {
      pelle: "#e0b080", capelli: "#1a1a1a", capigliatura: "ricci", cappello: "nessuno",
      baffi: "sottili", barba: false, occhiali: "sole", corpo: "normale",
      maglia: "#9b1c31", maglia2: "#ffffff", pantaloni: "#9b1c31", scarpe: "#f5f5f5",
      dettaglio: "catena", oggetto: "nessuno",
    },
  },
  {
    id: "ricco", nome: "Commendator Nando", figura: "Il ricco",
    descrizione: "Abito bianco, bastone dorato. Offre sempre lui il caffè.",
    mosse: [{ nome: "Colpo di bastone dorato", stile: "salto" }, { nome: "Lancio della moneta d'oro", stile: "lancio", oggetto: "moneta" }],
    speciale: { nome: "Pioggia di monete", effetto: "pioggia", oggetto: "moneta" },
    suono: ["DLIN!", "BONK!"],
    aspetto: {
      pelle: "#f0c39a", capelli: "#cfcfcf", capigliatura: "pochi", cappello: "panama",
      baffi: "folti", barba: false, occhiali: "nessuno", corpo: "pancia",
      maglia: "#f4f1e6", maglia2: "#b8860b", pantaloni: "#f4f1e6", scarpe: "#7a4a1f",
      dettaglio: "papillon", oggetto: "bastone",
    },
  },
  {
    id: "arrangiato", nome: "Peppino l'Arrangiato", figura: "Il povero (ma furbo)",
    descrizione: "Non ha una lira, ma aggiusta tutto con uno spago.",
    mosse: [{ nome: "Calcio con la scarpa bucata", stile: "salto" }, { nome: "Capriola con la toppa", stile: "capriola" }],
    speciale: { nome: "Sedia catapulta", effetto: "lancio", oggetto: "sedia" },
    suono: ["CRAC!", "PUF!"],
    aspetto: {
      pelle: "#e3b388", capelli: "#5a3b22", capigliatura: "corti", cappello: "basco",
      baffi: "nessuno", barba: true, occhiali: "nessuno", corpo: "magro",
      maglia: "#e8e2d0", maglia2: "#7a5c3a", pantaloni: "#4f5b66", scarpe: "#3a2a1c",
      dettaglio: "toppe", oggetto: "sedia",
    },
  },
  {
    id: "svizzero", nome: "Franco lo Svizzero", figura: "Tornato dalla Svizzera",
    descrizione: "Partito con la valigia di cartone, tornato col macchinone.",
    mosse: [{ nome: "Pugno puntuale", stile: "carica" }, { nome: "Tavoletta volante", stile: "lancio", oggetto: "cioccolato" }],
    speciale: { nome: "Valanga di cioccolata", effetto: "pioggia", oggetto: "cioccolato" },
    suono: ["CUCÙ!", "TIC-TAC!"],
    aspetto: {
      pelle: "#f2c49b", capelli: "#7a5a3a", capigliatura: "pochi", cappello: "nessuno",
      baffi: "folti", barba: false, occhiali: "sole", corpo: "pancia",
      maglia: "#c8102e", maglia2: "#ffffff", pantaloni: "#3d3d3d", scarpe: "#1a1a1a",
      dettaglio: "croce", oggetto: "orologio",
    },
  },
  {
    id: "vignaiolo", nome: "Mastro Vito", figura: "Il vignaiolo",
    descrizione: "Il suo Primitivo è il migliore. Lo dice lui.",
    mosse: [{ nome: "Pigiatura volante", stile: "salto" }, { nome: "Lancio del grappolo", stile: "lancio", oggetto: "uva" }],
    speciale: { nome: "Grappolo di Primitivo", effetto: "pioggia", oggetto: "uva" },
    suono: ["SPLASH!", "ZAC!"],
    aspetto: {
      pelle: "#d39a68", capelli: "#3a2a1a", capigliatura: "corti", cappello: "paglia",
      baffi: "folti", barba: false, occhiali: "nessuno", corpo: "normale",
      maglia: "#f0e6c8", maglia2: "#6a1b4d", pantaloni: "#3f4a3a", scarpe: "#2b1d12",
      dettaglio: "macchie", oggetto: "cesto",
    },
  },
  {
    id: "banda", nome: "Maestro Totò", figura: "Il suonatore della banda",
    descrizione: "Non perde una processione. Batte il tempo anche quando dorme.",
    mosse: [{ nome: "Nota sparata", stile: "lancio", oggetto: "nota" }, { nome: "Marcia trionfale", stile: "carica" }],
    speciale: { nome: "Grancassa tonante", effetto: "onda", oggetto: "nota" },
    suono: ["BUM!", "TATÀ!"],
    aspetto: {
      pelle: "#eab48a", capelli: "#2a2a2a", capigliatura: "corti", cappello: "banda",
      baffi: "sottili", barba: false, occhiali: "nessuno", corpo: "normale",
      maglia: "#1d2b5a", maglia2: "#e0b13a", pantaloni: "#1d2b5a", scarpe: "#111111",
      dettaglio: "alamari", oggetto: "mazza",
    },
  },
  {
    id: "parroco", nome: "Don Saverio", figura: "Il parroco",
    descrizione: "Conosce tutti in paese. Le sue prediche sono leggendarie.",
    mosse: [{ nome: "Predica tonante", stile: "carica" }, { nome: "Scivolata in tonaca", stile: "capriola" }],
    speciale: { nome: "Rintocco del campanile", effetto: "cade", oggetto: "campana" },
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
    mosse: [{ nome: "Calcio volante", stile: "salto" }, { nome: "Abbraccio stritolante", stile: "carica" }],
    speciale: { nome: "Volo dell'aquila", effetto: "lancio", oggetto: "aquila" },
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
