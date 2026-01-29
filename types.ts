
export enum SponsorshipStatus {
  CONTATO_FEITO = 'CONTATO_FEITO',
  NEGOCIACAO = 'NEGOCIACAO',
  PENDENCIA_A_RESOLVER = 'PENDENCIA_A_RESOLVER',
  CONTRATO_ENVIADO = 'CONTRATO_ENVIADO',
  CONTRATO_ASSINADO = 'CONTRATO_ASSINADO',
  FECHADO_PAGO = 'FECHADO_PAGO',
  PERDIDO = 'PERDIDO'
}

export interface Event {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  city?: string;
  venue?: string;
  notes?: string;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  whatsapp?: string;
  role?: string;
}

export interface Company {
  id: string;
  name: string;
  segment?: string;
  notes?: string;
  tags?: string[];
  contacts: Contact[];
  created_at: string;
}

export interface EventCompany {
  id: string;
  event_id: string;
  company_id: string;
  status: SponsorshipStatus;
  value_expected?: number;
  value_closed?: number;
  next_action?: string;
  next_action_date?: string;
  responsible?: string;
  updated_at: string;
  created_at: string;
}

export interface FullEventCompany extends EventCompany {
  company_name: string;
  event_name: string;
}
