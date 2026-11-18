-- Coppe della Disfida di Fragnànu: una riga per ogni torneo vinto.
create table if not exists public.coppe (
  id bigserial primary key,
  giocatore_id uuid not null references public.giocatori(id) on delete cascade,
  livello int not null check (livello between 1 and 3),
  personaggio text not null,
  vinta_il timestamptz not null default now()
);
create index if not exists coppe_giocatore on public.coppe (giocatore_id);
alter table public.coppe enable row level security;
revoke all on public.coppe from anon, authenticated;

create or replace function public.vinci_coppa(p_token text, p_livello int, p_personaggio text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare g uuid := giocatore_da_token(p_token);
begin
  if g is null then return json_build_object('errore', 'non_collegato'); end if;
  insert into coppe (giocatore_id, livello, personaggio) values (g, least(greatest(p_livello, 1), 3), left(p_personaggio, 30));
  return json_build_object('ok', true, 'coppe', (select count(*) from coppe where giocatore_id = g));
end $$;

drop function if exists public.classifica(text);
create function public.classifica(p_periodo text default 'sempre')
returns table (nome text, punti bigint, vittorie bigint, partite bigint, coppe bigint)
language sql stable security definer set search_path = public as $$
  select g.nome, sum(p.punti)::bigint, count(*) filter (where p.vinta)::bigint, count(*)::bigint,
    (select count(*) from coppe c where c.giocatore_id = g.id
       and (p_periodo <> 'settimana' or c.vinta_il >= date_trunc('week', now())))::bigint
  from partite p join giocatori g on g.id = p.giocatore_id
  where p_periodo <> 'settimana' or p.giocata_il >= date_trunc('week', now())
  group by g.id, g.nome
  order by 2 desc, 5 desc, 3 desc, g.nome
  limit 50
$$;

create or replace function public.il_mio_profilo(p_token text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'nome', g.nome,
    'punti', coalesce(sum(p.punti), 0),
    'vittorie', count(p.*) filter (where p.vinta),
    'partite', count(p.*),
    'giorni', count(distinct (p.giocata_il at time zone 'Europe/Rome')::date),
    'coppe', (select count(*) from coppe c where c.giocatore_id = g.id))
  from giocatori g left join partite p on p.giocatore_id = g.id
  where g.id = giocatore_da_token(p_token)
  group by g.id, g.nome
$$;

revoke all on function public.vinci_coppa(text, int, text), public.classifica(text), public.il_mio_profilo(text) from public, anon, authenticated;
grant execute on function public.vinci_coppa(text, int, text), public.classifica(text), public.il_mio_profilo(text) to anon, authenticated;
