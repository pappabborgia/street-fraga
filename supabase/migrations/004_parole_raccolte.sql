-- Vocabolario del dialetto fragagnanese raccolto dai giocatori: "come si dice X in fragagnanese?"
create table if not exists public.parole_raccolte (
  id bigserial primary key,
  italiano text not null,
  dialetto text not null,
  giocatore_id uuid references public.giocatori(id) on delete set null,
  creata_il timestamptz not null default now()
);
create index if not exists parole_italiano on public.parole_raccolte (italiano);
alter table public.parole_raccolte enable row level security;
revoke all on public.parole_raccolte from anon, authenticated;

create or replace function public.proponi_parola(p_token text, p_italiano text, p_dialetto text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  d text := btrim(regexp_replace(coalesce(p_dialetto, ''), '\s+', ' ', 'g'));
  i text := btrim(coalesce(p_italiano, ''));
begin
  if char_length(i) not between 1 and 40 then return json_build_object('errore', 'parola_non_valida'); end if;
  if char_length(d) not between 1 and 60 or d !~ '^[[:alpha:]''’ .,!?-]+$' then return json_build_object('errore', 'risposta_non_valida'); end if;
  -- freno contro gli invii a raffica: al massimo 30 parole al minuto da tutto il gioco
  if (select count(*) from parole_raccolte where creata_il > now() - interval '1 minute') >= 30 then
    return json_build_object('errore', 'troppe');
  end if;
  insert into parole_raccolte (italiano, dialetto, giocatore_id) values (i, d, giocatore_da_token(p_token));
  return json_build_object('ok', true, 'raccolte', (select count(*) from parole_raccolte));
end $$;

revoke all on function public.proponi_parola(text, text, text) from public, anon, authenticated;
grant execute on function public.proponi_parola(text, text, text) to anon, authenticated;
