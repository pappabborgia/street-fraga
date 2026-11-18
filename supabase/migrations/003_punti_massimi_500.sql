-- Con il bonus velocità e il livello difficile una partita può superare i 300 punti.
alter table public.partite drop constraint if exists partite_punti_check;
alter table public.partite add constraint partite_punti_check check (punti between 0 and 500);
create or replace function public.salva_partita(p_token text, p_punti int, p_vinta boolean, p_personaggio text, p_avversario text, p_livello int)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare g uuid := giocatore_da_token(p_token);
begin
  if g is null then return json_build_object('errore', 'non_collegato'); end if;
  insert into partite (giocatore_id, punti, vinta, personaggio, avversario, livello)
  values (g, least(greatest(p_punti, 0), 500), p_vinta, left(p_personaggio, 30), left(p_avversario, 30), p_livello);
  return json_build_object('ok', true);
end $$;
revoke all on function public.salva_partita(text, int, boolean, text, text, int) from public;
grant execute on function public.salva_partita(text, int, boolean, text, text, int) to anon, authenticated;
