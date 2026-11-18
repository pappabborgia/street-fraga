@AGENTS.md

# Street Fraga — regole del progetto

Picchiaduro a quiz ambientato a Fragagnano (TA), per persone over 60.
Si vince rispondendo a domande. È un gioco, non una terapia: non scrivere mai
che cura, previene o misura demenza o altre malattie.

Tutto è originale: niente nomi, personaggi, grafica, suoni, musiche o loghi di
Street Fighter o di altri giochi. Personaggi e sfondi disegnati in SVG da noi.
Musica: brani di Mozart (pubblico dominio) arrangiati da noi con Web Audio.
Crediti e licenze in `docs/crediti.md`.

## Accessibilità (obbligatoria)

Testo
- Domanda: almeno 28 px su telefono, 36 px su tablet e computer. Risposte almeno 24 px. Nessun testo sotto i 20 px.
- Carattere Atkinson Hyperlegible incluso nel progetto (nessuna richiesta a siti esterni).
- Contrasto testo/sfondo almeno 7:1.
- Impostazione "Grandezza del testo": Normale, Grande, Molto grande.

Tocco
- Pulsanti alti almeno 72 px, distanti almeno 16 px, larghi quanto lo schermo su telefono.
- Solo tocco singolo: niente trascinamenti, scorrimenti, doppi tocchi, pressioni lunghe, effetti al passaggio del mouse.
- Risposta in due passi (tocco la risposta, poi "Conferma"), attiva di default, disattivabile.
- Ignorare i doppi tocchi involontari.

Tempo
- Nessun conto alla rovescia di default; il tempo solo come modalità facoltativa "Con il tempo".
- Niente sparisce da solo: ogni messaggio resta finché il giocatore tocca "Avanti".

Lingua
- Dai del tu. Parole di tutti i giorni. Niente inglese né parole tecniche (unica eccezione: il titolo "Street Fraga").
- Una cosa sola per schermata. Nei menu al massimo 3 scelte per volta.
- Pulsanti "Indietro" e "Casa" sempre visibili e sempre nello stesso posto (tranne in casa, dove ci sono solo "Menu", "Musica" e GIOCA).
- Tutti i testi dell'interfaccia in `src/testi.ts`.

Vista e udito
- Mai il colore da solo: giusto/sbagliato = icona + parola + colore.
- Pulsante "Ascolta" (voce italiana del dispositivo), opzione "Leggi sempre ad alta voce"; nascosto se non c'è voce italiana.
- Suoni e musica attivabili e disattivabili. Tutto quello che si sente deve anche vedersi.
- Niente lampeggi, niente scosse veloci. Animazioni lente e brevi (massimo 1,5 secondi), nessuna animazione infinita.
- Movimenti: per scelta del gestore le mosse si vedono complete di default, anche con "riduci movimento" attivo sul telefono. Nelle Impostazioni → "Movimenti dei lottatori" si può scegliere "Come il telefono" (rispetta `prefers-reduced-motion`) o "Ridotti".
- Eccezione (scelta del gestore): in casa il pulsante GIOCA pulsa piano all'infinito (2,4 secondi a ciclo, niente lampeggio acceso/spento); fermo con "Movimenti ridotti".
- Festa di fine partita: circa 17 secondi, fatta di scene brevi (ognuna al massimo 1,5 secondi).

Solidità
- Funziona in verticale e orizzontale da 360 px di larghezza. PWA. Partita contro il computer anche senza rete.

Tono
- Allegro e affettuoso, da fumetto. Niente sangue né violenza realistica. A fine partita stretta di mano.
- Mai prendere in giro chi sbaglia, mai battute su età o memoria. Personaggi caricature affettuose, nessuna persona reale.
- Mostrare solo progressi positivi; mai cali, percentuali di errori o cose che somigliano a una valutazione medica.

## Domande (sezione 7 del documento di progetto)

Materie: storia (50), geografia (50), feste (50), matematica (90), parole (70), memoria (60), logica (60), tempo (40), campagna (30) = 500.
Livelli circa 40% facili (1), 40% medie (2), 20% difficili (3).

Tipi: `scelta` (3 risposte, 4 solo a livello 3), `vero_falso`, `memoria` (con `stimolo`), `sequenza`, `intruso`. Si risponde sempre toccando.

Scrittura
- Massimo 12 parole per frase, massimo 3 frasi per domanda.
- Risposte massimo 4 parole, lunghezza simile, una sola giusta senza ambiguità.
- Niente domande al negativo, niente doppie negazioni, niente "tutte le precedenti"/"nessuna". Niente trabocchetti.
- Numeri in cifre. Date per intero ("13 giugno").
- Spiegazione: una frase, massimo 15 parole, tono positivo, piccola curiosità.
- Italiano corretto. Dialetto solo con parole presenti nella base di fatti (Fragnànu, funtanedda, li cartiddati, e le parole salentine D01-D34).
- Dialetto (scelta del gestore): si usa il salentino del nord, la variante parlata a Fragagnano. Parole solo da fonti (fatti D..., fonte: voce "Dialetti salentini"), segnate "da confermare in paese". I nomi di personaggi e colpi sono adattati con le regole del salentino del nord: vanno confermati in paese.
- Materia "dialetto": la 5ª domanda di ogni partita. A fine partita la schermata "Aiutaci a salvare il dialetto" chiede come si dice una parola (elenco in `content/parole-da-raccogliere.json`): non dà punti, le risposte vanno nella tabella `parole_raccolte`.
- Risposte mescolate a ogni partita.

Regole di verità
1. Storia, geografia e feste: ogni domanda ha `fatto_id` verso `content/fatti.json`. Ogni fatto ha fonti (URL), `consultato_il`, `affidabilita` (alta/media/bassa).
2. Nel gioco solo fatti alta o media. Fatti "bassa" → domande `da_rivedere`, escluse finché il gestore non le approva.
3. Fonti in disaccordo: fatto `da_verificare`, non scegliere, avvisare.
4. Mai inventare fatti, date, nomi, soprannomi, parole in dialetto. Se i fatti non bastano, meno domande e compensare con matematica, logica, memoria.
5. Massimo 3 domande per fatto.
6. Dati che cambiano (abitanti, cariche): forme arrotondate ("circa 5.000") o evitarli.
7. Scene inventate: solo luoghi presenti nella base di fatti; non affermare dettagli reali non presenti (mercato, orari, negozi, prezzi reali).
8. Matematica: generata e calcolata con codice, mai a mente; un test ricalcola tutto.
9. Esclusi: cronaca nera, lutti, malattie, politica e amministratori, polemiche religiose, persone private viventi, nomi di aziende e negozi.

## Lavoro
- A fasi; commit alla fine di ogni fase; provare nel browser a 360 e 1024 px prima di dire che è finita.
- Dire sempre cosa non funziona e cosa non è stato verificato.
- Test: `npm test` (vitest).
