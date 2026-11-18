"""
Domande su Fragagnano (storia, geografia, feste), scritte a mano e collegate ai fatti di content/fatti.json.
La risposta giusta si scrive sempre per prima; lo script la sposta in una posizione a caso (seme fisso).
Uso: python3 scripts/domande-fragagnano.py
"""
import json, random, os
random.seed(7)
QUI = os.path.dirname(os.path.abspath(__file__))
FATTI = {f["id"]: f for f in json.load(open(os.path.join(QUI, "../content/fatti.json")))}
VF = "vf"

def crea(materia, prefisso, righe):
    out = []
    for n, (liv, tipo, domanda, risposte, spieg, fatto) in enumerate(righe, 1):
        if tipo == VF:
            giusta_vero = risposte  # True/False
            ris, corr, tipo = ["Vero", "Falso"], (0 if giusta_vero else 1), "vero_falso"
        else:
            ordine = list(range(len(risposte)))
            random.shuffle(ordine)
            ris = [risposte[i] for i in ordine]
            corr = ordine.index(0)
        stato = "da_rivedere" if FATTI[fatto]["affidabilita"] == "bassa" else "attiva"
        out.append({"id": f"{prefisso}-{n:03d}", "materia": materia, "livello": liv, "tipo": tipo, "stimolo": None,
                    "domanda": domanda, "risposte": ris, "corretta": corr, "spiegazione": spieg,
                    "fatto_id": fatto, "stato": stato})
    json.dump(out, open(os.path.join(QUI, f"../content/domande/{materia}.json"), "w"), ensure_ascii=False, indent=2)
    print(materia, len(out))

S = "scelta"

