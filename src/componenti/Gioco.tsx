"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { T } from "@/testi";
import { audio } from "@/gioco/audio";
import { leggi, voceItaliana, zitto } from "@/gioco/voce";
import { type Impostazioni, PREDEFINITE, SCALA, carica, salva } from "@/gioco/impostazioni";
import { PERSONAGGI, type Personaggio, specialeDi, trovaPersonaggio } from "@/gioco/personaggi";
import { MAZZO } from "@/gioco/domande";
import { creaRng, scegli } from "@/gioco/rng";
import type { Domanda, Livello } from "@/gioco/tipi";
import {
  BRAVURA_COMPUTER, DOMANDE_PER_GIOCATORE, SECONDI_PER_RISPOSTA, colpoPerTempo, ENERGIA_INIZIALE, type Combattente, type EsitoColpo,
  adattaLivello, applicaRisposta, nuovoCombattente, partitaFinita, prossimaDomanda, vincitore,
} from "@/gioco/regole";
import { Arena, MOMENTO_COLPO, type Azione } from "./Arena";
import { Lottatore, Ritratto } from "./Lottatore";
import { SvgOggetto } from "./Oggetti";
import { BarraFissa, Pulsante } from "./ui";
import { Chiesa } from "./Chiesa";
import { Festa, scegliSottotitolo, type Risultato } from "./Festa";

