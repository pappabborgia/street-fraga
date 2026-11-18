-- Pagina /gestione: una sola funzione, protetta da password.
-- Nel database c'è solo l'hash bcrypt della password (inserito a parte, non in questo file).
-- Dopo 5 password sbagliate la pagina resta bloccata 15 minuti.
create table if not exists gestione.accesso (
  id int primary key default 1 check (id = 1),
  hash text not null,
  tentativi int not null default 0,
  bloccato_fino timestamptz
);
revoke all on gestione.accesso from public, anon, authenticated;

create or replace function public.pannello_gestione(p_password text) returns json
language plpgsql security definer set search_path = public, gestione, extensions as $$
declare a gestione.accesso%rowtype;
begin
  select * into a from gestione.accesso where id = 1;
  if not found then return json_build_object('errore', 'password_non_impostata'); end if;
  if a.bloccato_fino is not null and a.bloccato_fino > now() then
    return json_build_object('errore', 'pausa', 'minuti', ceil(extract(epoch from (a.bloccato_fino - now())) / 60));
  end if;
  if extensions.crypt(coalesce(p_password, ''), a.hash) <> a.hash then
    if a.tentativi + 1 >= 5 then
      update gestione.accesso set tentativi = 0, bloccato_fino = now() + interval '15 minutes' where id = 1;
      return json_build_object('errore', 'pausa', 'minuti', 15);
    end if;
    update gestione.accesso set tentativi = a.tentativi + 1 where id = 1;
    return json_build_object('errore', 'password_sbagliata');
  end if;
  update gestione.accesso set tentativi = 0, bloccato_fino = null where id = 1;
  return json_build_object(
    'riepilogo', json_build_object(
      'giocatori', (select count(*) from public.giocatori),
      'partite', (select count(*) from public.partite),
      'partite_oggi', (select count(*) from public.partite where (giocata_il at time zone 'Europe/Rome')::date = (now() at time zone 'Europe/Rome')::date),
      'partite_settimana', (select count(*) from public.partite where giocata_il >= date_trunc('week', now())),
      'coppe', (select count(*) from public.coppe),
      'parole', (select count(*) from gestione.parole),
      'parole_confermate', (select count(*) from gestione.parole where confermata),
      'voti_parole', (select count(*) from public.voti_parole where not da_fonte)
    ),
    'giocatori', coalesce((select json_agg(g) from (select * from gestione.giocatori limit 500) g), '[]'::json),
    'classifica', coalesce((select json_agg(c) from public.classifica('sempre') c), '[]'::json),
    'classifica_settimana', coalesce((select json_agg(c) from public.classifica('settimana') c), '[]'::json),
    'per_giorno', coalesce((select json_agg(d) from (select * from gestione.partite_per_giorno limit 60) d), '[]'::json),
    'ultime_partite', coalesce((select json_agg(p) from (select * from gestione.partite limit 50) p), '[]'::json),
    'parole', coalesce((select json_agg(w) from (select * from gestione.parole limit 1000) w), '[]'::json)
  );
end $$;
revoke all on function public.pannello_gestione(text) from public, anon, authenticated;
grant execute on function public.pannello_gestione(text) to anon, authenticated;
