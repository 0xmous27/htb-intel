-- Run this in Supabase SQL Editor

create table if not exists bb_reports (
  id text primary key,
  category text not null,
  severity text not null,
  bounty text,
  platform text,
  program text,
  title text not null,
  description text,
  steps text,
  payload text,
  tags text[],
  created_at timestamptz default now()
);

create table if not exists techniques (
  id text primary key,
  category text not null,
  name text not null,
  purpose text,
  when_to_use text,
  command text not null,
  description text,
  tags text[],
  created_at timestamptz default now()
);

create table if not exists cves (
  id text primary key,
  name text not null,
  severity text not null,
  service text,
  affected text,
  description text,
  exploit text,
  msf text,
  manual text,
  tags text[],
  created_at timestamptz default now()
);

create table if not exists tools (
  id text primary key,
  name text not null,
  category text,
  description text,
  install text,
  usage text,
  tags text[],
  created_at timestamptz default now()
);

create table if not exists tricks (
  id text primary key,
  category text not null,
  title text not null,
  source text,
  description text,
  cmd text,
  tags text[],
  created_at timestamptz default now()
);

create table if not exists wordlists (
  id text primary key,
  name text not null,
  category text,
  path text,
  description text,
  size text,
  tags text[],
  created_at timestamptz default now()
);

create table if not exists services (
  id text primary key,
  name text not null,
  port text,
  protocol text,
  description text,
  enum_cmd text,
  attacks text,
  cves_list text,
  notes text,
  tags text[],
  created_at timestamptz default now()
);

create table if not exists oob_payloads (
  id text primary key,
  category text not null,
  title text not null,
  description text,
  when_to_use text,
  setup text,
  payload text,
  note text,
  tags text[],
  created_at timestamptz default now()
);

create table if not exists regex_ref (
  id text primary key,
  category text,
  name text not null,
  pattern text not null,
  description text,
  tags text[],
  created_at timestamptz default now()
);

create table if not exists ports (
  id text primary key,
  port text not null,
  protocol text,
  service text,
  description text,
  tags text[],
  created_at timestamptz default now()
);

create table if not exists checklists (
  id text primary key,
  category text not null,
  title text not null,
  phase text,
  items text,
  tags text[],
  created_at timestamptz default now()
);

create table if not exists gtfobins (
  id text primary key,
  bin_name text not null,
  bin_function text not null,
  os text,
  description text,
  cmd text,
  tags text[],
  created_at timestamptz default now()
);

-- Enable RLS on all tables — anon: read-only, service_role bypasses RLS entirely
do $$ declare t text;
begin
  foreach t in array array['bb_reports','techniques','cves','tools','tricks','wordlists','services','oob_payloads','regex_ref','ports','checklists','gtfobins']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "sel_%s" on %I', t, t);
    execute format('drop policy if exists "ins_%s" on %I', t, t);
    execute format('drop policy if exists "upd_%s" on %I', t, t);
    execute format('drop policy if exists "del_%s" on %I', t, t);
    -- also drop legacy policy names
    execute format('drop policy if exists "read_%s" on %I', t, t);
    execute format('drop policy if exists "write_%s" on %I', t, t);
    -- anon: SELECT only
    execute format('create policy "sel_%s" on %I for select using (true)', t, t);
    -- anon: block INSERT/UPDATE/DELETE
    execute format('create policy "ins_%s" on %I for insert with check (false)', t, t);
    execute format('create policy "upd_%s" on %I for update using (false)', t, t);
    execute format('create policy "del_%s" on %I for delete using (false)', t, t);
  end loop;
end $$;

-- ── Migrations: add missing columns to existing tables ────────────────────────
alter table techniques   add column if not exists purpose     text;
alter table techniques   add column if not exists when_to_use text;
alter table cves         add column if not exists manual      text;
alter table services     add column if not exists attacks     text;
alter table services     add column if not exists cves_list   text;
alter table services     add column if not exists notes       text;
alter table oob_payloads add column if not exists when_to_use text;
alter table oob_payloads add column if not exists setup       text;
alter table oob_payloads add column if not exists note        text;
alter table checklists   add column if not exists phase       text;
alter table gtfobins     add column if not exists os          text;

-- ── Visitor counter ───────────────────────────────────────────────────────────
create table if not exists site_stats (
  id text primary key default 'global',
  visits bigint not null default 0
);

-- Seed the row
insert into site_stats (id, visits) values ('global', 0) on conflict do nothing;

-- RPC to atomically increment and return count
create or replace function increment_visits()
returns bigint language sql security definer as $$
  update site_stats set visits = visits + 1 where id = 'global' returning visits;
$$;

-- RLS: anon can select but not write directly
alter table site_stats enable row level security;
create policy "sel_site_stats" on site_stats for select using (true);
create policy "ins_site_stats" on site_stats for insert with check (false);
create policy "upd_site_stats" on site_stats for update using (false);
create policy "del_site_stats" on site_stats for delete using (false);

-- ── AD Techniques table ───────────────────────────────────────────────────────
create table if not exists ad_techniques (
  id text primary key,
  phase text not null,
  name text not null,
  cmd text not null,
  when_to_use text,
  tags text[],
  created_at timestamptz default now()
);

-- ── Quick Ref table ───────────────────────────────────────────────────────────
create table if not exists quick_ref (
  id text primary key,
  category text not null,
  name text not null,
  cmd text not null,
  tags text[],
  created_at timestamptz default now()
);

-- RLS for new tables
do $$ declare t text;
begin
  foreach t in array array['ad_techniques','quick_ref']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "sel_%s" on %I for select using (true)', t, t);
    execute format('create policy "ins_%s" on %I for insert with check (false)', t, t);
    execute format('create policy "upd_%s" on %I for update using (false)', t, t);
    execute format('create policy "del_%s" on %I for delete using (false)', t, t);
  end loop;
end $$;