crea("geografia", "GEO", [
 (1, S, "In quale provincia si trova Fragagnano?", ["Taranto", "Bari", "Lecce"], "Fragagnano è in provincia di Taranto, a due passi dal mare.", "G01"),
 (1, VF, "Fragagnano è un paese della Puglia. Vero o falso?", True, "Vero! Siamo nel cuore della Puglia, terra di ulivi.", "G01"),
 (2, S, "In quale regione si trova Fragagnano?", ["Puglia", "Basilicata", "Calabria"], "La Puglia è il tacco dello stivale d'Italia!", "G01"),
 (1, VF, "Fragagnano ha circa 5.000 abitanti. Vero o falso?", True, "Vero! Un paese di circa 5.000 fragagnanesi.", "G02"),
 (2, S, "Più o meno, quanti abitanti ha Fragagnano?", ["Circa 5.000", "Circa 500", "Circa 50.000"], "Circa 5.000: ci si conosce un po' tutti!", "G02"),
 (3, S, "Più o meno, quanto è grande il territorio del comune?", ["Circa 22 chilometri quadrati", "Circa 2 chilometri quadrati", "Circa 220 chilometri quadrati", "Circa 90 chilometri quadrati"], "Circa 22 chilometri quadrati, tra paese e campagne.", "G03"),
 (2, S, "Qual è il codice postale di Fragagnano?", ["74022", "74100", "73100"], "Il codice postale è 74022: utile per le cartoline!", "G05"),
 (2, S, "Qual è il prefisso telefonico di Fragagnano?", ["099", "080", "0832"], "È lo 099, lo stesso di Taranto.", "G05"),
 (1, S, "Come si chiamano gli abitanti di Fragagnano?", ["Fragagnanesi", "Fragagnini", "Fragagnoti"], "Si chiamano fragagnanesi. Bel nome, vero?", "G06"),
 (2, S, "Una persona nata a Fragagnano come si chiama?", ["Fragagnanese", "Fragagnota", "Fragagnina"], "Fragagnanese, con orgoglio!", "G06"),
 (1, VF, "In dialetto Fragagnano si chiama Fragnànu. Vero o falso?", True, "Vero! In dialetto si dice Fragnànu.", "G07"),
 (2, S, "Più o meno, quanti chilometri ci sono fino a Taranto?", ["Circa 20", "Circa 5", "Circa 80"], "Taranto è a circa 20 chilometri: vicina vicina.", "G08"),
 (1, S, "Qual è il capoluogo della provincia di Fragagnano?", ["Taranto", "Brindisi", "Matera"], "È Taranto, la città dei due mari.", "G08"),
 (2, S, "Quale di questi paesi confina con Fragagnano?", ["Lizzano", "Ostuni", "Martina Franca"], "Lizzano confina con Fragagnano, verso il mare.", "G09"),
 (2, S, "Quale di questi paesi confina con Fragagnano?", ["Sava", "Castellaneta", "Ginosa"], "Sava confina con Fragagnano. Vicini di casa!", "G09"),
 (3, S, "Quale di questi paesi confina con Fragagnano?", ["Grottaglie", "Massafra", "Laterza", "Mottola"], "Grottaglie confina con Fragagnano: è famosa per le ceramiche.", "G09"),
 (1, S, "Qual è il paese più vicino a Fragagnano?", ["San Marzano", "Manduria", "Martina Franca"], "San Marzano di San Giuseppe è a circa 4 chilometri.", "G10"),
 (2, S, "Più o meno, quanto dista San Marzano da Fragagnano?", ["Circa 4 chilometri", "Circa 40 chilometri", "Circa 15 chilometri"], "Circa 4 chilometri: si arriva anche a piedi!", "G10"),
 (1, S, "Dove sorge il paese di Fragagnano?", ["Su una dolce altura", "In riva al mare", "In una valle profonda"], "Sorge sul crinale di una dolce altura.", "G11"),
 (3, S, "Fragagnano sorge su un'altura di quale zona?", ["La Murgia tarantina", "Il Gargano", "La Sila", "Il Pollino"], "La Murgia tarantina: colline basse e campagne verdi.", "G11"),
 (2, S, "In quale via si trova il municipio?", ["Via Cesare Battisti", "Via Dante", "Via Mazzini"], "Il municipio è in via Cesare Battisti, al numero 1.", "G12"),
 (2, VF, "Fragagnano fa parte delle 'Terre del Mare e del Sole'. Vero o falso?", True, "Vero! È un'unione di comuni della zona.", "G13"),
 (1, S, "Che cosa c'è sullo stemma di Fragagnano?", ["Spiga e grappolo", "Leone e torre", "Nave e ancora"], "Spiga di grano e grappolo d'uva: pane e vino!", "G14"),
 (2, S, "Di che colore è la spiga dello stemma?", ["Oro", "Rossa", "Azzurra"], "La spiga è d'oro, come il grano maturo.", "G14"),
 (3, S, "Nello stemma, di che colore è il fondo dietro la spiga?", ["Verde", "Rosso", "Blu", "Nero"], "La spiga d'oro sta su un fondo verde.", "G14"),
 (3, VF, "Fragagnano è in una zona con poco rischio di terremoti. Vero o falso?", True, "Vero! È in zona 4, la più tranquilla.", "G16"),
 (2, S, "Quale antica strada romana passava vicino a Fragagnano?", ["La via Appia", "La via Emilia", "La via Aurelia"], "La via Appia andava da Roma fino a Brindisi.", "G18"),
 (2, S, "Più o meno, quanto è lontano il mare?", ["Una decina di chilometri", "Un centinaio di chilometri", "Mezzo chilometro"], "Il mare è a una decina di chilometri, in linea d'aria.", "G19"),
 (1, S, "Con che cosa sono divisi i campi intorno al paese?", ["Muretti a secco", "Recinti di ferro", "Siepi di bambù"], "I muretti a secco sono fatti di sole pietre.", "G20"),
 (1, S, "Che cosa si coltiva soprattutto nelle campagne di Fragagnano?", ["Vigne e ulivi", "Riso e mais", "Mele e pere"], "Vigne e ulivi: da qui vengono vino e olio.", "E08"),
 (2, VF, "Fragagnano è vicina a Taranto. Vero o falso?", True, "Vero! Sono circa 20 chilometri.", "G08"),
])

