-- Street Fraga: giocatori con nome e codice segreto, partite e classifica.
-- Sicurezza:
--  * le tabelle non sono leggibili né scrivibili dal browser (RLS attiva, nessuna policy);
--  * il browser chiama solo le funzioni qui sotto (security definer);
--  * il codice segreto è trasformato in hash bcrypt DENTRO il database (pgcrypto): mai salvato in chiaro;
--  * dopo 5 codici sbagliati il nome resta in pausa 5 minuti.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists unaccent with schema extensions;

create table if not exists public.giocatori (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  nome_chiave text not null unique,
  pin_hash text not null,
  tentativi int not null default 0,
  bloccato_fino timestamptz,
  creato_il timestamptz not null default now()
);

create table if not exists public.sessioni (
  token_hash text primary key,
  giocatore_id uuid not null references public.giocatori(id) on delete cascade,
  creata_il timestamptz not null default now()
);

create table if not exists public.partite (
  id bigserial primary key,
  giocatore_id uuid not null references public.giocatori(id) on delete cascade,
  punti int not null check (punti between 0 and 300),
  vinta boolean not null,
  personaggio text not null,
  avversario text not null,
  livello int not null check (livello between 1 and 3),
  giocata_il timestamptz not null default now()
);
create index if not exists partite_data on public.partite (giocata_il);
create index if not exists partite_giocatore on public.partite (giocatore_id);

alter table public.giocatori enable row level security;
alter table public.sessioni enable row level security;
alter table public.partite enable row level security;
revoke all on public.giocatori, public.sessioni, public.partite from anon, authenticated;

-- Nome unico: maiuscole, accenti e spazi non contano
create or replace function public.chiave_nome(p text) returns text
language sql immutable set search_path = public, extensions as $$
  select lower(regexp_replace(extensions.unaccent(coalesce(p, '')), '[^a-zA-Z]', '', 'g'))
$$;

create or replace function public.nome_valido(p text) returns boolean
language sql immutable as $$
  select p ~ '^[[:alpha:]][[:alpha:] '']*$' and char_length(regexp_replace(p, '[ '']', '', 'g')) between 2 and 20
$$;

-- Nuova sessione: il token va al browser, nel database resta solo il suo hash
create or replace function public.nuova_sessione(p_giocatore uuid) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare t text := encode(extensions.gen_random_bytes(24), 'hex');
begin
  insert into sessioni (token_hash, giocatore_id) values (encode(extensions.digest(t, 'sha256'), 'hex'), p_giocatore);
  return t;
end $$;

create or replace function public.giocatore_da_token(p_token text) returns uuid
language sql stable security definer set search_path = public, extensions as $$
  select giocatore_id from sessioni where token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
$$;

