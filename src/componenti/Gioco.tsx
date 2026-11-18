"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { T } from "@/testi";
import { BRANI_TORNEO, audio } from "@/gioco/audio";
import { leggi, voceItaliana, zitto } from "@/gioco/voce";
import { type Impostazioni, PREDEFINITE, SCALA, carica, salva } from "@/gioco/impostazioni";
import { PERSONAGGI, type Personaggio, specialeDi, trovaPersonaggio } from "@/gioco/personaggi";
import { MAZZO } from "@/gioco/domande";
import { creaRng, mescola } from "@/gioco/rng";
import type { Domanda, Livello } from "@/gioco/tipi";
import {
  BRAVURA_COMPUTER, DOMANDE_PER_GIOCATORE, SECONDI_PER_RISPOSTA, colpoPerTempo, ENERGIA_INIZIALE, type Combattente, type EsitoColpo,
  DOMANDE_PER_LIVELLO, adattaLivello, applicaRisposta, bonusVelocita, nuovoCombattente, partitaFinita, prossimaDomanda, vincitore,
} from "@/gioco/regole";
import { Arena, MOMENTO_COLPO, type Azione } from "./Arena";
import { Lottatore, Ritratto } from "./Lottatore";
import { SvgOggetto } from "./Oggetti";
import { BarraFissa, Pulsante } from "./ui";
import { Chiesa } from "./Chiesa";
import { Festa, scegliSottotitolo, type Risultato } from "./Festa";
import { FestaCoppa } from "./Coppa";
import { type Luogo, NOMI_LUOGHI } from "./Sfondi";
import {
  SchermataBenvenuto, SchermataChiGioca, SchermataCodice, SchermataHaiNome, SchermataNome, SchermataNomePreso,
} from "./Accesso";
import { SchermataClassifica } from "./Classifica";
import { SchermataParola } from "./Parola";
import paroleDaRaccogliere from "../../content/parole-da-raccogliere.json";
import {
  type Esito, type Sessione, SenzaRete, accedi, chiSono, dimenticaSessione, esciDalDb, nomeValido, nomiDelDispositivo,
  paroleDaConfermare, parolaDaChiedere, registra, salvaPartita, salvaSessione, sessioneSalvata, vinciCoppa,
} from "@/gioco/conto";

/** Il torneo: ottavi, quarti, semifinale e finale, ognuno in un luogo del paese. */
/** In quale domanda della partita arriva la domanda di dialetto. */
const DOMANDA_DIALETTO = 5;
const LUOGHI_TORNEO: Luogo[] = ["scuola", "cappella", "municipio", "chiesa"];
interface Torneo { avversari: string[]; turno: number }
import { applicaMovimenti } from "./movimento";

type Schermata = "casa" | "regole" | "impostazioni" | "altro" | "classifica"
  | "campione" | "parola" | "accesso" | "haiNome" | "nome" | "codice" | "ripeti" | "nomePreso" | "benvenuto" | "livello" | "tempo" | "scelta" | "dettaglio" | "presentazione" | "lotta" | "fine" | "esci";
type Fase = "stimolo" | "domanda" | "esito" | "computer" | "spareggio";

interface Partita {
  giocatore: Combattente;
  computer: Combattente;
  livello: Livello;
  giusteDiFila: number;
  sbagliateDiFila: number;
  usate: string[];
  domanda: Domanda;
  numero: number;
  fase: Fase;
  scelta: number | null;
  inizio: number; // quando è comparsa la domanda (per il bonus velocità)
  tempoScelta: number | null; // quando è stata toccata la risposta
  esito: EsitoColpo | null;
  esitoComputer: EsitoColpo | null;
  azione: Azione | null;
  spareggio: boolean;
  scaduto: boolean; // il tempo è finito prima della risposta
}