crea("storia", "STO", [
 (2, S, "Secondo una spiegazione, da dove viene il nome Fragagnano?", ["Da un nome romano", "Da un fiume vicino", "Da un santo francese"], "Il nome verrebbe da un antico romano padrone di queste terre.", "S01"),
 (1, S, "Dove sono stati trovati resti di capanne preistoriche?", ["Sul Monte Santa Sofia", "In piazza Risorgimento", "Sotto il municipio"], "Il Monte Santa Sofia era abitato già nella preistoria!", "S02"),
 (1, VF, "Sul Monte Santa Sofia c'è un sito archeologico. Vero o falso?", True, "Vero! Lì sono stati trovati resti di capanne antichissime.", "S02"),
 (3, S, "Di quale epoca sono le capanne del Monte Santa Sofia?", ["Preistorica", "Medievale", "Moderna", "Ottocentesca"], "Sono preistoriche: migliaia di anni fa!", "S02"),
 (2, S, "Come si chiama la sorgente del Monte Santa Sofia?", ["Funtanedda", "Fontanone", "Acquasanta"], "La funtanedda sgorga ancora dalle rocce del monte.", "S03"),
 (1, VF, "Dalle rocce del Monte Santa Sofia sgorga una sorgente. Vero o falso?", True, "Vero! Si chiama funtanedda.", "S03"),
 (2, S, "Dal 1278 il feudo fu di quale famiglia?", ["Dell'Antoglietta", "Dei Medici", "Degli Sforza"], "I dell'Antoglietta tennero il feudo per secoli.", "S04"),
 (3, S, "Da quale paese veniva la famiglia dell'Antoglietta?", ["Dalla Francia", "Dalla Spagna", "Dalla Germania", "Dall'Inghilterra"], "Erano di origine francese: in Francia si chiamavano Nanteuil.", "S04"),
 (2, S, "In che anno i dell'Antoglietta ebbero il feudo?", ["1278", "1478", "1678"], "Era il 1278: quasi 750 anni fa!", "S04"),
 (1, S, "In che anno fu costruita la torre del castello?", ["1487", "1687", "1887"], "La torre è del 1487. Ha più di 500 anni!", "S05"),
 (2, VF, "La torre del castello ha più di 500 anni. Vero o falso?", True, "Vero! Fu eretta nel 1487.", "S05"),
 (3, S, "In che anno fu costruito il palazzo baronale?", ["1587", "1687", "1787", "1887"], "Il palazzo fu costruito nel 1587, intorno alla torre più antica.", "S05B"),
 (2, S, "Che cosa aveva la torre del castello per difendersi?", ["Un ponte levatoio", "Una porta di vetro", "Un giardino fiorito"], "Il ponte levatoio si alzava per chiudere l'ingresso.", "S06"),
 (1, S, "Il Palazzo Marchesale fu fortificato per paura di chi?", ["Dei Turchi", "Dei lupi", "Delle tempeste"], "Si temevano gli sbarchi dei Turchi sulla costa.", "S07"),
 (2, S, "Quale marchese fece fortificare il Palazzo Marchesale?", ["Francesco Maria dell'Antoglietta", "Carlo d'Angiò", "Federico di Svevia"], "Fu il marchese Francesco Maria dell'Antoglietta.", "S07"),
 (2, S, "Che tipo di portale ha il Palazzo Marchesale?", ["Bugnato", "Di marmo bianco", "Di ferro battuto"], "Il bugnato è fatto di grandi pietre squadrate e sporgenti.", "S08"),
 (3, VF, "Il portale bugnato è fatto di grandi pietre sporgenti. Vero o falso?", True, "Vero! Dà al palazzo un aspetto forte e solido.", "S08"),
 (3, S, "Che forma ha il cortile del Palazzo Marchesale?", ["Un trapezio", "Un cerchio", "Un triangolo", "Una stella"], "Il portale porta in un cortile a forma di trapezio.", "S08B"),
 (2, S, "Quale santa ha una statua su un antico palazzo in piazza?", ["Sant'Irene", "Santa Lucia", "Santa Rita"], "La statua di Sant'Irene sta sopra lo stemma dei marchesi.", "S09"),
 (2, S, "Chi furono gli ultimi feudatari di Fragagnano?", ["I Carducci Agustini", "I Borbone", "I Normanni"], "Dopo i dell'Antoglietta arrivarono i Carducci Agustini.", "S11B"),
 (1, S, "In che anno il Palazzo Marchesale fu donato al Comune?", ["1979", "1879", "1779"], "Nel 1979: da allora il palazzo è di tutti.", "S13"),
 (1, VF, "Il Palazzo Marchesale fu donato al Comune. Vero o falso?", True, "Vero! Avvenne nel 1979.", "S13"),
 (1, S, "Nel Novecento, a che cosa servì il palazzo baronale?", ["A fare il vino", "A fare il pane", "A tessere la lana"], "Fu usato in parte come stabilimento per il vino.", "S14"),
 (2, VF, "Negli anni Settanta il palazzo baronale ospitò il Municipio. Vero o falso?", True, "Vero! Fu sede del Municipio per un periodo.", "S14B"),
 (1, S, "Che cosa c'è oggi nel Palazzo Marchesale?", ["Una sala convegni", "Una piscina", "Una stazione"], "Nella sala convegni si fanno feste ed eventi.", "S15"),
 (2, S, "In che anno Sant'Antonio fu proclamato patrono?", ["1904", "1804", "1954"], "Fu proclamato patrono nel 1904.", "S16"),
 (1, VF, "Il palazzo baronale è di fronte al Palazzo Marchesale. Vero o falso?", True, "Vero! I due palazzi si guardano.", "S18"),
 (2, S, "Qual è il palazzo più antico del paese?", ["Il palazzo baronale", "Il Palazzo Marchesale", "Il municipio"], "Il palazzo baronale, detto anche castello, è il più antico.", "S19"),
 (1, S, "Su quale piazza si affaccia il Palazzo Marchesale?", ["Piazza Regina Elena", "Piazza Garibaldi", "Piazza Dante"], "Il palazzo domina piazza Regina Elena.", "S20"),
 (1, S, "A chi è dedicata la Chiesa Madre di Fragagnano?", ["Maria Santissima Immacolata", "San Nicola", "Santa Lucia"], "La Chiesa Madre è dedicata a Maria Santissima Immacolata.", "C01"),
 (1, S, "La Chiesa Madre fa parte di quale arcidiocesi?", ["Taranto", "Lecce", "Bari"], "È una parrocchia dell'Arcidiocesi di Taranto.", "C01"),
 (2, S, "In che anno la chiesa del Carmine prese l'aspetto di oggi?", ["1911", "1711", "1511"], "La chiesa del Carmine di oggi è del 1911.", "C02"),
 (1, S, "In quale corso si trova la chiesa del Carmine?", ["Corso Vittorio Emanuele", "Corso Garibaldi", "Corso Italia"], "È in corso Vittorio Emanuele, all'angolo con via Fiume.", "C02"),
 (1, S, "Come chiamano i fragagnanesi la chiesa del Carmine?", ["Oratorio", "Cappellone", "Chiesone"], "In paese tutti la chiamano oratorio.", "C03"),
 (3, S, "Quante navate ha la chiesa del Carmine?", ["1", "2", "3", "5"], "Ha una sola navata, semplice e raccolta.", "C03"),
 (2, S, "Dove si trova la Cappella della Madonna del Favore?", ["In campagna, fuori paese", "In piazza Regina Elena", "Dentro il castello"], "È in campagna, a circa 1 chilometro dal paese.", "C04"),
 (1, S, "Secondo la leggenda, dove fu trovata l'immagine della Madonna?", ["In un pozzo", "In una grotta", "Sotto un ulivo"], "Secondo la leggenda, la Madonna del Favore fu trovata in un pozzo.", "C05"),
 (3, S, "Secondo il racconto, verso dove fu girato l'ingresso della cappella?", ["Verso il paese", "Verso il mare", "Verso Taranto", "Verso il monte"], "Si racconta che da allora la cappella non crollò più.", "C11"),
 (3, S, "Secondo una fonte, in passato c'era una comunità di origine...?", ["Albanese", "Greca", "Spagnola", "Tedesca"], "Si racconta di una comunità albanese, poi diventata fragagnanese.", "S17"),
 (3, S, "Nel 1905, che cosa fu trovato vicino al paese?", ["Monete greche antiche", "Una statua romana", "Un'anfora d'olio"], "Un piccolo tesoro di monete greche di oltre 2.000 anni fa.", "S21"),
 (3, S, "In che anno Fragagnano entrò nella provincia dello Ionio?", ["1923", "1823", "1973"], "Nel 1923: oggi si chiama provincia di Taranto.", "S22"),
 (3, S, "In che anno la cappella del Favore sarebbe già citata?", ["1577", "1777", "1877"], "Sarebbe citata in una visita dell'arcivescovo di Taranto del 1577.", "C06"),
 (2, S, "Con che cosa fu costruita la Chiesa Madre?", ["Le offerte dei cittadini", "I soldi del re", "Un tesoro trovato"], "Un'iscrizione del 1774 ricorda le offerte dei cittadini.", "C07"),
 (2, S, "Che cosa c'è davanti alla Chiesa Madre?", ["Un'ampia scalinata", "Una grande fontana", "Un campo sportivo"], "Un'ampia scalinata porta al portale della Chiesa Madre.", "C08"),
 (2, VF, "Nella Chiesa Madre ci sono reliquie di Sant'Antonio. Vero o falso?", True, "Vero! Si conservano reliquie di Sant'Antonio di Padova.", "C09"),
])

