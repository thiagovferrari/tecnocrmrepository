-- ============================================
-- MIGRATION: Adicionar campo "archived" nas tabelas
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Adiciona campo "archived" na tabela events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Adiciona campo "archived" na tabela companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Adiciona campo "archived" na tabela event_companies (relações)
ALTER TABLE event_companies 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_events_archived ON events(archived);
CREATE INDEX IF NOT EXISTS idx_companies_archived ON companies(archived);
CREATE INDEX IF NOT EXISTS idx_event_companies_archived ON event_companies(archived);

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name IN ('events', 'companies', 'event_companies') 
AND column_name = 'archived';
