# Street Fraga

Picchiaduro a quiz ambientato a Fragagnano (TA), pensato per persone over 60.
Si vince rispondendo alle domande: ogni risposta giusta fa partire un colpo.

## Provare il gioco sul proprio computer

Serve Node.js 22. Poi, nella cartella del progetto:

```bash
npm install
npm run dev
```

e apri http://localhost:3000 nel browser.

## Comandi utili

- `npm test` — controllo automatico delle domande, ricalcolo della matematica, regole del punteggio.
- `npm run build` — prepara la versione da pubblicare.
- Pagina di prova dei colpi speciali: http://localhost:3000/prova-mosse

## Dove sono le cose

- `src/testi.ts` — tutti i testi dell'interfaccia.
- `content/fatti.json` — base di fatti con le fonti.
- `content/domande/` — le domande.
- `src/gioco/personaggi.ts` — i lottatori e le loro mosse.
- `src/gioco/regole.ts` — numeri del combattimento (energia, danni, punti).
- `docs/crediti.md` — caratteri, musica, disegni.
- `CLAUDE.md` — regole di accessibilità e di scrittura delle domande.