export default function Gioco() {
  const [imp, setImp] = useState<Impostazioni>(PREDEFINITE);
  const [storia, setStoria] = useState<Schermata[]>(["casa"]);
  const schermata = storia[storia.length - 1];
  const [livelloScelto, setLivelloScelto] = useState<Livello>(1);
  const [conTempo, setConTempo] = useState(false);
  const [mioId, setMioId] = useState<string>(PERSONAGGI[0].id);
  // Chi gioca: un giocatore registrato oppure "in prova" (punti non salvati)
  const [sessione, setSessione] = useState<Sessione | null>(null);
  const [inProva, setInProva] = useState(false);
  const [nomi, setNomi] = useState<string[]>([]);
  const [flusso, setFlusso] = useState<"nuovo" | "entra">("nuovo");
  const [nome, setNome] = useState("");
  const [codice, setCodice] = useState("");
  const [codice1, setCodice1] = useState(""); // il primo codice, solo in memoria finché non si conferma
  const [errore, setErrore] = useState<React.ReactNode>(null);
  const [attesa, setAttesa] = useState(false);
  const [restaCollegato, setRestaCollegato] = useState(true);
  const [proposta, setProposta] = useState<string | null>(null);
  const [benvenuto, setBenvenuto] = useState("");
  const [avversarioId, setAvversarioId] = useState<string>(PERSONAGGI[1].id);
  const [partita, setPartita] = useState<Partita | null>(null);
  const [torneo, setTorneo] = useState<Torneo | null>(null);
  // Raccolta del dialetto a fine partita: la parola da chiedere e dove andare dopo
  const [parola, setParola] = useState("");
  const [dopoParola, setDopoParola] = useState<Schermata[]>(["casa"]);
  const daConfermare = useRef<string[]>([]);
  const chiediParola = (poi: Schermata[]) => {
    setParola(parolaDaChiedere(paroleDaRaccogliere.parole.map((p) => p.italiano), daConfermare.current, rng.current));
    setDopoParola(poi);
    setStoria(["casa", "parola"]);
  };
  const [haVoce, setHaVoce] = useState(false);
  const rng = useRef(creaRng(1));
  const contatore = useRef(1);
  const titoloRef = useRef<HTMLHeadingElement>(null);

  // Impostazioni salvate sul dispositivo; seme casuale scelto nel browser
  useEffect(() => {
    // letto dopo il primo disegno: sul server localStorage non esiste
    setImp(carica()); // eslint-disable-line react-hooks/set-state-in-effect
    setNomi(nomiDelDispositivo());
    paroleDaConfermare().then((l) => { daConfermare.current = l ?? []; }).catch(() => {});
    const s = sessioneSalvata();
    if (s) {
      setSessione(s);
      // controlla in silenzio che il gettone sia ancora valido
      chiSono(s.token).then((r) => { if (!r) { dimenticaSessione(); setSessione(null); } }).catch(() => {});
    }
    rng.current = creaRng(Math.floor(Math.random() * 2 ** 31));
  }, []);
  useEffect(() => {
    document.documentElement.style.setProperty("--scala-testo", SCALA[imp.testo]);
    audio.suoniAttivi = imp.suoni;
    applicaMovimenti(imp.movimenti);
    if (audio.musicaAttiva !== imp.musica) audio.impostaMusica(imp.musica);
  }, [imp]);
  const cambia = (parziale: Partial<Impostazioni>) => {
    setImp((i) => { const n = { ...i, ...parziale }; salva(n); return n; });
  };

  // Voce italiana: il pulsante "Ascolta" compare solo se esiste
  useEffect(() => {
    const aggiorna = () => setHaVoce(!!voceItaliana());
    aggiorna();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", aggiorna);
      return () => window.speechSynthesis.removeEventListener("voiceschanged", aggiorna);
    }
  }, []);

  // Musica: Serenata nei menu, Rondò alla turca nel combattimento
  const inTorneo = ["presentazione", "lotta", "fine", "esci"].includes(schermata);
  const brano = schermata === "campione" ? "coppa" : inTorneo ? BRANI_TORNEO[(torneo?.turno ?? 0) % BRANI_TORNEO.length] : "menu";
  useEffect(() => { if (audio.pronto) audio.suona(brano); }, [brano]);
  const primoTocco = () => {
    if (!audio.pronto) {
      audio.sblocca();
      audio.musicaAttiva = imp.musica;
      audio.suona(brano);
    }
  };

  // Ogni schermata nuova riparte dall'alto e porta il lettore di schermo sul titolo
  useEffect(() => {
    window.scrollTo(0, 0);
    titoloRef.current?.focus({ preventScroll: true });
    zitto();
  }, [schermata, partita?.fase, partita?.numero]);

  const vai = (s: Schermata) => setStoria((st) => [...st, s]);
  const sostituisci = (s: Schermata) => setStoria((st) => [...st.slice(0, -1), s]);
  const casa = () => {
    if (schermata === "lotta") return vai("esci");
    setStoria(["casa"]);
  };
  const indietro = () => {
    if (schermata === "lotta") return vai("esci");
    if (schermata === "fine") return setStoria(["casa"]);
    setStoria((st) => (st.length > 1 ? st.slice(0, -1) : st));
  };

  // ---------------- Combattimento ----------------
  const me = trovaPersonaggio(mioId);
  const lui = trovaPersonaggio(avversarioId);

  const nuovaDomanda = useCallback((p: Omit<Partita, "domanda" | "fase" | "scelta" | "inizio" | "tempoScelta">, prima: boolean): Partita => {
    // Almeno una domanda di dialetto in ogni partita: la quinta
    const dialetto = p.numero === DOMANDA_DIALETTO && !p.usate.some((id) => id.startsWith("DIA-"));
    const d = prossimaDomanda(rng.current, MAZZO, new Set(p.usate), p.livello, prima, dialetto ? "dialetto" : undefined);
    return { ...p, domanda: d, usate: [...p.usate, d.id], fase: d.stimolo ? "stimolo" : "domanda", scelta: null, inizio: Date.now(), tempoScelta: null };
  }, []);

  const iniziaPartita = () => {
    const base = {
      giocatore: nuovoCombattente(), computer: nuovoCombattente(), livello: DOMANDE_PER_LIVELLO[livelloScelto].partenza,
      giusteDiFila: 0, sbagliateDiFila: 0, usate: [], numero: 1,
      esito: null, esitoComputer: null, azione: null, spareggio: false, scaduto: false,
    };
    setPartita(nuovaDomanda(base, true));
    setStoria(["casa", "lotta"]);
  };

  const scritta = (p: Personaggio, c: Combattente, e: EsitoColpo) =>
    !e.giusta ? "BOING!" : e.speciale ? p.suono[0] : p.suono[c.giuste % 2];

  const stileMossa = (p: Personaggio, c: Combattente) => {
    const m = p.mosse[c.giuste % 2];
    return { stile: m.stile, oggetto: m.oggetto };
  };

  const rispondi = (i: number) => {
    if (!partita) return;
    const giusta = i === partita.domanda.corretta;
    const secondi = ((partita.tempoScelta ?? Date.now()) - partita.inizio) / 1000;
    const r = applicaRisposta(partita.giocatore, partita.computer, giusta, livelloScelto, giusta ? bonusVelocita(secondi, livelloScelto) : null);
    const lim = DOMANDE_PER_LIVELLO[livelloScelto];
    const giusteDiFila = giusta ? partita.giusteDiFila + 1 : 0;
    const sbagliateDiFila = giusta ? 0 : partita.sbagliateDiFila + 1;
    if (giusta) audio.giusto(); else audio.sbagliato();
    if (r.esito.speciale) audio.speciale(MOMENTO_COLPO.speciale);
    else if (giusta) audio.colpo(MOMENTO_COLPO[stileMossa(me, partita.giocatore).stile]);
    else audio.manca();
    setPartita({
      ...partita,
      giocatore: r.attaccante,
      computer: r.difensore,
      giusteDiFila, sbagliateDiFila,
      livello: adattaLivello(partita.livello, giusteDiFila, sbagliateDiFila, lim.min, lim.max),
      scelta: i,
      esito: r.esito,
      scaduto: false,
      fase: "esito",
      azione: {
        chi: "giocatore",
        tipo: !giusta ? "manca" : r.esito.speciale ? "speciale" : "colpo",
        scritta: scritta(me, partita.giocatore, r.esito),
        ...stileMossa(me, partita.giocatore),
        speciale: specialeDi(me, r.attaccante.giuste),
        chiave: contatore.current++,
      },
    });
  };

  /** Modalità "Con il tempo": se il tempo finisce vale la risposta già toccata, altrimenti colpisce l'avversario. */
  const tempoScaduto = () => {
    if (!partita || partita.fase !== "domanda") return;
    if (partita.scelta !== null) return rispondi(partita.scelta);
    const r = applicaRisposta(partita.giocatore, partita.computer, false, livelloScelto);
    const lim = DOMANDE_PER_LIVELLO[livelloScelto];
    const sbagliateDiFila = partita.sbagliateDiFila + 1;
    audio.sbagliato();
    const stile = stileMossa(lui, partita.computer);
    audio.colpo(MOMENTO_COLPO[stile.stile]);
    setPartita({
      ...partita,
      giocatore: colpoPerTempo(r.attaccante),
      giusteDiFila: 0, sbagliateDiFila,
      livello: adattaLivello(partita.livello, 0, sbagliateDiFila, lim.min, lim.max),
      esito: r.esito,
      scaduto: true,
      fase: "esito",
      azione: { chi: "computer", tipo: "colpo", scritta: lui.suono[partita.computer.giuste % 2], ...stile, chiave: contatore.current++ },
    });
  };

  const turnoComputer = () => {
    if (!partita) return;
    if (partita.computer.energia === 0 || partita.giocatore.energia === 0) return finePartita();
    const giusta = rng.current() < BRAVURA_COMPUTER[livelloScelto];
    const r = applicaRisposta(partita.computer, partita.giocatore, giusta, livelloScelto);
    if (r.esito.speciale) audio.speciale(MOMENTO_COLPO.speciale);
    else if (giusta) audio.colpo(MOMENTO_COLPO[stileMossa(lui, partita.computer).stile]);
    else audio.manca();
    setPartita({
      ...partita,
      computer: r.attaccante,
      giocatore: r.difensore,
      esitoComputer: r.esito,
      fase: "computer",
      azione: {
        chi: "computer",
        tipo: !giusta ? "manca" : r.esito.speciale ? "speciale" : "colpo",
        scritta: scritta(lui, partita.computer, r.esito),
        ...stileMossa(lui, partita.computer),
        speciale: specialeDi(lui, r.attaccante.giuste),
        chiave: contatore.current++,
      },
    });
  };

  const dopoComputer = () => {
    if (!partita) return;
    const { giocatore: g, computer: c } = partita;
    if (partitaFinita(g, c, partita.spareggio)) {
      if (vincitore(g, c) === "pari" && !partita.spareggio && g.energia > 0) {
        setPartita({ ...partita, spareggio: true, fase: "spareggio", azione: null });
        return;
      }
      return finePartita();
    }
    setPartita(nuovaDomanda({ ...partita, numero: partita.numero + 1, azione: null }, false));
  };

  const dopoSpareggio = () => {
    if (!partita) return;
    setPartita(nuovaDomanda({ ...partita, numero: partita.numero + 1, azione: null }, false));
  };

  const finePartita = () => {
    if (partita && vincitore(partita.giocatore, partita.computer) === "giocatore") audio.vittoria();
    setStoria(["casa", "fine"]);
  };

  // Lettura ad alta voce automatica
  useEffect(() => {
    if (!imp.leggiSempre || !partita || schermata !== "lotta") return;
    if (partita.fase === "stimolo" && partita.domanda.stimolo) leggi(partita.domanda.stimolo);
    if (partita.fase === "domanda") leggi(testoDaLeggere(partita.domanda));
  }, [imp.leggiSempre, partita?.fase, partita?.numero, schermata]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------- Accesso ----------------
  const pulisci = () => { setErrore(null); setCodice(""); setCodice1(""); };

  const messaggioErrore = (e: Exclude<Esito, { nome: string }>) => {
    switch (e.errore) {
      case "codice_sbagliato": return <><span>{T.codiceSbagliato}</span><span className="font-normal">{T.codiceDimenticato}</span></>;
      case "pausa": return T.pausa(e.minuti);
      case "nome_sconosciuto": return T.nomeSconosciuto;
      case "nome_non_valido": return T.nomeNonValido;
      default: return T.senzaRete;
    }
  };

  const entrato = (s: Sessione, testo: string) => {
    salvaSessione(s, restaCollegato);
    setSessione(s); setInProva(false); setNomi(nomiDelDispositivo());
    setCodice(""); setCodice1("");
    setBenvenuto(testo);
    setStoria(["casa", "benvenuto"]);
  };

  const entra = async () => {
    setAttesa(true); setErrore(null);
    try {
      const r = await accedi(nome, codice);
      if ("nome" in r && r.nome) return entrato({ nome: r.nome, token: r.token }, T.bentornato(r.nome));
      setCodice("");
      setErrore(messaggioErrore(r as Exclude<Esito, { nome: string }>));
    } catch (e) {
      setErrore(e instanceof SenzaRete ? T.senzaRete : T.senzaRete);
    } finally { setAttesa(false); }
  };

  const registrati = async (n: string) => {
    setAttesa(true); setErrore(null);
    try {
      const r = await registra(n, codice1);
      if ("nome" in r && r.nome) return entrato({ nome: r.nome, token: r.token }, T.benvenuto(r.nome));
      if (r.errore === "nome_preso") { setProposta(r.proposta); setNome(n); setCodice(""); return setStoria(["casa", "nomePreso"]); }
      setErrore(messaggioErrore(r as Exclude<Esito, { nome: string }>));
    } catch {
      setErrore(T.senzaRete);
    } finally { setAttesa(false); }
  };

  const esci = () => {
    if (sessione) void esciDalDb(sessione.token).catch(() => {});
    dimenticaSessione();
    setSessione(null); setInProva(false);
    setStoria(["casa"]);
  };

  // ---------------- Disegno ----------------
  return (
    <div onPointerDownCapture={primoTocco} className="min-h-dvh flex flex-col">
      <BarraFissa onIndietro={indietro} onCasa={casa} musica={imp.musica} onMusica={() => cambia({ musica: !imp.musica })} inCasa={schermata === "casa"} onMenu={() => vai("altro")} />
      <main className="flex-1 w-full mx-auto max-w-5xl px-4 pb-10">
        {schermata === "casa" && (
          <SchermataCasa titoloRef={titoloRef} onGioca={() => vai(sessione || inProva ? "livello" : "accesso")} />
        )}
        {schermata === "altro" && (
          <section className="pt-6 flex flex-col gap-5">
            <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo">{T.menu}</h1>
            {(sessione || inProva) && (
              <div className="flex items-center gap-3 rounded-[var(--raggio)] bg-[var(--notte-chiara)] pl-4 pr-2 py-2">
                <p className="flex-1 leading-snug">
                  {sessione ? <>{T.staiGiocandoCome} <strong className="text-[1.5rem] text-[var(--giallo)]">{sessione.nome}</strong></> : T.giochiInProva}
                </p>
                <Pulsante variante="scuro" className="shrink-0 !px-4" aria-label={T.cambiaGiocatore} onClick={esci}>{T.cambia}</Pulsante>
              </div>
            )}
            <Pulsante className="w-full" onClick={() => vai("classifica")}><span aria-hidden="true">🏆</span> {T.classifica}</Pulsante>
            <Pulsante className="w-full" onClick={() => vai("regole")}>{T.comeSiGioca}</Pulsante>
            <Pulsante className="w-full" onClick={() => vai("impostazioni")}>{T.impostazioni}</Pulsante>
          </section>
        )}
        {schermata === "classifica" && <SchermataClassifica titoloRef={titoloRef} sessione={sessione} />}
        {schermata === "accesso" && (
          <SchermataChiGioca titoloRef={titoloRef} nomi={nomi}
            onNome={(n) => { setNome(n); setFlusso("entra"); pulisci(); vai("codice"); }}
            onAltro={() => vai("haiNome")}
            onRegistro={() => { setFlusso("nuovo"); setNome(""); pulisci(); vai("nome"); }}
            onHoNome={() => { setFlusso("entra"); setNome(""); pulisci(); vai("nome"); }}
            onProva={() => { setInProva(true); setStoria(["casa", "livello"]); }} />
        )}
        {schermata === "haiNome" && (
          <SchermataHaiNome titoloRef={titoloRef}
            onSi={() => { setFlusso("entra"); setNome(""); pulisci(); vai("nome"); }}
            onNo={() => { setFlusso("nuovo"); setNome(""); pulisci(); vai("nome"); }} />
        )}
        {schermata === "nome" && (
          <SchermataNome titoloRef={titoloRef} nome={nome} onCambia={setNome} errore={errore as string | null} nuovo={flusso === "nuovo"}
            onAvanti={() => {
              if (!nomeValido(nome)) return setErrore(T.nomeNonValido);
              setNome(nome.trim().replace(/\s+/g, " ")); pulisci(); vai("codice");
            }} />
        )}
        {schermata === "codice" && (
          flusso === "nuovo" ? (
            <SchermataCodice titoloRef={titoloRef} titolo={T.scegliCodice} consiglio={T.consiglioBancomat}
              codice={codice} onCambia={(c) => { setCodice(c); setErrore(null); }} errore={errore}
              pulsante={T.avanti} attesa={false} onAvanti={() => { setCodice1(codice); setCodice(""); vai("ripeti"); }} />
          ) : (
            <SchermataCodice titoloRef={titoloRef} titolo={T.scriviCodice(nome)}
              codice={codice} onCambia={(c) => { setCodice(c); setErrore(null); }} errore={errore}
              pulsante={T.entra} attesa={attesa} onAvanti={entra} dimenticato
              restaCollegato={restaCollegato} onRestaCollegato={setRestaCollegato} />
          )
        )}
        {schermata === "ripeti" && (
          <SchermataCodice titoloRef={titoloRef} titolo={T.ripetiCodice}
            codice={codice} onCambia={(c) => { setCodice(c); setErrore(null); }} errore={errore}
            pulsante={T.avanti} attesa={attesa} onAvanti={() => {
              if (codice !== codice1) {
                setCodice(""); setCodice1(""); setErrore(T.codiciDiversi);
                return setStoria((st) => [...st.slice(0, -1)]);
              }
              void registrati(nome);
            }}
            restaCollegato={restaCollegato} onRestaCollegato={setRestaCollegato} />
        )}
        {schermata === "nomePreso" && (
          <SchermataNomePreso titoloRef={titoloRef} nome={nome} proposta={proposta}
            onUsa={() => { if (proposta) { setNome(proposta); void registrati(proposta); } }}
            onAltro={() => { setCodice(""); setCodice1(""); setStoria(["casa", "nome"]); }} />
        )}
        {schermata === "benvenuto" && (
          <SchermataBenvenuto titoloRef={titoloRef} testo={benvenuto} onAvanti={() => setStoria(["casa", "livello"])} />
        )}
        {schermata === "regole" && (
          <section className="pt-6 flex flex-col gap-6">
            <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo">{T.comeSiGiocaTitolo}</h1>
            <ol className="pannello p-5 flex flex-col gap-3 list-decimal pl-12 text-[1.5rem]">
              {T.regole.map((r) => <li key={r}>{r}</li>)}
            </ol>
            <Pulsante variante="giallo" className="w-full" onClick={() => sostituisci("livello")}>{T.capito}</Pulsante>
          </section>
        )}
        {schermata === "impostazioni" && (
          <SchermataImpostazioni titoloRef={titoloRef} imp={imp} cambia={cambia} haVoce={haVoce} fine={indietro} />
        )}
        {schermata === "livello" && (
          <section className="pt-6 flex flex-col gap-5">
            <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo">{T.livelloTitolo}</h1>
            {([1, 2, 3] as Livello[]).map((l) => (
              <Pulsante key={l} className="w-full flex-col !items-start text-left" onClick={() => { setLivelloScelto(l); vai("tempo"); }}>
                <span className="text-[1.75rem]">{T.livelli[l]}</span>
                <span className="testo-piccolo font-normal">{T.livelliSpiegazione[l]}</span>
              </Pulsante>
            ))}
          </section>
        )}
        {schermata === "tempo" && (
          <section className="pt-6 flex flex-col gap-5">
            <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo">{T.tempoTitolo}</h1>
            <Pulsante className="w-full flex-col !items-start text-left" onClick={() => { setConTempo(false); vai("scelta"); }}>
              <span className="text-[1.75rem]">{T.senzaTempo}</span>
              <span className="testo-piccolo font-normal">{T.senzaTempoSpiegazione}</span>
            </Pulsante>
            <Pulsante className="w-full flex-col !items-start text-left" onClick={() => { setConTempo(true); vai("scelta"); }}>
              <span className="text-[1.75rem]"><span aria-hidden="true">⏱</span> {T.conTempo}</span>
              <span className="testo-piccolo font-normal">{T.conTempoSpiegazione(SECONDI_PER_RISPOSTA)}</span>
            </Pulsante>
          </section>
        )}
        {schermata === "scelta" && (
          <section className="pt-6 flex flex-col gap-4">
            <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo">{T.sceltaTitolo}</h1>
            <p>{T.sceltaAiuto}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {PERSONAGGI.map((p) => (
                <Pulsante key={p.id} className="!p-2 flex-col !gap-1 !justify-start" onClick={() => { setMioId(p.id); vai("dettaglio"); }}>
                  <span className="block w-full aspect-square rounded-xl bg-[#f3e2c0] border-2 border-black overflow-hidden">
                    <Ritratto p={p} />
                  </span>
                  <span className="testo-piccolo leading-tight">{p.nome}</span>
                </Pulsante>
              ))}
            </div>
          </section>
        )}
        {schermata === "dettaglio" && (
          <section className="pt-6 flex flex-col gap-5">
            <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo">{me.nome}</h1>
            <div className="grid sm:grid-cols-2 gap-5 items-stretch">
              <div className="arena rounded-2xl border-[3px] border-black h-[17rem] sm:h-auto sm:min-h-[22rem]">
                <Chiesa />
                <div className="absolute inset-x-0 bottom-2 h-[88%] flex justify-center">
                  <div className="h-full aspect-[210/300] dissolvenza"><Lottatore p={me} /></div>
                </div>
              </div>
              <div className="pannello p-5 flex flex-col gap-3">
                <p className="font-bold text-[1.5rem]">{me.figura}</p>
                <p>{me.descrizione}</p>
                <p className="font-bold">{T.colpiSpeciali}:</p>
                <ul className="flex flex-col gap-2">
                  {me.speciali.map((sp) => (
                    <li key={sp.nome} className="flex items-center gap-3 font-bold">
                      <SvgOggetto tipo={sp.oggetto} className="w-10 h-10 shrink-0" />
                      {sp.nome}
                    </li>
                  ))}
                </ul>
                <p className="font-bold">{T.mosse}:</p>
                <ul className="list-disc pl-7">
                  {me.mosse.map((m) => <li key={m.nome}>{m.nome}</li>)}
                </ul>
              </div>
            </div>
            <Pulsante variante="giallo" className="w-full" onClick={() => {
              const avversari = mescola(rng.current, PERSONAGGI.filter((p) => p.id !== mioId)).slice(0, 4).map((p) => p.id);
              setTorneo({ avversari, turno: 0 });
              setAvversarioId(avversari[0]);
              vai("presentazione");
            }}>
              {T.sceglieQuesto(me.nome)}
            </Pulsante>
          </section>
        )}
        {schermata === "presentazione" && torneo && (
          <section className="pt-6 flex flex-col gap-5">
            <p className="fumetto text-center text-[var(--giallo)] text-[1.5rem]">{T.torneo}</p>
            <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo text-center">{T.turni[torneo.turno]}</h1>
            <ol className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label={T.torneo}>
              {T.turni.map((t, i) => {
                const avv = trovaPersonaggio(torneo.avversari[i]);
                const stato = i < torneo.turno ? T.turnoVinto : i === torneo.turno ? T.turnoOra : T.turnoDopo;
                return (
                  <li key={t} className={`pannello p-2 flex flex-col items-center text-center gap-1 ${i === torneo.turno ? "!bg-[var(--giallo)]" : ""}`}>
                    <span className="testo-piccolo font-bold leading-tight">{t}</span>
                    <span className="block w-16 h-16 rounded-xl border-2 border-black bg-[#f3e2c0] overflow-hidden fumetto text-[2.5rem] leading-[4rem] text-center text-[var(--inchiostro)]">
                      {i <= torneo.turno ? <Ritratto p={avv} /> : "?"}
                    </span>
                    <span className="testo-piccolo leading-tight">{i <= torneo.turno ? avv.nome : "?"}</span>
                    <span className="testo-piccolo font-bold">{i < torneo.turno ? "✓ " : i === torneo.turno ? "▶ " : ""}{stato}</span>
                  </li>
                );
              })}
            </ol>
            <p className="text-center text-[1.5rem] font-bold">
              {me.nome} <span className="fumetto text-[var(--giallo)]">{T.contro}</span> {lui.nome}
            </p>
            <Arena luogo={LUOGHI_TORNEO[torneo.turno]} giocatore={me} computer={lui} className="rounded-2xl border-[3px] border-black h-[15rem] sm:h-[22rem]" />
            <p className="text-center">{NOMI_LUOGHI[LUOGHI_TORNEO[torneo.turno]]} · {T.livelli[livelloScelto]} · {conTempo ? T.conTempo : T.senzaTempo}</p>
            <Pulsante variante="giallo" className="w-full fumetto !text-[1.75rem]" onClick={iniziaPartita}>{T.combatti}</Pulsante>
          </section>
        )}
        {schermata === "esci" && (
          <section className="pt-6 flex flex-col gap-5">
            <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo">{T.esciTitolo}</h1>
            <p>{T.esciSpiegazione}</p>
            <Pulsante variante="giallo" className="w-full" onClick={() => setStoria((s) => s.slice(0, -1))}>{T.esciNo}</Pulsante>
            <Pulsante className="w-full" onClick={() => { setPartita(null); setStoria(["casa"]); }}>{T.esciSi}</Pulsante>
          </section>
        )}
        {schermata === "lotta" && partita && (
          <SchermataLotta
            titoloRef={titoloRef} p={partita} me={me} lui={lui} imp={imp} haVoce={haVoce}
            conTempo={conTempo} onScaduto={tempoScaduto} luogo={LUOGHI_TORNEO[torneo?.turno ?? 0]}
            scegli={(i) => (imp.dueTocchi ? setPartita({ ...partita, scelta: i, tempoScelta: Date.now() }) : rispondi(i))}
            conferma={() => partita.scelta !== null && rispondi(partita.scelta)}
            memorizzato={() => setPartita({ ...partita, fase: "domanda", inizio: Date.now(), tempoScelta: null })}
            avantiEsito={turnoComputer}
            avantiComputer={dopoComputer}
            avantiSpareggio={dopoSpareggio}
          />
        )}
        {schermata === "fine" && partita && torneo && (
          <SchermataFine titoloRef={titoloRef} p={partita} me={me} lui={lui} sessione={sessione} livello={livelloScelto}
            luogo={LUOGHI_TORNEO[torneo.turno]} turno={torneo.turno}
            avanti={() => {
              if (torneo.turno >= 3) return chiediParola(["casa", "campione"]);
              const t = { ...torneo, turno: torneo.turno + 1 };
              setTorneo(t);
              setAvversarioId(t.avversari[t.turno]);
              chiediParola(["casa", "presentazione"]);
            }}
            riprova={() => chiediParola(["casa", "presentazione"])} />
        )}
        {schermata === "parola" && (
          <SchermataParola key={parola} titoloRef={titoloRef} parola={parola} token={sessione?.token ?? null} avanti={() => setStoria(dopoParola)} />
        )}
        {schermata === "campione" && torneo && (
          <SchermataCampione titoloRef={titoloRef} me={me} battuti={torneo.avversari.map(trovaPersonaggio)} sessione={sessione} livello={livelloScelto}
            nuovo={() => { setTorneo(null); setStoria(["casa", "scelta"]); }} />
        )}
      </main>
    </div>
  );
}