crea("feste", "FES", [
 (1, S, "Chi è il santo patrono di Fragagnano?", ["Sant'Antonio", "San Nicola", "San Cataldo"], "È Sant'Antonio di Padova, amatissimo in paese.", "T01"),
 (1, S, "In quale giorno è Sant'Antonio sul calendario?", ["13 giugno", "19 marzo", "8 dicembre"], "Il 13 giugno è il giorno di Sant'Antonio.", "T01"),
 (1, S, "In quale mese si fa la festa grande del patrono?", ["Agosto", "Maggio", "Ottobre"], "In agosto, quando il paese è pieno di gente.", "T02"),
 (2, VF, "La festa grande di Sant'Antonio si fa d'estate. Vero o falso?", True, "Vero! Si fa in agosto.", "T02"),
 (2, S, "Perché la festa grande fu portata in agosto?", ["Per gli emigrati", "Per la vendemmia", "Per il caldo"], "In agosto tornavano in paese gli emigrati.", "T03"),
 (3, S, "Come viene chiamata anche la festa patronale di agosto?", ["Festa dell'emigrante", "Festa del raccolto", "Festa del mare", "Festa del vino"], "È la festa dell'emigrante: si torna a casa!", "T03"),
 (1, S, "A quale santo è legato il Rito dei Santi?", ["San Giuseppe", "San Pietro", "San Rocco"], "Il Rito dei Santi è in onore di San Giuseppe.", "T04"),
 (1, S, "In quale mese si fa il Rito dei Santi?", ["Marzo", "Luglio", "Novembre"], "In marzo, vicino alla festa di San Giuseppe.", "T04"),
 (1, S, "Chi organizza il Rito dei Santi?", ["La Pro Loco", "La scuola", "La banda"], "Lo organizza la Pro Loco di Fragagnano.", "T04"),
 (2, S, "Nel Rito dei Santi, quante persone siedono a tavola?", ["Sempre un numero dispari", "Sempre 20 persone", "Solo 2 persone"], "Sempre in numero dispari, da 3 a 13.", "T05"),
 (3, S, "Che cosa ricorda il numero dispari di persone a tavola?", ["L'Ultima Cena", "I mesi dell'anno", "I giorni della settimana", "Le stelle del cielo"], "Ricorda l'Ultima Cena di Gesù.", "T05"),
 (3, S, "Nel Rito dei Santi, al massimo quante persone siedono a tavola?", ["13", "7", "21", "30"], "Da 3 fino a 13 persone, sempre in numero dispari.", "T05"),
 (1, S, "Nel Rito dei Santi, chi siede a capotavola?", ["San Giuseppe", "La Madonna", "Gesù Bambino"], "San Giuseppe siede a capotavola.", "T06"),
 (2, S, "Che cosa ha San Giuseppe nel Rito dei Santi?", ["Un bastone fiorito", "Una corona d'oro", "Una lunga spada"], "Il suo posto è segnato da un bastone fiorito.", "T06"),
 (3, S, "Chi siede alla destra di San Giuseppe?", ["La Madonna", "Gesù Bambino", "San Pietro", "Sant'Antonio"], "La Madonna a destra, Gesù Bambino a sinistra.", "T06"),
 (1, S, "Quante sono le pietanze del Rito dei Santi?", ["13", "7", "10"], "Sono 13 pietanze: un pranzo da re!", "T07"),
 (2, VF, "Nel Rito dei Santi è San Giuseppe a iniziare il pranzo. Vero o falso?", True, "Vero! Dà il via al pranzo con il suo bastone.", "T07"),
 (1, S, "Quale di questi cibi c'è nel Rito dei Santi?", ["Il baccalà", "La pizza", "Il panettone"], "Il baccalà è una delle 13 pietanze.", "T08"),
 (1, S, "Quale frutto si mangia nel Rito dei Santi?", ["Le arance", "Le fragole", "Le banane"], "Le arance di marzo, dolci e succose!", "T08"),
 (2, S, "Con che cosa si condiscono i bucatini del Rito?", ["Mollica di pane", "Panna e funghi", "Burro e salvia"], "Bucatini con la mollica: semplici e buonissimi.", "T08"),
 (2, S, "Nel Rito dei Santi, il pane diviso è simbolo di che cosa?", ["Della comunità", "Della ricchezza", "Del raccolto"], "Il pane diviso tra tutti unisce la comunità.", "T08B"),
 (3, S, "Con che cosa comincia il Rito dei Santi?", ["Il lavaggio delle mani", "Un ballo in piazza", "Il suono delle campane", "Un brindisi"], "Si comincia lavandosi le mani, segno di purezza.", "T08C"),
 (3, S, "Come si chiamano anche le tavolate di San Giuseppe?", ["Mattere", "Tavolini", "Banchetti", "Credenze"], "Le tavolate di San Giuseppe sono dette anche mattere.", "T08D"),
 (1, S, "Che cosa racconta la Passio Christi?", ["La Passione di Gesù", "La nascita di Gesù", "La vita di Sant'Antonio"], "La Passio Christi racconta la Passione di Gesù.", "T09"),
 (1, S, "In che periodo si fa la Passio Christi?", ["Prima di Pasqua", "A Ferragosto", "A Natale"], "Si fa una domenica poco prima di Pasqua.", "T09"),
 (3, S, "Nel 2019 la Passio Christi era a quale edizione?", ["10ª", "3ª", "25ª", "50ª"], "Nel 2019 era la 10ª edizione.", "T09"),
 (2, S, "Quale associazione organizza la Passio Christi?", ["Terra Nostra", "Mare Nostro", "Cielo Azzurro"], "La organizza l'associazione Terra Nostra.", "T09B"),
 (2, S, "Dove si conclude il percorso della Passio Christi?", ["Al Monte Santa Sofia", "Alla stazione", "Al campo sportivo"], "Si conclude al Monte Santa Sofia, luogo antichissimo.", "T10"),
 (3, S, "Quanti attori partecipano oggi alla Passio Christi?", ["Oltre 200", "Circa 20", "Circa 5", "Oltre 5.000"], "Erano circa 20 all'inizio, oggi sono più di 200!", "T10B"),
 (2, S, "Che cosa illumina la Via Crucis della Passio Christi?", ["Le torce", "Le luminarie", "I fuochi d'artificio"], "Le torce rendono la sera ancora più suggestiva.", "T10C"),
 (1, S, "Nel Transito di Sant'Antonio, chi tira il carretto?", ["Un asinello", "Un cavallo bianco", "Un trattore"], "Un asinello tira il carretto di legno del Santo.", "T11"),
 (2, S, "Chi organizza il Transito di Sant'Antonio?", ["Terra Nostra", "La Pro Loco", "La banda"], "Lo organizza l'associazione Terra Nostra.", "T11B"),
 (1, S, "Quanti sono i rioni del Torneo dei Rioni?", ["4", "2", "10"], "I rioni sono 4, ognuno con i suoi colori.", "T12"),
 (3, S, "Quale di questi è un rione del Torneo?", ["Sol Ardens", "Luna Nova", "Mare Altum", "Ventus Fortis"], "Sol Ardens vuol dire Sole ardente.", "T12"),
 (2, S, "In che anno è nato il Torneo dei Rioni?", ["2015", "1985", "1955"], "La prima edizione fu nel 2015.", "T12"),
 (1, S, "Quale gioco si fa nel Torneo dei Rioni?", ["Il tiro alla fune", "Il biliardo", "Gli scacchi"], "Il tiro alla fune: forza e squadra!", "T12B"),
 (2, S, "Quale gioco c'è nel Torneo dei Rioni?", ["L'albero della cuccagna", "La partita a golf", "La gara di tango"], "L'albero della cuccagna: chi arriva in cima vince!", "T12B"),
 (2, S, "Che cosa vuol dire Castrum, nome di un rione?", ["Castello", "Campo", "Chiesa"], "Castrum in latino vuol dire castello.", "T12C"),
 (2, S, "Che cosa si fa a Natale nel centro storico?", ["Il Presepe Vivente", "La Passio Christi", "Il Torneo dei Rioni"], "A Natale il centro storico diventa un presepe vivente.", "T13"),
 (1, S, "Per chi è la Notte Bianca organizzata dalla Pro Loco?", ["Per i bambini", "Per i nonni", "Per i musicisti"], "È la Notte Bianca dei Bambini: festa per i più piccoli!", "T14"),
 (2, S, "In che giorno c'è la processione della Madonna del Carmine?", ["16 luglio", "25 dicembre", "2 febbraio"], "Il 16 luglio si festeggia la Madonna del Carmine.", "T15"),
 (2, S, "Quando c'è la processione alla Cappella del Favore?", ["L'ultima domenica di maggio", "Il primo agosto", "La notte di Natale"], "L'ultima domenica di maggio i fedeli vanno alla cappella.", "C06B"),
 (1, VF, "A Fragagnano si fanno i mercatini di Natale. Vero o falso?", True, "Vero! Nel 2018 erano già alla 3ª edizione.", "T18"),
 (2, S, "Tra quali alberi da frutto passeggia la Pro Loco?", ["Melograni", "Ciliegi", "Castagni"], "Una bella passeggiata tra i melograni, con assaggio!", "T19"),
 (2, S, "Per San Giuseppe, a marzo, che fiera si tiene?", ["Una fiera agricola", "Una fiera del pesce", "Una fiera dei libri"], "Una fiera agricola con attrezzi e prodotti locali.", "T16"),
 (2, S, "Quale processione si fa il Venerdì Santo?", ["Dei Misteri", "Delle luminarie", "Dei fiori"], "Il Venerdì Santo passa la processione dei Misteri.", "T17"),
 (3, VF, "A giugno c'è una festa piccola per Sant'Antonio. Vero o falso?", True, "Vero! La festa grande invece è in agosto.", "T02C"),
])
