/**
 * Tutti i testi dell'interfaccia, in un unico posto.
 * Per correggere una parola basta cambiarla qui.
 * Regole: dai del tu, parole di tutti i giorni, niente inglese.
 */
export const T = {
  titolo: "Street Fraga",
  sottotitolo: "La sfida a colpi di risposte",
  luogo: "Fragagnano",

  // Barra fissa
  navigazione: "Navigazione",
  indietro: "Indietro",
  casa: "Casa",

  // Casa
  gioca: "Gioca",
  impostazioni: "Impostazioni",
  comeSiGioca: "Come si gioca",

  // Come si gioca
  comeSiGiocaTitolo: "Come si gioca",
  regole: [
    "Scegli il tuo lottatore.",
    "Rispondi alle domande toccando un pulsante.",
    "Risposta giusta: il tuo lottatore colpisce e guadagni 10 punti.",
    "3 risposte giuste di fila: colpo speciale e 5 punti in più!",
    "Risposta sbagliata: nessun punto tolto. Si impara qualcosa di nuovo.",
    "Vince chi ha più energia dopo 10 domande.",
  ],
  capito: "Ho capito, gioco!",

  // Livello
  livelloTitolo: "Quanto è bravo il tuo avversario?",
  livelli: { 1: "Facile", 2: "Medio", 3: "Difficile" } as Record<1 | 2 | 3, string>,
  livelliSpiegazione: {
    1: "Sbaglia spesso. Ideale per cominciare.",
    2: "Se la cava bene.",
    3: "Risponde quasi sempre giusto.",
  } as Record<1 | 2 | 3, string>,

  // Tempo
  tempoTitolo: "Vuoi giocare con il tempo?",
  senzaTempo: "Senza tempo",
  senzaTempoSpiegazione: "Rispondi con calma, quando vuoi.",
  conTempo: "Con il tempo",
  conTempoSpiegazione: (s: number) => `${s} secondi per ogni risposta. Se il tempo finisce, l'avversario ti colpisce!`,
  tempoRimasto: (s: number) => `Tempo: ${s} secondi`,
  tempoScaduto: "Tempo scaduto!",
  colpitoPerTempo: (chi: string, mossa: string) => `${chi} ne approfitta e ti colpisce con: ${mossa}`,

  // Scelta lottatore
  sceltaTitolo: "Scegli il tuo lottatore",
  sceltaAiuto: "Tocca una faccia per vederla meglio.",
  colpoSpeciale: "Colpo speciale",
  sceglieQuesto: (nome: string) => `Scelgo ${nome}`,

  // Presentazione
  contro: "contro",
  arena: "Davanti alla chiesa",
  combatti: "Combatti!",

  // Combattimento
  energia: "Energia",
  punti: "Punti",
  domandaNumero: (n: number, tot: number) => `Domanda ${n} di ${tot}`,
  spareggio: "Spareggio!",
  spareggioSpiegazione: "Siete pari! Una domanda di spareggio a testa.",
  memorizza: "Leggi con calma e ricorda.",
  hoMemorizzato: "Ho memorizzato",
  conferma: "Conferma",
  ascolta: "Ascolta",
  sceltaFatta: "Scelta",
  avanti: "Avanti",

  giusto: "Giusto!",
  sbagliato: "Non era questa.",
  rispostaGiusta: "La risposta giusta è:",
  loSapevi: "Lo sapevi?",
  puntiGuadagnati: (p: number) => `+${p} punti`,
  serieSpeciale: "3 di fila: colpo speciale!",
  colpisce: (chi: string, mossa: string) => `${chi} colpisce con: ${mossa}`,
  manca: (chi: string) => `${chi} manca il colpo... e inciampa!`,
  incoraggia: [
    "Niente paura, la prossima è tua!",
    "Ora la sai: alla prossima!",
    "Succede anche ai campioni!",
    "Forza, si continua!",
  ],

  turnoComputer: (nome: string) => `Ora risponde ${nome}`,
  computerGiusto: (nome: string, mossa: string) => `${nome} ha risposto giusto e ti colpisce con: ${mossa}`,
  computerSbagliato: (nome: string) => `${nome} ha sbagliato! Niente colpo per te.`,

  risposte: "Risposte",
  esciTitolo: "Vuoi lasciare la partita?",
  esciSpiegazione: "Se esci, questa partita non continua.",
  esciNo: "No, continuo a giocare",
  esciSi: "Sì, esco",

  // Fine
  haiVinto: "Hai vinto!",
  haPerso: (nome: string) => `Questa volta vince ${nome}.`,
  pareggio: "Pareggio!",
  ko: "Fuori combattimento!",
  stretta: "Alla fine ci si stringe la mano. Bella sfida!",
  bravoComunque: "Hai fatto una bella partita!",
  tuoiPunti: (p: number) => `I tuoi punti: ${p}`,
  risposteGiuste: (n: number) => `Risposte giuste: ${n}`,
  giocaAncora: "Gioca ancora",

  // Impostazioni
  impostazioniTitolo: "Impostazioni",
  passo: (n: number, tot: number) => `${n} di ${tot}`,
  grandezzaTesto: "Grandezza del testo",
  grandezze: { normale: "Normale", grande: "Grande", moltoGrande: "Molto grande" },
  grandezzaSpiegazione: "Prova: il testo cambia subito.",
  suoniSpiegazione: "I rumori dei colpi e delle risposte.",
  musicaSpiegazione: "Musica di Mozart, in versione da sala giochi.",
  dueTocchi: "Conferma la risposta con un secondo tocco",
  dueTocchiSpiegazione: "Tocchi la risposta, poi tocchi «Conferma». Così eviti sbagli.",
  leggiSempre: "Leggi sempre ad alta voce",
  leggiSempreSpiegazione: "Il telefono legge la domanda e le risposte.",
  suoni: "Suoni",
  musica: "Musica",
  si: "Sì",
  no: "No",
  fatto: "Fatto",
  nessunaVoce: "Questo dispositivo non ha una voce italiana.",

  // Musica (si vede sempre quando suona)
  musicaInCorso: "Musica: Mozart",
  musicaSpenta: "Musica spenta",
} as const;
