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
  colpiSpeciali: "I suoi 5 colpi speciali",
  mosse: "Mosse normali",
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

  // Festa di fine partita
  titoloVinto: "Hai vinto!",
  titoloPerso: "Hai perso!",
  titoloPari: "Pareggio!",
  sottotitoliVinto: [
    "Tutta Fragagnano parla di te: pure il campanile ha suonato!",
    "Più veloce di un tarallo che scappa dal sacchetto!",
    "Stasera {perdente} offre il caffè a tutta la piazza!",
    "La banda sta già provando la marcia in tuo onore!",
    "Ti hanno visto esultare fino al Monte Santa Sofia!",
  ],
  sottotitoliPerso: [
    "{vincitore} ha vinto, ma tu hai fatto sudare pure il campanile!",
    "Hai perso la sfida, non il buonumore!",
    "{vincitore} festeggia, ma la rivincita è già pronta in piazza!",
    "Oggi è andata così: domani si rifà, con un caffè in più!",
    "Anche i campioni ogni tanto inciampano su un tarallo!",
  ],
  sottotitoliPari: [
    "Pari e patta: si divide anche l'ultima fetta!",
    "Nessun vincitore, due campioni: la piazza applaude tutti e due!",
  ],
  saltaFesta: "Salta la festa",

  // Accesso con nome e codice segreto
  chiGioca: "Chi gioca?",
  toccaIlTuoNome: "Tocca il tuo nome.",
  altroGiocatore: "Sono un altro giocatore",
  miRegistro: "Mi registro: sono nuovo",
  hoGiaUnNome: "Ho già un nome",
  provaSenza: "Prova senza registrarti",
  provaSenzaSpiegazione: "Puoi giocare subito, ma i punti non vengono salvati.",
  haiGiaUnNome: "Hai già un nome nel gioco?",
  siEntro: "Sì, entro con il mio nome",
  noRegistro: "No, mi registro adesso",
  comeTiChiami: "Come ti chiami?",
  consiglioSoprannome: "Puoi usare un soprannome.",
  scriviNome: "Scrivi qui il tuo nome",
  nomeNonValido: "Il nome deve avere da 2 a 20 lettere.",
  scegliCodice: "Scegli un codice segreto di 4 numeri",
  consiglioBancomat: "Non usare il codice del bancomat o del telefono.",
  ripetiCodice: "Ripeti il codice segreto",
  codiciDiversi: "I due codici sono diversi. Ricominciamo con calma.",
  scriviCodice: (nome: string) => `Ciao ${nome}! Scrivi il tuo codice segreto.`,
  cancella: "Cancella",
  entra: "Entra",
  restaCollegato: "Resta collegato su questo dispositivo",
  unAttimo: "Un attimo...",
  nomePreso: (nome: string) => `Il nome «${nome}» c'è già.`,
  propostaNome: (p: string) => `Ti propongo: «${p}»`,
  usaProposta: "Va bene, uso questo",
  altroNome: "Scelgo un altro nome",
  codiceSbagliato: "Il codice non è giusto. Riprova con calma.",
  codiceDimenticato: "Hai dimenticato il codice? Chiedi a chi gestisce il gioco.",
  pausa: (m: number) => `Facciamo una pausa: riprova tra ${m} minuti.`,
  nomeSconosciuto: "Non trovo questo nome. Controlla come l'hai scritto.",
  senzaRete: "Manca la connessione. Puoi giocare lo stesso in prova.",
  benvenuto: (nome: string) => `Benvenuto, ${nome}!`,
  bentornato: (nome: string) => `Bentornato, ${nome}!`,
  pronto: "Sei pronto a combattere?",
  giochiCome: (nome: string) => `Giochi come: ${nome}`,
  giochiInProva: "Stai giocando in prova",
  esci: "Esci",

  // Classifica
  classifica: "Classifica",
  classificaTitolo: "Classifica del paese",
  settimana: "Questa settimana",
  sempre: "Di sempre",
  nessunaPartita: "Ancora nessuna partita: gioca la prima!",
  caricamento: "Sto caricando...",
  riga: (pos: number, nome: string) => `${pos}. ${nome}`,
  puntiVittorie: (p: number, v: number) => `${p} punti · ${v} ${v === 1 ? "vittoria" : "vittorie"}`,
  tu: "Tu",
  iTuoiProgressi: "I tuoi progressi",
  progressi: (p: number, v: number, g: number) => `${p} punti · ${v} ${v === 1 ? "vittoria" : "vittorie"} · ${g} ${g === 1 ? "giorno" : "giorni"} di gioco`,
  altro: "Altro",
  puntiSalvati: "Punti salvati nella classifica!",
  puntiNonSalvatiProva: "In prova i punti non vengono salvati.",
  puntiNonSalvatiRete: "Non sono riuscito a salvare i punti: manca la connessione.",

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
  movimenti: "Movimenti dei lottatori",
  movimentiSpiegazione: "Salti, capriole e oggetti che volano. Se ti danno fastidio, scegli «Ridotti».",
  movimentiTelefono: "Come il telefono",
  movimentiCompleti: "Sempre completi",
  movimentiRidotti: "Ridotti",
  si: "Sì",
  no: "No",
  fatto: "Fatto",
  nessunaVoce: "Questo dispositivo non ha una voce italiana.",

  // Musica (si vede sempre quando suona)
  musicaInCorso: "Musica: Mozart",
  musicaSpenta: "Musica spenta",
} as const;
