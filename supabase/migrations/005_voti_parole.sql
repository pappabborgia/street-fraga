-- Conferma delle parole del dialetto a voti: una parola non è accettata subito,
-- diventa "confermata" quando almeno 5 persone dicono che è giusta e i sì sono almeno il triplo dei no.
create table if not exists public.voti_parole (
  id bigserial primary key,
  italiano text not null,
  dialetto text not null,
  giusto boolean not null,
  giocatore_id uuid references public.giocatori(id) on delete set null,
  da_fonte boolean not null default false, -- proposta iniziale presa da una fonte scritta
  creato_il timestamptz not null default now()
);
create index if not exists voti_italiano on public.voti_parole (italiano);
alter table public.voti_parole enable row level security;
revoke all on public.voti_parole from anon, authenticated;

-- Le parole già scritte dai giocatori contano come un "sì"
insert into public.voti_parole (italiano, dialetto, giusto, giocatore_id, creato_il)
select italiano, dialetto, true, giocatore_id, creata_il from public.parole_raccolte;

-- Proposte iniziali: parole salentine (variante del nord) dalla voce "Dialetti salentini"
insert into public.voti_parole (italiano, dialetto, giusto, da_fonte) values
 ('il gallo','lu jaddu',true,true), ('il gatto','lu jattu',true,true), ('il cavallo','lu cavaddu',true,true),
 ('il grano','lu cranu',true,true), ('il polpo','lu purpu',true,true), ('il pozzo','lu puzzu',true,true),
 ('il fiore','lu fiuru',true,true), ('il piede','lu pete',true,true), ('la bocca','la ucca',true,true),
 ('l''asino','lu ciucciu',true,true), ('il vino','lu mieru',true,true), ('la testa','la capu',true,true),
 ('la moglie','la mugghiere',true,true), ('l''uccello','l''auceddu',true,true), ('la tortora','la tùrtura',true,true),
 ('comprare','cattare',true,true), ('il sasso','la petra',true,true);

-- La proposta migliore per una parola: più sì che no, con i conteggi
create or replace function public.proposta_parola(p_italiano text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object('dialetto', dialetto, 'si', si, 'no', no, 'confermata', si >= 5 and si >= 3 * no)
  from (
    select min(dialetto) as dialetto, count(*) filter (where giusto) as si, count(*) filter (where not giusto) as no
    from voti_parole where italiano = p_italiano
    group by lower(dialetto)
  ) t
  order by (si - no) desc, si desc
  limit 1
$$;

create or replace function public.vota_parola(p_token text, p_italiano text, p_dialetto text, p_giusto boolean) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  d text := btrim(regexp_replace(coalesce(p_dialetto, ''), '\s+', ' ', 'g'));
  i text := btrim(coalesce(p_italiano, ''));
begin
  if char_length(i) not between 1 and 40 then return json_build_object('errore', 'parola_non_valida'); end if;
  if char_length(d) not between 1 and 60 or d !~ '^[[:alpha:]''’ .,!?-]+$' then return json_build_object('errore', 'risposta_non_valida'); end if;
  if (select count(*) from voti_parole where creato_il > now() - interval '1 minute') >= 60 then
    return json_build_object('errore', 'troppe');
  end if;
  insert into voti_parole (italiano, dialetto, giusto, giocatore_id) values (i, d, coalesce(p_giusto, true), giocatore_da_token(p_token));
  return json_build_object('ok', true, 'proposta', proposta_parola(i));
end $$;

-- Scrivere una parola nuova = proporla e votarla "giusta"
create or replace function public.proponi_parola(p_token text, p_italiano text, p_dialetto text) returns json
language sql security definer set search_path = public as $$
  select vota_parola(p_token, p_italiano, p_dialetto, true)
$$;

revoke all on function public.proposta_parola(text), public.vota_parola(text, text, text, boolean), public.proponi_parola(text, text, text) from public, anon, authenticated;
grant execute on function public.proposta_parola(text), public.vota_parola(text, text, text, boolean), public.proponi_parola(text, text, text) to anon, authenticated;

-- Parole con una proposta non ancora confermata: il gioco le chiede più spesso
create or replace function public.parole_da_confermare() returns setof text
language sql stable security definer set search_path = public as $$
  select p.italiano
  from (select distinct italiano from voti_parole) p
  where not coalesce((public.proposta_parola(p.italiano) ->> 'confermata')::boolean, false)
  limit 500
$$;
revoke all on function public.parole_da_confermare() from public, anon, authenticated;
grant execute on function public.parole_da_confermare() to anon, authenticated;
