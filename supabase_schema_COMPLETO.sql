-- ============================================
-- SCRIPT SQL COMPLETO - TECNOCRM SUPABASE
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Habilita UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Cria o ENUM de status (se ainda não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sponsorship_status') THEN
        CREATE TYPE sponsorship_status AS ENUM (
            'CONTATO_FEITO', 
            'NEGOCIACAO', 
            'PENDENCIA_A_RESOLVER',
            'CONTRATO_ENVIADO', 
            'CONTRATO_ASSINADO', 
            'FECHADO_PAGO', 
            'PERDIDO'
        );
    END IF;
END $$;

-- 3. Cria tabela de EMPRESAS (se não existir)
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    segment TEXT,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Cria tabela de EVENTOS (se não existir)
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    city TEXT,
    venue TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Cria tabela de CONTATOS (se não existir)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    whatsapp TEXT,
    role TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Cria tabela de RELAÇÃO EVENTO-EMPRESA (CRÍTICA!)
CREATE TABLE IF NOT EXISTS event_companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    status sponsorship_status DEFAULT 'CONTATO_FEITO'::sponsorship_status NOT NULL,
    value_expected NUMERIC,
    value_closed NUMERIC,
    next_action TEXT,
    next_action_date TIMESTAMPTZ,
    responsible TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Cria índices para performance
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_event_companies_event_id ON event_companies(event_id);
CREATE INDEX IF NOT EXISTS idx_event_companies_company_id ON event_companies(company_id);

-- 8. HABILITA ROW LEVEL SECURITY (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_companies ENABLE ROW LEVEL SECURITY;

-- 9. REMOVE políticas antigas (se existirem) e cria novas
DROP POLICY IF EXISTS "Liberar Geral" ON companies;
DROP POLICY IF EXISTS "Liberar Geral" ON events;
DROP POLICY IF EXISTS "Liberar Geral" ON contacts;
DROP POLICY IF EXISTS "Liberar Geral" ON event_companies;

-- 10. CRIA POLÍTICAS DE ACESSO TOTAL (para usuários autenticados)
CREATE POLICY "Acesso Total Autenticado" ON companies
    FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Acesso Total Autenticado" ON events
    FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Acesso Total Autenticado" ON contacts
    FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Acesso Total Autenticado" ON event_companies
    FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 11. Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Trigger para atualizar updated_at em event_companies
DROP TRIGGER IF EXISTS update_event_companies_updated_at ON event_companies;
CREATE TRIGGER update_event_companies_updated_at
    BEFORE UPDATE ON event_companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICAÇÃO (rode depois)
-- ============================================

-- Verifica se as tabelas foram criadas
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'events', 'contacts', 'event_companies')
ORDER BY tablename;

-- Verifica se o ENUM foi criado
SELECT typname FROM pg_type WHERE typname = 'sponsorship_status';

-- Verifica políticas RLS
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
