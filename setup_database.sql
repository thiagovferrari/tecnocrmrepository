
-- Garantir que a extensão existe
create extension if not exists "uuid-ossp";

-- Recriar tabelas com permissões corretas (pode rodar várias vezes sem erro)

-- Tabela de EMPRESAS
create table if not exists companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  segment text,
  notes text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de EVENTOS
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

-- Tabela de RELAÇÕES (Eventos <-> Empresas)
create table if not exists event_companies (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null,
  company_id uuid references companies(id) on delete cascade not null,
  status text not null, -- Simplificado para text para evitar erros de enum por enquanto s n tiver criado
  value_expected numeric,
  value_closed numeric,
  next_action text,
  next_action_date timestamp with time zone,
  responsible text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de CONTATOS
create table if not exists contacts (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references companies(id) on delete cascade not null,
  name text not null,
  email text,
  whatsapp text,
  role text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table companies enable row level security;
alter table events enable row level security;
alter table event_companies enable row level security;
alter table contacts enable row level security;

-- POLÍTICAS DE ACESSO TOTAL (CRUD)
-- Remove políticas antigas para garantir limpeza
drop policy if exists "Acesso Total Empresas" on companies;
drop policy if exists "Acesso Total Eventos" on events;
drop policy if exists "Acesso Total Relacoes" on event_companies;
drop policy if exists "Acesso Total Contatos" on contacts;

-- Cria novas políticas irrestritas (para fins de desenvolvimento/autorizado pelo usuário)
create policy "Acesso Total Empresas" on companies for all using (true) with check (true);
create policy "Acesso Total Eventos" on events for all using (true) with check (true);
create policy "Acesso Total Relacoes" on event_companies for all using (true) with check (true);
create policy "Acesso Total Contatos" on contacts for all using (true) with check (true);
