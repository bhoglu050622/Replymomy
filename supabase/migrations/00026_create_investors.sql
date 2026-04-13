create table investors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  investment_type text not null,
  investment_range text not null,
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table investors enable row level security;

create policy "anyone can submit investor interest"
  on investors for insert
  to anon, authenticated
  with check (true);

create policy "service role reads investors"
  on investors for select
  to service_role
  using (true);

create policy "service role updates investors"
  on investors for update
  to service_role
  using (true);
