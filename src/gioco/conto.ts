/**
 * Giocatori, partite e classifica sul database (Supabase).
 * Il browser chiama solo funzioni del database: il codice segreto viene trasformato in hash
 * dentro il database e non torna mai indietro. Nel telefono resta solo un "gettone" di sessione.
 * La chiave qui sotto è quella pubblicabile di Supabase: è fatta per stare nel browser
 * e non dà accesso alle tabelle.
 */
const URL_DB = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ojsgbtnsyaifkeohtfay.supabase.co";
const CHIAVE_PUBBLICA = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_AJULpu8YrPPdpUzlhInsdg_6iSYKYxa";

export class SenzaRete extends Error {}

async function rpc<T>(funzione: string, dati: Record<string, unknown>): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`${URL_DB}/rest/v1/rpc/${funzione}`, {
      method: "POST",
      headers: { apikey: CHIAVE_PUBBLICA, "Content-Type": "application/json" },
      body: JSON.stringify(dati),
    });
  } catch {
    throw new SenzaRete();
  }
  if (!r.ok) throw new SenzaRete();
  const testo = await r.text();
  return (testo ? JSON.parse(testo) : null) as T;
}

export type Esito =
  | { nome: string; token: string; errore?: undefined }
  | { errore: "nome_non_valido" | "codice_non_valido" | "nome_sconosciuto" | "non_collegato" }
  | { errore: "nome_preso"; proposta: string | null }
  | { errore: "codice_sbagliato"; rimasti: number }
  | { errore: "pausa"; minuti: number };

export const registra = (nome: string, pin: string) => rpc<Esito>("registra", { p_nome: nome, p_pin: pin });
export const accedi = (nome: string, pin: string) => rpc<Esito>("accedi", { p_nome: nome, p_pin: pin });
export const chiSono = (token: string) => rpc<{ nome: string } | null>("chi_sono", { p_token: token });
export const esciDalDb = (token: string) => rpc<null>("esci", { p_token: token });
export const salvaPartita = (token: string, p: { punti: number; vinta: boolean; personaggio: string; avversario: string; livello: number }) =>
  rpc<{ ok?: boolean; errore?: string }>("salva_partita", {
    p_token: token, p_punti: p.punti, p_vinta: p.vinta, p_personaggio: p.personaggio, p_avversario: p.avversario, p_livello: p.livello,
  });
export interface RigaClassifica { nome: string; punti: number; vittorie: number; partite: number; coppe: number }
export const classifica = (periodo: "settimana" | "sempre") => rpc<RigaClassifica[]>("classifica", { p_periodo: periodo });
export interface Profilo { nome: string; punti: number; vittorie: number; partite: number; giorni: number; coppe: number }
export const vinciCoppa = (token: string, livello: number, personaggio: string) =>
  rpc<{ ok?: boolean; coppe?: number; errore?: string }>("vinci_coppa", { p_token: token, p_livello: livello, p_personaggio: personaggio });
export const ilMioProfilo = (token: string) => rpc<Profilo | null>("il_mio_profilo", { p_token: token });

// ---------- Sul dispositivo ----------
export interface Sessione { nome: string; token: string }
const CHIAVE_SESSIONE = "street-fraga-sessione";
const CHIAVE_NOMI = "street-fraga-nomi";

export function sessioneSalvata(): Sessione | null {
  try {
    const s = localStorage.getItem(CHIAVE_SESSIONE) ?? sessionStorage.getItem(CHIAVE_SESSIONE);
    return s ? (JSON.parse(s) as Sessione) : null;
  } catch { return null; }
}

/** "Resta collegato" attivo: la sessione resta anche chiudendo il browser. */
export function salvaSessione(s: Sessione, restaCollegato: boolean) {
  try {
    (restaCollegato ? localStorage : sessionStorage).setItem(CHIAVE_SESSIONE, JSON.stringify(s));
    const nomi = nomiDelDispositivo().filter((n) => n.toLowerCase() !== s.nome.toLowerCase());
    localStorage.setItem(CHIAVE_NOMI, JSON.stringify([s.nome, ...nomi].slice(0, 8)));
  } catch {}
}

export function dimenticaSessione() {
  try { localStorage.removeItem(CHIAVE_SESSIONE); sessionStorage.removeItem(CHIAVE_SESSIONE); } catch {}
}

