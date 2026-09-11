create or replace function salon.reset_outlet_transactions(p_outlet_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = salon, public
as $$
declare
  v_role text;
  v_deleted integer;
begin
  select role into v_role
  from salon.profiles
  where id = auth.uid()
    and active = true;

  if v_role is distinct from 'owner' then
    raise exception 'Only the active owner can reset outlet transactions.';
  end if;

  if not exists (select 1 from salon.outlets where id = p_outlet_id) then
    raise exception 'Outlet not found.';
  end if;

  delete from salon.transactions
  where outlet_id = p_outlet_id;

  get diagnostics v_deleted = row_count;

  return jsonb_build_object(
    'success', true,
    'outlet_id', p_outlet_id,
    'transactions_deleted', v_deleted,
    'other_outlets_untouched', true
  );
end;
$$;

revoke execute on function salon.reset_outlet_transactions(uuid) from public;
revoke execute on function salon.reset_outlet_transactions(uuid) from anon;
grant execute on function salon.reset_outlet_transactions(uuid) to authenticated;

notify pgrst, 'reload schema';
