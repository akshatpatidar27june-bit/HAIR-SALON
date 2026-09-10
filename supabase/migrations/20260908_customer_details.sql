alter table salon.customers add column if not exists phone text;
alter table salon.customers add column if not exists address text;

create or replace function salon.owner_manager_list_customers(p_outlet_id uuid default null)
returns table(customer_id uuid, customer_name text, customer_phone text, customer_address text, created_at timestamptz)
language plpgsql security definer set search_path=salon,public as $$
declare v_role text; v_profile_outlet uuid; v_target uuid;
begin
  select p.role,p.outlet_id into v_role,v_profile_outlet from salon.profiles p where p.id=auth.uid() and p.active=true limit 1;
  if v_role not in ('owner','manager') then raise exception 'Only owner or manager can view customers'; end if;
  v_target:=case when v_role='manager' then v_profile_outlet else p_outlet_id end;
  if v_target is null then raise exception 'Select an outlet'; end if;
  return query select c.id,c.name,c.phone,c.address,c.created_at from salon.customers c where c.outlet_id=v_target order by c.created_at desc;
end $$;

grant execute on function salon.owner_manager_list_customers(uuid) to authenticated;

create or replace function salon.owner_manager_add_customer(p_name text,p_phone text,p_address text,p_outlet_id uuid default null)
returns json language plpgsql security definer set search_path=salon,public as $$
declare v_role text; v_profile_outlet uuid; v_target uuid; v_id uuid;
begin
  select p.role,p.outlet_id into v_role,v_profile_outlet from salon.profiles p where p.id=auth.uid() and p.active=true limit 1;
  if v_role not in ('owner','manager') then raise exception 'Only owner or manager can add customers'; end if;
  if coalesce(trim(p_name),'')='' then raise exception 'Customer name is required'; end if;
  if coalesce(trim(p_phone),'')='' then raise exception 'Mobile number is required'; end if;
  if coalesce(trim(p_address),'')='' then raise exception 'Address is required'; end if;
  v_target:=case when v_role='manager' then v_profile_outlet else p_outlet_id end;
  if v_target is null then raise exception 'Select an outlet'; end if;
  if not exists(select 1 from salon.outlets o where o.id=v_target and o.active=true) then raise exception 'Outlet is not active'; end if;
  insert into salon.customers(outlet_id,name,phone,address) values(v_target,trim(p_name),trim(p_phone),trim(p_address)) returning id into v_id;
  return json_build_object('success',true,'customer_id',v_id);
end $$;

grant execute on function salon.owner_manager_add_customer(text,text,text,uuid) to authenticated;
