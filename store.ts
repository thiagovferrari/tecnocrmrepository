
import { Event, Company, EventCompany, SponsorshipStatus, Contact } from './types';

const STORAGE_KEYS = {
  EVENTS: 'tecnocrm_events',
  COMPANIES: 'tecnocrm_companies',
  RELATIONS: 'tecnocrm_relations',
};

// Initial data for MVP demo
const initialEvents: Event[] = [
  { id: 'e1', name: 'Web Summit 2024', city: 'Lisboa', venue: 'MEO Arena', start_date: '2024-11-11', end_date: '2024-11-14', created_at: new Date().toISOString() },
  { id: 'e2', name: 'Expo Digital BR', city: 'São Paulo', venue: 'São Paulo Expo', start_date: '2025-05-20', end_date: '2025-05-22', created_at: new Date().toISOString() },
];

const initialCompanies: Company[] = [
  { 
    id: 'c1', 
    name: 'Tech Solutions Ltd', 
    segment: 'Software', 
    contacts: [
      { id: 'ct1', name: 'Alice Silva', email: 'alice@tech.com', whatsapp: '11999999999', role: 'Gerente de Marketing' }
    ], 
    created_at: new Date().toISOString() 
  },
  { 
    id: 'c2', 
    name: 'Global Marketing Co', 
    segment: 'Marketing', 
    contacts: [
      { id: 'ct2', name: 'Bob Santos', email: 'bob@global.com', whatsapp: '11888888888', role: 'Diretor Comercial' },
      { id: 'ct3', name: 'Maria Lima', email: 'maria@global.com', role: 'Analista de Eventos' }
    ], 
    created_at: new Date().toISOString() 
  },
];

const initialRelations: EventCompany[] = [
  { 
    id: 'r1', 
    event_id: 'e1', 
    company_id: 'c1', 
    status: SponsorshipStatus.NEGOCIACAO, 
    value_expected: 5000, 
    next_action: 'Enviar contrato revisado',
    next_action_date: '2024-10-25',
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  { 
    id: 'r2', 
    event_id: 'e1', 
    company_id: 'c2', 
    status: SponsorshipStatus.PENDENCIA_A_RESOLVER, 
    value_expected: 12000, 
    next_action: 'Confirmar logo do patrocinador',
    next_action_date: '2024-10-20',
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
];

export const db = {
  getEvents: (): Event[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || JSON.stringify(initialEvents)),
  saveEvents: (events: Event[]) => localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events)),
  
  getCompanies: (): Company[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPANIES) || JSON.stringify(initialCompanies)),
  saveCompanies: (companies: Company[]) => localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies)),
  
  getRelations: (): EventCompany[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.RELATIONS) || JSON.stringify(initialRelations)),
  saveRelations: (relations: EventCompany[]) => localStorage.setItem(STORAGE_KEYS.RELATIONS, JSON.stringify(relations)),

  addEvent: (event: Omit<Event, 'id' | 'created_at'>) => {
    const events = db.getEvents();
    const newEvent = { ...event, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    db.saveEvents([...events, newEvent]);
    return newEvent;
  },

  addCompany: (company: Omit<Company, 'id' | 'created_at'>) => {
    const companies = db.getCompanies();
    const newCompany = { ...company, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    db.saveCompanies([...companies, newCompany]);
    return newCompany;
  },

  addRelation: (relation: Omit<EventCompany, 'id' | 'created_at' | 'updated_at'>) => {
    const relations = db.getRelations();
    // Check for uniqueness
    if (relations.some(r => r.event_id === relation.event_id && r.company_id === relation.company_id)) {
      throw new Error('Empresa já vinculada a este evento.');
    }
    const newRelation = { ...relation, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    db.saveRelations([...relations, newRelation]);
    return newRelation;
  },

  updateRelation: (id: string, updates: Partial<EventCompany>) => {
    const relations = db.getRelations();
    const index = relations.findIndex(r => r.id === id);
    if (index !== -1) {
      relations[index] = { ...relations[index], ...updates, updated_at: new Date().toISOString() };
      db.saveRelations(relations);
    }
  }
};
