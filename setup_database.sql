
-- Garantir que a extensão existe
create extension if not exists "uuid-ossp";

-- 1. ESTRUTURA (Tabelas)
create table if not exists companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  segment text,
  notes text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists events (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  start_date date,
  end_date date,
  city text,
  venue text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists event_companies (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null,
  company_id uuid references companies(id) on delete cascade not null,
  status text not null, 
  value_expected numeric,
  value_closed numeric,
  next_action text,
  next_action_date timestamp with time zone,
  responsible text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists contacts (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references companies(id) on delete cascade not null,
  name text not null,
  email text,
  whatsapp text,
  role text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. SEGURANÇA (RLS)
alter table companies enable row level security;
alter table events enable row level security;
alter table event_companies enable row level security;
alter table contacts enable row level security;

-- Limpar antigas
drop policy if exists "Acesso Total Empresas" on companies;
drop policy if exists "Acesso Total Eventos" on events;
drop policy if exists "Acesso Total Relacoes" on event_companies;
drop policy if exists "Acesso Total Contatos" on contacts;

-- Criar novas
create policy "Acesso Total Empresas" on companies for all using (true) with check (true);
create policy "Acesso Total Eventos" on events for all using (true) with check (true);
create policy "Acesso Total Relacoes" on event_companies for all using (true) with check (true);
create policy "Acesso Total Contatos" on contacts for all using (true) with check (true);

-- 3. REALTIME (IMPORTANTE: Mágica do Tempo Real)
-- Adiciona tabelas à publicação realtime do Supabase
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table companies, events, event_companies, contacts;
