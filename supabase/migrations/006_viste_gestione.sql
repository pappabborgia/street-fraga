-- Viste per il gestore: si consultano dal pannello di Supabase (Table Editor, schema "gestione").
-- Lo schema "gestione" non è esposto alle API: il browser dei giocatori non può leggerlo.
create schema if not exists gestione;
revoke all on schema gestione from public, anon, authenticated;

create or replace view gestione.giocatori as
select g.nome,
       g.creato_il as registrato_il,
       count(p.*) as partite,
       count(p.*) filter (where p.vinta) as vittorie,
       coalesce(sum(p.punti), 0) as punti,
       (select count(*) from public.coppe c where c.giocatore_id = g.id) as coppe,
       count(distinct (p.giocata_il at time zone 'Europe/Rome')::date) as giorni_di_gioco,
       max(p.giocata_il) as ultima_partita
from public.giocatori g left join public.partite p on p.giocatore_id = g.id
group by g.id, g.nome, g.creato_il
order by ultima_partita desc nulls last;

create or replace view gestione.partite as
select p.giocata_il, g.nome, p.personaggio, p.avversario, p.livello, p.punti, p.vinta
from public.partite p join public.giocatori g on g.id = p.giocatore_id
order by p.giocata_il desc;

create or replace view gestione.partite_per_giorno as
select (giocata_il at time zone 'Europe/Rome')::date as giorno, count(*) as partite, count(distinct giocatore_id) as giocatori
from public.partite group by 1 order by 1 desc;

create or replace view gestione.parole as
select italiano, min(dialetto) as dialetto,
       count(*) filter (where giusto) as si,
       count(*) filter (where not giusto) as no,
       (count(*) filter (where giusto) >= 5 and count(*) filter (where giusto) >= 3 * count(*) filter (where not giusto)) as confermata,
       bool_or(da_fonte) as proposta_da_fonte,
       max(creato_il) as ultimo_voto
from public.voti_parole
group by italiano, lower(dialetto)
order by confermata desc, si desc, italiano;

revoke all on all tables in schema gestione from public, anon, authenticated;