export function nomiDelDispositivo(): string[] {
  try { return JSON.parse(localStorage.getItem(CHIAVE_NOMI) ?? "[]") as string[]; } catch { return []; }
}

/** Stesse regole del database: da 2 a 20 lettere, spazi e apostrofi ammessi. */
export function nomeValido(n: string): boolean {
  const t = n.trim().replace(/\s+/g, " ");
  return /^\p{L}[\p{L} ']*$/u.test(t) && t.replace(/[ ']/g, "").length >= 2 && t.replace(/[ ']/g, "").length <= 20;
}

// ---------- Vocabolario del dialetto raccolto dai giocatori ----------
// Nessuna parola è accettata subito: ogni risposta è un voto. Una parola è "confermata"
// quando almeno 5 persone dicono che è giusta e i sì sono almeno il triplo dei no.
const CHIAVE_DA_INVIARE = "street-fraga-parole-da-inviare";
const CHIAVE_CHIESTE = "street-fraga-parole-chieste";

export interface Proposta { dialetto: string; si: number; no: number; confermata: boolean }
export const propostaParola = (italiano: string) => rpc<Proposta | null>("proposta_parola", { p_italiano: italiano });
export const paroleDaConfermare = () => rpc<string[]>("parole_da_confermare", {});

/** Registra un voto (o una parola nuova); se manca la rete lo tiene nel telefono e lo rimanda alla prossima occasione. */
export async function votaParola(token: string | null, italiano: string, dialetto: string, giusto: boolean): Promise<{ ok: boolean; proposta?: Proposta | null }> {
  type Voto = { italiano: string; dialetto: string; giusto: boolean };
  let coda: Voto[] = [];
  try { coda = JSON.parse(localStorage.getItem(CHIAVE_DA_INVIARE) ?? "[]"); } catch {}
  coda.push({ italiano, dialetto, giusto });
  const rimaste: Voto[] = [];
  let proposta: Proposta | null | undefined;
  for (const v of coda) {
    try {
      const r = await rpc<{ ok?: boolean; proposta?: Proposta | null }>("vota_parola", {
        p_token: token, p_italiano: v.italiano, p_dialetto: v.dialetto, p_giusto: v.giusto ?? true,
      });
      if (r?.ok && v.italiano === italiano) proposta = r.proposta;
    } catch {
      rimaste.push(v);
    }
  }
  try { localStorage.setItem(CHIAVE_DA_INVIARE, JSON.stringify(rimaste)); } catch {}
  return { ok: rimaste.length === 0, proposta };
}

/**
 * Sceglie una parola da chiedere, diversa da quelle già chieste su questo dispositivo.
 * Più spesso (6 volte su 10) una parola che ha già una proposta da confermare.
 */
export function parolaDaChiedere(elenco: string[], daConfermare: string[], casuale: () => number): string {
  let chieste: string[] = [];
  try { chieste = JSON.parse(localStorage.getItem(CHIAVE_CHIESTE) ?? "[]"); } catch {}
  let libere = elenco.filter((p) => !chieste.includes(p));
  if (libere.length === 0) { chieste = []; libere = elenco; }
  const conProposta = libere.filter((p) => daConfermare.includes(p));
  const fra = conProposta.length > 0 && casuale() < 0.6 ? conProposta : libere;
  const scelta = fra[Math.floor(casuale() * fra.length)];
  try { localStorage.setItem(CHIAVE_CHIESTE, JSON.stringify([...chieste, scelta])); } catch {}
  return scelta;
}

// ---------- Pagina di gestione ----------
export type Riga = Record<string, string | number | boolean | null>;
export interface Pannello {
  errore?: "password_sbagliata" | "pausa" | "password_non_impostata";
  minuti?: number;
  riepilogo?: Record<string, number>;
  giocatori?: Riga[]; classifica?: Riga[]; classifica_settimana?: Riga[];
  per_giorno?: Riga[]; ultime_partite?: Riga[]; parole?: Riga[];
}
/** Tutti i dati per il gestore, protetti da password (controllata dal database). */
export const pannelloGestione = (password: string) => rpc<Pannello>("pannello_gestione", { p_password: password });