type Schermata = "casa" | "regole" | "impostazioni" | "livello" | "tempo" | "scelta" | "dettaglio" | "presentazione" | "lotta" | "fine" | "esci";
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
  const [avversarioId, setAvversarioId] = useState<string>(PERSONAGGI[1].id);
  const [partita, setPartita] = useState<Partita | null>(null);
  const [haVoce, setHaVoce] = useState(false);
  const rng = useRef(creaRng(1));
  const contatore = useRef(1);
  const titoloRef = useRef<HTMLHeadingElement>(null);

  // Impostazioni salvate sul dispositivo; seme casuale scelto nel browser
  useEffect(() => {
    // letto dopo il primo disegno: sul server localStorage non esiste
    setImp(carica()); // eslint-disable-line react-hooks/set-state-in-effect
    rng.current = creaRng(Math.floor(Math.random() * 2 ** 31));
  }, []);
  useEffect(() => {
    document.documentElement.style.setProperty("--scala-testo", SCALA[imp.testo]);
    audio.suoniAttivi = imp.suoni;
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
  const brano = schermata === "lotta" || schermata === "fine" || schermata === "esci" ? "lotta" : "menu";
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

  const nuovaDomanda = useCallback((p: Omit<Partita, "domanda" | "fase" | "scelta">, prima: boolean): Partita => {
    const d = prossimaDomanda(rng.current, MAZZO, new Set(p.usate), p.livello, prima);
    return { ...p, domanda: d, usate: [...p.usate, d.id], fase: d.stimolo ? "stimolo" : "domanda", scelta: null };
  }, []);

  const iniziaPartita = () => {
    const base = {
      giocatore: nuovoCombattente(), computer: nuovoCombattente(), livello: 1 as Livello,
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
    const r = applicaRisposta(partita.giocatore, partita.computer, giusta);
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
      livello: adattaLivello(partita.livello, giusteDiFila, sbagliateDiFila),
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
    const r = applicaRisposta(partita.giocatore, partita.computer, false);
    const sbagliateDiFila = partita.sbagliateDiFila + 1;
    audio.sbagliato();
    const stile = stileMossa(lui, partita.computer);
    audio.colpo(MOMENTO_COLPO[stile.stile]);
    setPartita({
      ...partita,
      giocatore: colpoPerTempo(r.attaccante),
      giusteDiFila: 0, sbagliateDiFila,
      livello: adattaLivello(partita.livello, 0, sbagliateDiFila),
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
    const r = applicaRisposta(partita.computer, partita.giocatore, giusta);
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

  // ---------------- Disegno ----------------
  return (
    <div onPointerDownCapture={primoTocco} className="min-h-dvh flex flex-col">
      <BarraFissa onIndietro={indietro} onCasa={casa} musica={imp.musica && audio.pronto} />
      <main className="flex-1 w-full mx-auto max-w-5xl px-4 pb-10">
        {schermata === "casa" && (
          <SchermataCasa titoloRef={titoloRef} onGioca={() => vai("livello")} onRegole={() => vai("regole")} onImpostazioni={() => vai("impostazioni")} />
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
              <div className="arena rounded-2xl border-4 border-black h-[17rem] sm:h-auto sm:min-h-[22rem]">
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
              const altri = PERSONAGGI.filter((p) => p.id !== mioId);
              setAvversarioId(scegli(rng.current, altri).id);
              vai("presentazione");
            }}>
              {T.sceglieQuesto(me.nome)}
            </Pulsante>
          </section>
        )}
        {schermata === "presentazione" && (
          <section className="pt-6 flex flex-col gap-5">
            <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo text-center">
              {me.nome} <span className="fumetto text-[var(--giallo)] block my-1">{T.contro}</span> {lui.nome}
            </h1>
            <Arena giocatore={me} computer={lui} className="rounded-2xl border-4 border-black h-[15rem] sm:h-[22rem]" />
            <p className="text-center">{T.arena} · {T.livelli[livelloScelto]} · {conTempo ? T.conTempo : T.senzaTempo}</p>
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
            conTempo={conTempo} onScaduto={tempoScaduto}
            scegli={(i) => (imp.dueTocchi ? setPartita({ ...partita, scelta: i }) : rispondi(i))}
            conferma={() => partita.scelta !== null && rispondi(partita.scelta)}
            memorizzato={() => setPartita({ ...partita, fase: "domanda" })}
            avantiEsito={turnoComputer}
            avantiComputer={dopoComputer}
            avantiSpareggio={dopoSpareggio}
          />
        )}
        {schermata === "fine" && partita && (
          <SchermataFine titoloRef={titoloRef} p={partita} me={me} lui={lui} ancora={() => {
            const altri = PERSONAGGI.filter((x) => x.id !== mioId);
            setAvversarioId(scegli(rng.current, altri).id);
            setStoria(["casa", "presentazione"]);
          }} />
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

function SchermataCasa({ titoloRef, onGioca, onRegole, onImpostazioni }: { titoloRef: RefTitolo; onGioca: () => void; onRegole: () => void; onImpostazioni: () => void }) {
  return (
    <section className="pt-4 grid gap-5 md:grid-cols-2 md:items-center">
      <h1 ref={titoloRef} tabIndex={-1} className="w-full max-w-[32rem] mx-auto">
        {/* Copertina fornita dal gestore del gioco */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/copertina.webp"
          srcSet="/copertina-720.webp 720w, /copertina.webp 1254w"
          sizes="(min-width: 768px) 32rem, 100vw"
          width={1254} height={1254}
          alt={T.titolo}
          className="w-full h-auto rounded-2xl border-4 border-black shadow-[0_6px_0_#000]"
        />
      </h1>
      <div className="flex flex-col gap-4">
        <p className="text-center text-[1.5rem] font-bold">{T.sottotitolo}</p>
        <Pulsante variante="giallo" className="w-full fumetto !text-[1.75rem]" onClick={onGioca}>{T.gioca}</Pulsante>
        <Pulsante className="w-full" onClick={onRegole}>{T.comeSiGioca}</Pulsante>
        <Pulsante className="w-full" onClick={onImpostazioni}>{T.impostazioni}</Pulsante>
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
      <div className="h-7 border-4 border-black rounded-lg bg-[#3a2a4a] overflow-hidden relative" role="meter"
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

function SchermataLotta({ titoloRef, p, me, lui, imp, haVoce, conTempo, onScaduto, scegli, conferma, memorizzato, avantiEsito, avantiComputer, avantiSpareggio }: {
  titoloRef: RefTitolo; p: Partita; me: Personaggio; lui: Personaggio; imp: Impostazioni; haVoce: boolean;
  conTempo: boolean; onScaduto: () => void;
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
      <Arena giocatore={me} computer={lui} azione={p.azione}
        ko={p.fase === "esito" || p.fase === "computer" ? ko : null}
        className={`rounded-2xl border-4 border-black ${inDomanda ? "h-[9rem] sm:h-[15rem]" : "h-[15rem] sm:h-[22rem]"}`} />
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
              <div className="h-5 border-4 border-black rounded-lg bg-[#3a2a4a] overflow-hidden">
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
                <span aria-hidden="true" className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-full border-4 border-current">
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

function SchermataFine({ titoloRef, p, me, lui, ancora }: { titoloRef: RefTitolo; p: Partita; me: Personaggio; lui: Personaggio; ancora: () => void }) {
  const v = vincitore(p.giocatore, p.computer);
  const risultato: Risultato = v === "giocatore" ? "vinto" : v === "computer" ? "perso" : "pari";
  const titolo = risultato === "vinto" ? T.titoloVinto : risultato === "perso" ? T.titoloPerso : T.titoloPari;
  const seme = p.giocatore.punti + p.computer.energia + p.numero;
  const sottotitolo = scegliSottotitolo(risultato, risultato === "perso" ? lui.nome : me.nome, risultato === "perso" ? me.nome : lui.nome, seme);
  return (
    <section className="flex flex-col gap-5 pt-4">
      <Festa me={me} lui={lui} risultato={risultato} seme={seme} className="rounded-2xl border-4 border-black h-[17rem] sm:h-[26rem]" />
      <div className="text-center">
        <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo text-[var(--giallo)]">{titolo}</h1>
        <p className="text-[1.5rem] font-bold mt-1">{sottotitolo}</p>
      </div>
      <div className="pannello p-5 flex flex-col gap-2">
        <p className="font-bold">{T.stretta}</p>
        <p className="text-[1.75rem] font-bold">★ {T.tuoiPunti(p.giocatore.punti)}</p>
        <p>{T.risposteGiuste(p.giocatore.giuste)}</p>
      </div>
      <Pulsante variante="giallo" className="w-full" onClick={ancora}>{T.giocaAncora}</Pulsante>
    </section>
  );
}
