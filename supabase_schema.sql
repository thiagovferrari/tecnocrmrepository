
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- SponsorshipStatus enum
do $$ begin
    create type sponsorship_status as enum (
      'CONTATO_FEITO',
      'NEGOCIACAO',
      'PENDENCIA_A_RESOLVER',
      'CONTRATO_ENVIADO',
      'CONTRATO_ASSINADO',
      'FECHADO_PAGO',
      'PERDIDO'
    );
exception
    when duplicate_object then null;
end $$;

-- Events Table
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

-- Companies Table
create table if not exists companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  segment text,
  notes text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Contacts Table
create table if not exists contacts (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references companies(id) on delete cascade not null,
  name text not null,
  email text,
  whatsapp text,
  role text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Event Companies (Relation Table)
create table if not exists event_companies (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null,
  company_id uuid references companies(id) on delete cascade not null,
  status sponsorship_status default 'CONTATO_FEITO'::sponsorship_status not null,
  value_expected numeric,
  value_closed numeric,
  next_action text,
  next_action_date timestamp with time zone,
  responsible text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SECURITY POLICIES (RLS)
-- Enabling RLS on all tables
alter table events enable row level security;
alter table companies enable row level security;
alter table contacts enable row level security;
alter table event_companies enable row level security;

-- Creating policies to allow anonymous access for now (since no auth is implemented yet)
-- WARNING: In a production app with users, you should restrict this to authenticated users.

create policy "Enable all access for all users" on events for all using (true) with check (true);
create policy "Enable all access for all users" on companies for all using (true) with check (true);
create policy "Enable all access for all users" on contacts for all using (true) with check (true);
create policy "Enable all access for all users" on event_companies for all using (true) with check (true);