function testoDaLeggere(d: Domanda) {
  return `${d.domanda} ${d.risposte.map((r, i) => `${i + 1}: ${r}.`).join(" ")}`;
}

// ---------------- Schermate ----------------

type RefTitolo = React.RefObject<HTMLHeadingElement | null>;

function SchermataCasa({ titoloRef, onGioca }: { titoloRef: RefTitolo; onGioca: () => void }) {
  return (
    /* Telefono: copertina in alto e pulsanti sotto. Tablet e computer: copertina a tutto schermo
       come la schermata iniziale di un gioco da PC, con il menu sopra, a destra. */
    <section className="casa flex flex-col gap-4">
      {/* sfondo: la stessa copertina, sfocata e scurita, per riempire tutto lo schermo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/copertina-720.webp" alt="" aria-hidden="true"
        className="casa-sfondo hidden absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-70" />
      <div aria-hidden="true" className="casa-sfondo hidden absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(27,15,46,0.15),rgba(27,15,46,0.85))]" />
      <h1 ref={titoloRef} tabIndex={-1} className="casa-arte relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/copertina.webp"
          srcSet="/copertina-720.webp 720w, /copertina.webp 1254w"
          sizes="(min-width: 768px) 100vh, 100vw"
          width={1254} height={1254}
          alt={T.titolo}
          className="copertina block w-full h-auto max-h-[46dvh] object-cover object-top"
        />
      </h1>
      <div className="casa-menu relative flex flex-col gap-4 -mt-2">
        <Pulsante variante="giallo" className="pulsa w-full fumetto !text-[2.5rem] !min-h-[6.5rem] tracking-wide" onClick={onGioca}>
          <span aria-hidden="true">▶</span> {T.gioca}
        </Pulsante>
      </div>
    </section>
  );
}

function Opzione({ attiva, onClick, children }: { attiva: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Pulsante variante={attiva ? "scelto" : "bianco"} className="w-full" aria-pressed={attiva} onClick={onClick}>
      {attiva && <span aria-hidden="true">✓</span>} {children}
    </Pulsante>
  );
}

function SchermataImpostazioni({ titoloRef, imp, cambia, haVoce, fine }: {
  titoloRef: RefTitolo; imp: Impostazioni; cambia: (p: Partial<Impostazioni>) => void; haVoce: boolean; fine: () => void;
}) {
  const passi = [
    {
      titolo: T.grandezzaTesto, spiegazione: T.grandezzaSpiegazione,
      opzioni: (["normale", "grande", "moltoGrande"] as const).map((g) => ({ testo: T.grandezze[g], attiva: imp.testo === g, fai: () => cambia({ testo: g }) })),
    },
    {
      titolo: T.dueTocchi, spiegazione: T.dueTocchiSpiegazione,
      opzioni: [{ testo: T.si, attiva: imp.dueTocchi, fai: () => cambia({ dueTocchi: true }) }, { testo: T.no, attiva: !imp.dueTocchi, fai: () => cambia({ dueTocchi: false }) }],
    },
    ...(haVoce ? [{
      titolo: T.leggiSempre, spiegazione: T.leggiSempreSpiegazione,
      opzioni: [{ testo: T.si, attiva: imp.leggiSempre, fai: () => cambia({ leggiSempre: true }) }, { testo: T.no, attiva: !imp.leggiSempre, fai: () => cambia({ leggiSempre: false }) }],
    }] : []),
    {
      titolo: T.movimenti, spiegazione: T.movimentiSpiegazione,
      opzioni: ([["telefono", T.movimentiTelefono], ["completi", T.movimentiCompleti], ["ridotti", T.movimentiRidotti]] as const).map(([v, t]) => ({
        testo: t, attiva: imp.movimenti === v, fai: () => cambia({ movimenti: v }),
      })),
    },
    {
      titolo: T.suoni, spiegazione: T.suoniSpiegazione,
      opzioni: [{ testo: T.si, attiva: imp.suoni, fai: () => cambia({ suoni: true }) }, { testo: T.no, attiva: !imp.suoni, fai: () => cambia({ suoni: false }) }],
    },
    {
      titolo: T.musica, spiegazione: T.musicaSpiegazione,
      opzioni: [{ testo: T.si, attiva: imp.musica, fai: () => cambia({ musica: true }) }, { testo: T.no, attiva: !imp.musica, fai: () => cambia({ musica: false }) }],
    },
  ];
  const [n, setN] = useState(0);
  const passo = passi[n];
  return (
    <section className="pt-6 flex flex-col gap-5">
      <p className="testo-piccolo">{T.impostazioniTitolo} · {T.passo(n + 1, passi.length)}</p>
      <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo">{passo.titolo}</h1>
      <p>{passo.spiegazione}</p>
      {!haVoce && n === 1 && <p className="testo-piccolo">{T.nessunaVoce}</p>}
      <div className="flex flex-col gap-4">
        {passo.opzioni.map((o) => <Opzione key={o.testo} attiva={o.attiva} onClick={o.fai}>{o.testo}</Opzione>)}
      </div>
      <Pulsante variante="giallo" className="w-full mt-2" onClick={() => (n < passi.length - 1 ? setN(n + 1) : fine())}>
        {n < passi.length - 1 ? `${T.avanti} →` : T.fatto}
      </Pulsante>
    </section>
  );
}

function Hud({ p, me, lui }: { p: Partita; me: Personaggio; lui: Personaggio }) {
  const barra = (nome: string, energia: number, destra: boolean) => (
    <div className={`flex-1 min-w-0 ${destra ? "text-right" : ""}`}>
      <p className="testo-piccolo font-bold leading-tight truncate">{nome}</p>
      <div className="h-7 border-[3px] border-black rounded-lg bg-[#3a2a4a] overflow-hidden relative" role="meter"
        aria-valuemin={0} aria-valuemax={ENERGIA_INIZIALE} aria-valuenow={energia} aria-label={`${T.energia} ${nome}`}>
        <div className="h-full bg-[var(--giallo)] transition-[width] duration-700 ease-out absolute top-0"
          style={{ width: `${energia}%`, [destra ? "right" : "left"]: 0 }} />
      </div>
      <p className="testo-piccolo">{T.energia}: <strong>{energia}</strong></p>
    </div>
  );
  return (
    <div className="flex gap-4 items-start pt-3">
      {barra(me.nome, p.giocatore.energia, false)}
      {barra(lui.nome, p.computer.energia, true)}
    </div>
  );
}

function SchermataLotta({ titoloRef, p, me, lui, imp, haVoce, conTempo, onScaduto, luogo, scegli, conferma, memorizzato, avantiEsito, avantiComputer, avantiSpareggio }: {
  titoloRef: RefTitolo; p: Partita; me: Personaggio; lui: Personaggio; imp: Impostazioni; haVoce: boolean;
  conTempo: boolean; onScaduto: () => void; luogo: Luogo;
  scegli: (i: number) => void; conferma: () => void; memorizzato: () => void;
  avantiEsito: () => void; avantiComputer: () => void; avantiSpareggio: () => void;
}) {
  const confermaRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (p.scelta !== null && p.fase === "domanda") confermaRef.current?.scrollIntoView({ block: "nearest" });
  }, [p.scelta, p.fase]);
  // Conto alla rovescia, solo nella modalità "Con il tempo"
  const [rimasti, setRimasti] = useState(SECONDI_PER_RISPOSTA);
  const scadutoRef = useRef(onScaduto);
  useEffect(() => { scadutoRef.current = onScaduto; });
  useEffect(() => {
    if (!conTempo || p.fase !== "domanda") return;
    const fine = Date.now() + SECONDI_PER_RISPOSTA * 1000;
    const t = setInterval(() => {
      const r = Math.max(0, Math.ceil((fine - Date.now()) / 1000));
      setRimasti(r);
      if (r === 0) { clearInterval(t); scadutoRef.current(); }
    }, 250);
    return () => { clearInterval(t); setRimasti(SECONDI_PER_RISPOSTA); };
  }, [conTempo, p.fase, p.numero]);
  const d = p.domanda;
  const ko = p.computer.energia === 0 ? "computer" : p.giocatore.energia === 0 ? "giocatore" : null;
  const totale = DOMANDE_PER_GIOCATORE + (p.spareggio ? 1 : 0);
  const inDomanda = p.fase === "domanda" || p.fase === "stimolo";

  return (
    <section className="flex flex-col gap-4">
      <Hud p={p} me={me} lui={lui} />
      <Arena luogo={luogo} giocatore={me} computer={lui} azione={p.azione}
        ko={p.fase === "esito" || p.fase === "computer" ? ko : null}
        className={`rounded-2xl border-[3px] border-black ${inDomanda ? "h-[9rem] sm:h-[15rem]" : "h-[15rem] sm:h-[22rem]"}`} />
      <div className="flex justify-between testo-piccolo font-bold">
        <span>{p.numero > DOMANDE_PER_GIOCATORE ? T.spareggio : T.domandaNumero(p.numero, totale)}</span>
        <span>{T.punti}: {p.giocatore.punti}</span>
      </div>

      {p.fase === "stimolo" && (
        <div className="flex flex-col gap-4">
          <h1 ref={titoloRef} tabIndex={-1} className="testo-piccolo font-bold">{T.memorizza}</h1>
          <div className="pannello p-5 testo-domanda">{d.stimolo}</div>
          {haVoce && <Pulsante className="w-full" onClick={() => leggi(d.stimolo ?? "")}><span aria-hidden="true">🔊</span> {T.ascolta}</Pulsante>}
          <Pulsante variante="giallo" className="w-full" onClick={memorizzato}>{T.hoMemorizzato}</Pulsante>
        </div>
      )}

      {p.fase === "domanda" && (
        <div className="flex flex-col gap-4">
          {conTempo && (
            <div role="timer" aria-live="off">
              <p className="testo-piccolo font-bold"><span aria-hidden="true">⏱</span> {T.tempoRimasto(rimasti)}</p>
              <div className="h-5 border-[3px] border-black rounded-lg bg-[#3a2a4a] overflow-hidden">
                <div className="h-full bg-white transition-[width] duration-300 ease-linear" style={{ width: `${(rimasti / SECONDI_PER_RISPOSTA) * 100}%` }} />
              </div>
            </div>
          )}
          <h1 ref={titoloRef} tabIndex={-1} className="pannello p-5 testo-domanda">{d.domanda}</h1>
          {haVoce && (
            <Pulsante className="w-full" onClick={() => leggi(testoDaLeggere(d))}><span aria-hidden="true">🔊</span> {T.ascolta}</Pulsante>
          )}
          <div className={`grid gap-4 ${d.risposte.length === 4 ? "sm:grid-cols-2" : ""}`} role="group" aria-label={T.risposte}>
            {d.risposte.map((r, i) => (
              <Pulsante key={`${d.id}-${i}`} variante={p.scelta === i ? "scelto" : "bianco"} className="w-full testo-risposta !justify-start text-left"
                aria-pressed={imp.dueTocchi ? p.scelta === i : undefined} onClick={() => scegli(i)}>
                <span aria-hidden="true" className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-full border-[3px] border-current">
                  {p.scelta === i ? "✓" : ""}
                </span>
                <span>{r}</span>
                {p.scelta === i && <span className="ml-auto testo-piccolo">{T.sceltaFatta}</span>}
              </Pulsante>
            ))}
          </div>
          {imp.dueTocchi && (
            <Pulsante ref={confermaRef} variante="giallo" className="w-full" disabled={p.scelta === null} onClick={conferma}>
              {T.conferma} <span aria-hidden="true">→</span>
            </Pulsante>
          )}
        </div>
      )}

      {p.fase === "esito" && p.esito && (
        <div className="flex flex-col gap-4" aria-live="polite">
          <div className={`pannello !text-white p-4 flex items-center gap-3 ${p.esito.giusta ? "!bg-[var(--verde-giusto)]" : "!bg-[var(--rosso-sbaglio)]"}`}>
            <span aria-hidden="true" className="text-[2.5rem] leading-none">{p.esito.giusta ? "✓" : p.scaduto ? "⏱" : "✗"}</span>
            <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo">{p.esito.giusta ? T.giusto : p.scaduto ? T.tempoScaduto : T.sbagliato}</h1>
          </div>
          <div className="pannello p-5 flex flex-col gap-3">
            {p.esito.giusta ? (
              <>
                <p className="font-bold">{T.colpisce(me.nome, p.esito.speciale ? specialeDi(me, p.giocatore.giuste).nome : me.mosse[(p.giocatore.giuste - 1) % 2].nome)}</p>
                {p.esito.speciale && <p className="font-bold">★ {T.serieSpeciale}</p>}
                <p className="text-[1.75rem] font-bold">{T.puntiGuadagnati(p.esito.punti)}</p>
                {p.esito.bonus && <p className="font-bold">⚡ {T.bonusVelocita(p.esito.bonus.nome, p.esito.bonus.punti)}</p>}
              </>
            ) : (
              <>
                <p>{p.scaduto ? T.colpitoPerTempo(lui.nome, lui.mosse[p.computer.giuste % 2].nome) : T.manca(me.nome)}</p>
                <p>{T.rispostaGiusta} <strong className="text-[1.5rem]">✓ {d.risposte[d.corretta]}</strong></p>
                <p className="font-bold">{T.incoraggia[p.numero % T.incoraggia.length]}</p>
              </>
            )}
            <div className="border-t-4 border-dashed border-black/30 pt-3">
              <p className="font-bold">{T.loSapevi}</p>
              <p>{d.spiegazione}</p>
            </div>
          </div>
          <Pulsante variante="giallo" className="w-full" onClick={avantiEsito}>{T.avanti} <span aria-hidden="true">→</span></Pulsante>
        </div>
      )}

      {p.fase === "computer" && p.esitoComputer && (
        <div className="flex flex-col gap-4" aria-live="polite">
          <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo">{T.turnoComputer(lui.nome)}</h1>
          <div className="pannello p-5 flex items-center gap-4">
            <span aria-hidden="true" className="text-[2.5rem] leading-none">{p.esitoComputer.giusta ? "✓" : "✗"}</span>
            <p className="font-bold text-[1.5rem]">
              {p.esitoComputer.giusta
                ? T.computerGiusto(lui.nome, p.esitoComputer.speciale ? specialeDi(lui, p.computer.giuste).nome : lui.mosse[(p.computer.giuste - 1) % 2].nome)
                : T.computerSbagliato(lui.nome)}
            </p>
          </div>
          <Pulsante variante="giallo" className="w-full" onClick={avantiComputer}>{T.avanti} <span aria-hidden="true">→</span></Pulsante>
        </div>
      )}

      {p.fase === "spareggio" && (
        <div className="flex flex-col gap-4">
          <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo fumetto text-[var(--giallo)]">{T.spareggio}</h1>
          <p className="pannello p-5">{T.spareggioSpiegazione}</p>
          <Pulsante variante="giallo" className="w-full" onClick={avantiSpareggio}>{T.avanti} <span aria-hidden="true">→</span></Pulsante>
        </div>
      )}
    </section>
  );
}

function SchermataFine({ titoloRef, p, me, lui, sessione, livello, luogo, turno, avanti, riprova }: {
  titoloRef: RefTitolo; p: Partita; me: Personaggio; lui: Personaggio; sessione: Sessione | null; livello: Livello;
  luogo: Luogo; turno: number; avanti: () => void; riprova: () => void;
}) {
  const v = vincitore(p.giocatore, p.computer);
  const risultato: Risultato = v === "giocatore" ? "vinto" : v === "computer" ? "perso" : "pari";
  const titolo = risultato === "vinto" ? T.titoloVinto : risultato === "perso" ? T.titoloPerso : T.titoloPari;
  const seme = p.giocatore.punti + p.computer.energia + p.numero;
  const sottotitolo = scegliSottotitolo(risultato, risultato === "perso" ? lui.nome : me.nome, risultato === "perso" ? me.nome : lui.nome, seme);
  const [salvataggio, setSalvataggio] = useState<"no" | "ok" | "errore">("no");
  const salvato = useRef(false);
  useEffect(() => {
    if (!sessione || salvato.current) return;
    salvato.current = true;
    salvaPartita(sessione.token, { punti: p.giocatore.punti, vinta: risultato === "vinto", personaggio: me.id, avversario: lui.id, livello })
      .then((r) => setSalvataggio(r?.ok ? "ok" : "errore"))
      .catch(() => setSalvataggio("errore"));
  }, [sessione, p, me, lui, livello, risultato]);
  return (
    <section className="flex flex-col gap-5 pt-4">
      <Festa me={me} lui={lui} risultato={risultato} seme={seme} luogo={luogo} className="rounded-2xl border-[3px] border-black h-[17rem] sm:h-[26rem]" />
      <div className="text-center">
        <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo text-[var(--giallo)]">{titolo}</h1>
        <p className="text-[1.5rem] font-bold mt-1">{sottotitolo}</p>
      </div>
      <div className="pannello p-5 flex flex-col gap-2">
        <p className="font-bold">{T.stretta}</p>
        <p className="text-[1.75rem] font-bold">★ {T.tuoiPunti(p.giocatore.punti)}</p>
        <p>{T.risposteGiuste(p.giocatore.giuste)}</p>
        {!sessione && <p className="font-bold">{T.puntiNonSalvatiProva}</p>}
        {sessione && salvataggio === "ok" && <p className="font-bold">✓ {T.puntiSalvati}</p>}
        {sessione && salvataggio === "errore" && <p className="font-bold">⚠ {T.puntiNonSalvatiRete}</p>}
      </div>
      {risultato === "vinto" ? (
        <>
          {turno < 3 && <p className="text-center text-[1.5rem] font-bold">{T.passiAl(T.turni[turno + 1])}</p>}
          <Pulsante variante="giallo" className="w-full fumetto !text-[1.5rem]" onClick={avanti}>
            {turno < 3 ? T.prossimaSfida(T.turni[turno + 1]) : <><span aria-hidden="true">🏆</span> {T.ritiraCoppa}</>}
          </Pulsante>
        </>
      ) : (
        <Pulsante variante="giallo" className="w-full" onClick={riprova}>{T.riprovaSfida}</Pulsante>
      )}
    </section>
  );
}

function SchermataCampione({ titoloRef, me, battuti, sessione, livello, nuovo }: {
  titoloRef: RefTitolo; me: Personaggio; battuti: Personaggio[]; sessione: Sessione | null; livello: Livello; nuovo: () => void;
}) {
  const [coppe, setCoppe] = useState<number | null>(null);
  const [errore, setErrore] = useState(false);
  const registrata = useRef(false);
  useEffect(() => {
    if (!sessione || registrata.current) return;
    registrata.current = true;
    vinciCoppa(sessione.token, livello, me.id)
      .then((r) => (r?.ok ? setCoppe(r.coppe ?? 1) : setErrore(true)))
      .catch(() => setErrore(true));
  }, [sessione, livello, me]);
  return (
    <section className="flex flex-col gap-5 pt-4">
      <FestaCoppa me={me} battuti={battuti} className="rounded-2xl border-[3px] border-black h-[19rem] sm:h-[28rem]" />
      <div className="text-center">
        <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo text-[var(--giallo)]">🏆 {T.campioneTitolo}</h1>
        <p className="text-[1.5rem] font-bold mt-1">{T.campioneSottotitolo(me.nome)}</p>
      </div>
      <div className="pannello p-5 font-bold">
        {!sessione && <p>{T.coppaInProva}</p>}
        {sessione && coppe !== null && <p>✓ {T.coppaRegistrata(coppe)}</p>}
        {sessione && errore && <p>⚠ {T.coppaNonSalvata}</p>}
      </div>
      <Pulsante variante="giallo" className="w-full" onClick={nuovo}>{T.nuovoTorneo}</Pulsante>
    </section>
  );
}
