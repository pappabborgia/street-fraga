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
const CHIAVE_DA_INVIARE = "street-fraga-parole-da-inviare";
const CHIAVE_CHIESTE = "street-fraga-parole-chieste";

/** Salva una parola; se manca la rete la tiene nel telefono e la rimanda alla prossima occasione. */
export async function proponiParola(token: string | null, italiano: string, dialetto: string): Promise<{ ok: boolean; raccolte?: number }> {
  let coda: { italiano: string; dialetto: string }[] = [];
  try { coda = JSON.parse(localStorage.getItem(CHIAVE_DA_INVIARE) ?? "[]"); } catch {}
  coda.push({ italiano, dialetto });
  const rimaste: typeof coda = [];
  let raccolte: number | undefined;
  for (const p of coda) {
    try {
      const r = await rpc<{ ok?: boolean; raccolte?: number }>("proponi_parola", { p_token: token, p_italiano: p.italiano, p_dialetto: p.dialetto });
      if (r?.ok) raccolte = r.raccolte;
    } catch {
      rimaste.push(p);
    }
  }
  try { localStorage.setItem(CHIAVE_DA_INVIARE, JSON.stringify(rimaste)); } catch {}
  return { ok: rimaste.length === 0, raccolte };
}

/** Sceglie una parola da chiedere, diversa da quelle già chieste su questo dispositivo. */
export function parolaDaChiedere(elenco: string[], casuale: () => number): string {
  let chieste: string[] = [];
  try { chieste = JSON.parse(localStorage.getItem(CHIAVE_CHIESTE) ?? "[]"); } catch {}
  let libere = elenco.filter((p) => !chieste.includes(p));
  if (libere.length === 0) { chieste = []; libere = elenco; }
  const scelta = libere[Math.floor(casuale() * libere.length)];
  try { localStorage.setItem(CHIAVE_CHIESTE, JSON.stringify([...chieste, scelta])); } catch {}
  return scelta;
}