create or replace function public.registra(p_nome text, p_pin text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  n text := btrim(regexp_replace(coalesce(p_nome, ''), '\s+', ' ', 'g'));
  k text := chiave_nome(n);
  g uuid;
  proposta text;
  aggiunte text[] := array['del Sole', 'della Piazza', 'del Castello', 'dell''Uliveto', 'della Vigna', 'del Monte'];
  a text;
begin
  if not nome_valido(n) then return json_build_object('errore', 'nome_non_valido'); end if;
  if coalesce(p_pin, '') !~ '^[0-9]{4}$' then return json_build_object('errore', 'codice_non_valido'); end if;
  if exists (select 1 from giocatori where nome_chiave = k) then
    foreach a in array aggiunte loop
      if char_length(regexp_replace(n || ' ' || a, '[ '']', '', 'g')) <= 20
         and not exists (select 1 from giocatori where nome_chiave = chiave_nome(n || ' ' || a)) then
        proposta := n || ' ' || a; exit;
      end if;
    end loop;
    return json_build_object('errore', 'nome_preso', 'proposta', proposta);
  end if;
  insert into giocatori (nome, nome_chiave, pin_hash) values (n, k, extensions.crypt(p_pin, extensions.gen_salt('bf', 10)))
  returning id into g;
  return json_build_object('nome', n, 'token', nuova_sessione(g));
end $$;

create or replace function public.accedi(p_nome text, p_pin text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare r giocatori%rowtype;
begin
  select * into r from giocatori where nome_chiave = chiave_nome(p_nome);
  if not found then return json_build_object('errore', 'nome_sconosciuto'); end if;
  if r.bloccato_fino is not null and r.bloccato_fino > now() then
    return json_build_object('errore', 'pausa', 'minuti', ceil(extract(epoch from (r.bloccato_fino - now())) / 60));
  end if;
  if coalesce(p_pin, '') ~ '^[0-9]{4}$' and extensions.crypt(p_pin, r.pin_hash) = r.pin_hash then
    update giocatori set tentativi = 0, bloccato_fino = null where id = r.id;
    return json_build_object('nome', r.nome, 'token', nuova_sessione(r.id));
  end if;
  if r.tentativi + 1 >= 5 then
    update giocatori set tentativi = 0, bloccato_fino = now() + interval '5 minutes' where id = r.id;
    return json_build_object('errore', 'pausa', 'minuti', 5);
  end if;
  update giocatori set tentativi = r.tentativi + 1 where id = r.id;
  return json_build_object('errore', 'codice_sbagliato', 'rimasti', 5 - (r.tentativi + 1));
end $$;

create or replace function public.chi_sono(p_token text) returns json
language sql stable security definer set search_path = public, extensions as $$
  select json_build_object('nome', g.nome) from giocatori g where g.id = giocatore_da_token(p_token)
$$;

create or replace function public.esci(p_token text) returns void
language sql security definer set search_path = public, extensions as $$
  delete from sessioni where token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
$$;

create or replace function public.salva_partita(p_token text, p_punti int, p_vinta boolean, p_personaggio text, p_avversario text, p_livello int)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare g uuid := giocatore_da_token(p_token);
begin
  if g is null then return json_build_object('errore', 'non_collegato'); end if;
  insert into partite (giocatore_id, punti, vinta, personaggio, avversario, livello)
  values (g, least(greatest(p_punti, 0), 300), p_vinta, left(p_personaggio, 30), left(p_avversario, 30), p_livello);
  return json_build_object('ok', true);
end $$;

-- Classifica del paese: punti totali e vittorie, della settimana o di sempre
create or replace function public.classifica(p_periodo text default 'sempre')
returns table (nome text, punti bigint, vittorie bigint, partite bigint)
language sql stable security definer set search_path = public as $$
  select g.nome, sum(p.punti)::bigint, count(*) filter (where p.vinta)::bigint, count(*)::bigint
  from partite p join giocatori g on g.id = p.giocatore_id
  where p_periodo <> 'settimana' or p.giocata_il >= date_trunc('week', now())
  group by g.nome
  order by 2 desc, 3 desc, g.nome
  limit 50
$$;

-- Il mio profilo: solo progressi positivi
create or replace function public.il_mio_profilo(p_token text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'nome', g.nome,
    'punti', coalesce(sum(p.punti), 0),
    'vittorie', count(p.*) filter (where p.vinta),
    'partite', count(p.*),
    'giorni', count(distinct (p.giocata_il at time zone 'Europe/Rome')::date))
  from giocatori g left join partite p on p.giocatore_id = g.id
  where g.id = giocatore_da_token(p_token)
  group by g.nome
$$;

-- Cancella il mio profilo (serve il codice segreto)
create or replace function public.cancella_profilo(p_token text, p_pin text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare r giocatori%rowtype;
begin
  select * into r from giocatori where id = giocatore_da_token(p_token);
  if not found then return json_build_object('errore', 'non_collegato'); end if;
  if extensions.crypt(coalesce(p_pin, ''), r.pin_hash) <> r.pin_hash then return json_build_object('errore', 'codice_sbagliato'); end if;
  delete from giocatori where id = r.id;
  return json_build_object('ok', true);
end $$;

-- Solo le funzioni "pubbliche" si possono chiamare dal browser
revoke all on all functions in schema public from public, anon, authenticated;
grant execute on function public.registra(text, text), public.accedi(text, text), public.chi_sono(text), public.esci(text),
  public.salva_partita(text, int, boolean, text, text, int), public.classifica(text), public.il_mio_profilo(text),
  public.cancella_profilo(text, text) to anon, authenticated;
