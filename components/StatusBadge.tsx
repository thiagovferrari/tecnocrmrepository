
import React from 'react';
import { SponsorshipStatus } from '../types';

const statusConfig: Record<SponsorshipStatus, { label: string; color: string }> = {
  [SponsorshipStatus.CONTATO_FEITO]: { label: 'Contato Feito', color: 'bg-blue-100 text-blue-700' },
  [SponsorshipStatus.NEGOCIACAO]: { label: 'Em Negociação', color: 'bg-yellow-100 text-yellow-800' },
  [SponsorshipStatus.PENDENCIA_A_RESOLVER]: { label: 'Pendência!', color: 'bg-red-100 text-red-700 border border-red-200 animate-pulse' },
  [SponsorshipStatus.CONTRATO_ENVIADO]: { label: 'Contrato Enviado', color: 'bg-orange-100 text-orange-700' },
  [SponsorshipStatus.CONTRATO_ASSINADO]: { label: 'Contrato Assinado', color: 'bg-cyan-100 text-cyan-700' },
  [SponsorshipStatus.FECHADO_PAGO]: { label: 'Fechado & Pago', color: 'bg-green-100 text-green-700' },
  [SponsorshipStatus.PERDIDO]: { label: 'Perdido', color: 'bg-slate-400 text-white' },
};

export const StatusBadge: React.FC<{ status: SponsorshipStatus }> = ({ status }) => {
  const config = statusConfig[status];
  if (!config) return null;
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase whitespace-nowrap ${config.color}`}>
      {config.label}
    </span>
  );
};
