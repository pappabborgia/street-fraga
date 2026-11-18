"""
Parole del dialetto salentino (variante del nord, parlata anche a Fragagnano) e domande "Che cosa vuol dire...?".
Fonte: voce "Dialetti salentini" di Wikipedia (esempi tratti da Ribezzo 1912, Rohlfs 1967 e raccolte di proverbi).
Le parole sono salentine: vanno confermate da qualcuno di Fragagnano.
Uso: python3 scripts/domande-dialetto.py
"""
import json, random, os
random.seed(11)
QUI = os.path.dirname(os.path.abspath(__file__))
FONTE = "https://it.wikipedia.org/wiki/Dialetti_salentini"
NOTA = "Parola salentina (variante del nord): da confermare con qualcuno di Fragagnano."

# parola, significato giusto, 2-3 sbagliati, livello, curiosità (spiegazione breve)
PAROLE = [
 ("cavaddu", "Cavallo", ["Cavolo", "Capello", "Cappello"], 1, "Nel nord del Salento la doppia L diventa DD: cavallo, cavaddu."),
 ("petra", "Pietra", ["Pera", "Pentola"], 1, "Petra è la pietra: con le pietre si fanno i muretti a secco!"),
 ("jaddu", "Gallo", ["Giallo", "Gatto"], 1, "Jaddu è il gallo che canta all'alba."),
 ("jattu", "Gatto", ["Gallo", "Gioco"], 1, "Jattu è il gatto: la G di gatto diventa J."),
 ("cranu", "Grano", ["Granchio", "Crudo"], 1, "Cranu è il grano: c'è anche sullo stemma del paese!"),
 ("purpu", "Polpo", ["Pulce", "Porco"], 1, "Purpu è il polpo, buonissimo bollito."),
 ("furnu", "Forno", ["Fumo", "Fiume"], 1, "Furnu è il forno: lì si cuociono pane e taralli."),
 ("puzzu", "Pozzo", ["Pozzanghera", "Pezzo"], 1, "Puzzu è il pozzo, come quello della Madonna del Favore."),
 ("fiuru", "Fiore", ["Fiume", "Fuoco"], 1, "Fiuru è il fiore: le parole maschili finiscono spesso in U."),
 ("pete", "Piede", ["Pentola", "Pane"], 1, "Pete è il piede."),
 ("sulu", "Solo", ["Sole", "Sale"], 1, "Sulu vuol dire solo, da solo."),
 ("ucca", "Bocca", ["Oca", "Buca"], 1, "Ucca è la bocca: «ucca te furnu» è chi mangia tanto!"),
 ("ciucciu", "Asino", ["Ciuccio", "Cucciolo"], 2, "Ciucciu è l'asino, compagno fedele dei contadini."),
 ("mieru", "Vino", ["Miele", "Mela"], 2, "Mieru è il vino, come il nostro Primitivo."),
 ("utte", "Botte", ["Uva", "Orto"], 2, "La utte è la botte dove riposa il vino."),
 ("càuci", "Calci", ["Calce", "Cuoco"], 2, "Càuci sono i calci: ce ne sono tanti in questo gioco!"),
 ("corpu", "Colpo", ["Corpo", "Corvo"], 2, "Corpu è il colpo: «nu corpu alla utte»."),
 ("fierru", "Ferro", ["Fieno", "Fiera"], 2, "«Batti lu fierru quannu è cautu»: batti il ferro finché è caldo."),
 ("cautu", "Caldo", ["Calzino", "Caduto"], 2, "Cautu vuol dire caldo, come le estati di Puglia."),
 ("capu", "Testa", ["Cappa", "Campo"], 2, "La capu è la testa, e in dialetto è femminile!"),
 ("cota", "Coda", ["Cotta", "Costa"], 2, "Cota è la coda: «la cuta è forte a scurciare»."),
 ("pilu", "Pelo", ["Pila", "Pillola"], 2, "Pilu è il pelo."),
 ("mile", "Mele", ["Miele", "Melone"], 2, "«Aggiu cattatu doi mile»: ho comprato delle mele."),
 ("cattare", "Comprare", ["Cantare", "Cacciare"], 2, "Cattare vuol dire comprare: si dice ancora al mercato."),
 ("mugghiere", "Moglie", ["Mugnaio", "Muggito"], 2, "Mugghiere è la moglie."),
 ("patrunu", "Padrone", ["Patrono", "Pattume"], 2, "Patrunu è il padrone: «ttacca lu ciucciu a ddonca ole lu patrunu»."),
 ("auceddu", "Uccello", ["Ucciso", "Aceto"], 2, "Auceddu è l'uccello che vola sugli ulivi."),
 ("tùrtura", "Tortora", ["Tortura", "Torta"], 3, "La tùrtura è la tortora, uccello delle campagne."),
 ("urmu", "Olmo", ["Uomo", "Urlo", "Orma"], 3, "Un tempo gli affari si chiudevano in piazza, sotto l'urmu."),
 ("tampagnu", "Coperchio", ["Tamburo", "Campagna", "Tappeto"], 3, "Tampagnu è il coperchio della botte."),
 ("cucchiarinu", "Cucchiaino", ["Cucchiaio grande", "Cuoco", "Coniglio"], 3, "Cucchiarinu è il cucchiaino del caffè."),
 ("meju", "Meglio", ["Mezzo", "Mio", "Meno"], 3, "Meju vuol dire meglio: «li meju fiuri», i fiori migliori."),
 ("signurìa", "Lei, per rispetto", ["Signora anziana", "Signoria del castello", "Sigaro"], 3, "Con «signurìa» si dà del lei alle persone di riguardo."),
 ("iabbu", "Prendere in giro", ["Giacca", "Abbaiare", "Gabbia"], 3, "«Te lu iabbu nu nci mueri»: chi prende in giro, poi ci capita."),
]

fatti = json.load(open(os.path.join(QUI, "../content/fatti.json")))
fatti = [f for f in fatti if not f["id"].startswith("D")]
domande = []
for i, (parola, giusta, sbagliate, liv, spieg) in enumerate(PAROLE, 1):
    fid = f"D{i:02d}"
    fatti.append({"id": fid, "testo": f"In salentino «{parola}» vuol dire «{giusta.lower()}».", "fonti": [FONTE],
                  "affidabilita": "media", "consultato_il": "2026-11-18", "note": NOTA})
    risposte = [giusta] + sbagliate[: (3 if liv == 3 else 2)]
    ordine = list(range(len(risposte))); random.shuffle(ordine)
    domande.append({
        "id": f"DIA-{i:03d}", "materia": "dialetto", "livello": liv, "tipo": "scelta", "stimolo": None,
        "domanda": f"In dialetto salentino, che cosa vuol dire «{parola}»?",
        "risposte": [risposte[k] for k in ordine], "corretta": ordine.index(0),
        "spiegazione": spieg, "fatto_id": fid, "stato": "attiva",
    })
json.dump(fatti, open(os.path.join(QUI, "../content/fatti.json"), "w"), ensure_ascii=False, indent=2)
json.dump(domande, open(os.path.join(QUI, "../content/domande/dialetto.json"), "w"), ensure_ascii=False, indent=2)
from collections import Counter
print(len(domande), Counter(d["livello"] for d in domande))
