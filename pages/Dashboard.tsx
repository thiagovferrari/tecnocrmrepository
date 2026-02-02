
import React, { useState, useMemo } from 'react';
import { useData } from '../src/contexts/DataContext';
import { SponsorshipStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { AlertCircle, Clock, TrendingUp, Users, DollarSign, Calendar as CalendarIcon, MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { events, companies, relations, loading } = useData();

  // Default to the first event if available, otherwise 'all'
  const [selectedEventId, setSelectedEventId] = useState<string>('all');

  // Update selected event if needed when events arrive
  React.useEffect(() => {
    if (events.length > 0 && selectedEventId === 'all') {
      // Optionally default to first? The user previously default to first.
      setSelectedEventId(events[0].id);
    }
  }, [events]);

  const sortedEvents = useMemo(() => {
    return [...events].filter(e => !e.archived).sort((a, b) => {
      if (!a.start_date) return 1;
      if (!b.start_date) return -1;
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    });
  }, [events]);

  const selectedEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId);
  }, [selectedEventId, events]);

  const filteredRelations = useMemo(() => {
    const activeRelations = relations.filter(r => !r.archived);
    return selectedEventId === 'all'
      ? activeRelations
      : activeRelations.filter(r => r.event_id === selectedEventId);
  }, [selectedEventId, relations]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(SponsorshipStatus).forEach(s => counts[s] = 0);

    let totalExpected = 0;
    let totalClosed = 0;

    filteredRelations.forEach(r => {
      counts[r.status] = (counts[r.status] || 0) + 1;
      totalExpected += r.value_expected || 0;
      totalClosed += r.value_closed || 0;
    });

    return { counts, totalExpected, totalClosed };
  }, [filteredRelations]);

  const pendencies = filteredRelations.filter(r => r.status === SponsorshipStatus.PENDENCIA_A_RESOLVER);
  const nextActions = filteredRelations
    .filter(r => r.next_action && r.status !== SponsorshipStatus.PERDIDO && r.status !== SponsorshipStatus.FECHADO_PAGO)
    .sort((a, b) => (a.next_action_date || '').localeCompare(b.next_action_date || ''))
    .slice(0, 5);

  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || 'Desconhecida';
  const getEventName = (id: string) => events.find(e => e.id === id)?.name || 'Evento';

  const formatDateRange = (start?: string, end?: string) => {
    if (!start) return 'Data não definida';
    const s = new Date(start).toLocaleDateString();
    if (!end || end === start) return s;
    return `${s} a ${new Date(end).toLocaleDateString()}`;
  };

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Prominent Event Selector */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm">Acompanhamento de metas e negociações.</p>
          </div>

          <div className="relative min-w-[280px]">
            <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest absolute -top-2 left-3 bg-white px-1 z-10">
              Evento em Foco
            </label>
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-4 pr-10 py-3 text-sm font-bold text-slate-700 appearance-none focus:border-blue-500 focus:ring-0 outline-none transition-all cursor-pointer"
              >
                <option value="all">📊 Visão Geral (Todos)</option>
                {sortedEvents.map(e => (
                  <option key={e.id} value={e.id}>📅 {e.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {selectedEvent && (
          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
              {formatDateRange(selectedEvent.start_date, selectedEvent.end_date)}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              {selectedEvent.venue ? `${selectedEvent.venue}, ${selectedEvent.city}` : selectedEvent.city || 'Local a definir'}
            </div>
            <Link to={`/events/${selectedEvent.id}`} className="text-xs font-bold text-blue-600 hover:underline ml-auto flex items-center gap-1">
              Ver lista completa do evento →
            </Link>
          </div>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Patrocinadores</p>
            <p className="text-2xl font-black text-slate-800">{filteredRelations.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-green-50 rounded-xl text-green-600"><DollarSign className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Valor Fechado</p>
            <p className="text-2xl font-black text-slate-800">R$ {stats.totalClosed.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Em Negociação</p>
            <p className="text-2xl font-black text-slate-800">R$ {stats.totalExpected.toLocaleString()}</p>
          </div>
        </div>
        <div className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] ${pendencies.length > 0 ? 'border-red-200 bg-red-50/10' : ''}`}>
          <div className={`p-3 rounded-xl ${pendencies.length > 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-tight ${pendencies.length > 0 ? 'text-red-500' : 'text-slate-400'}`}>Pendências</p>
            <p className={`text-2xl font-black ${pendencies.length > 0 ? 'text-red-600' : 'text-slate-800'}`}>{pendencies.length}</p>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(stats.counts).map(([status, count]) => (
          <div key={status} className="bg-white px-4 py-3 rounded-xl border border-slate-200 text-center shadow-sm hover:border-blue-200 transition-colors">
            <p className="text-[9px] text-slate-400 font-bold uppercase mb-1 truncate">{status.replace(/_/g, ' ')}</p>
            <p className="text-lg font-black text-slate-700">{count}</p>
          </div>
        ))}
      </div>

      {/* Operative Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgencies Card */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2 text-red-600 uppercase text-xs tracking-wider">
              <AlertCircle className="w-5 h-5" />
              Bloqueios & Pendências
            </h2>
            <span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-black">{pendencies.length}</span>
          </div>
          <div className="divide-y overflow-y-auto max-h-[420px] flex-1">
            {pendencies.length === 0 ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="text-sm">Fluxo limpo! Nenhuma pendência crítica.</p>
              </div>
            ) : (
              pendencies.map(r => (
                <Link to={`/events/${r.event_id}`} key={r.id} className="p-5 block hover:bg-red-50/30 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-black text-slate-800 group-hover:text-red-700 transition-colors">{getCompanyName(r.company_id)}</span>
                    {selectedEventId === 'all' && (
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">{getEventName(r.event_id)}</span>
                    )}
                  </div>
                  <div className="bg-white border-l-4 border-red-500 p-3 rounded-r-lg shadow-sm">
                    <p className="text-xs text-slate-600 italic font-medium">
                      {r.next_action || 'Descrição da pendência não preenchida.'}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Next Actions Card */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2 text-slate-800 uppercase text-xs tracking-wider">
              <Clock className="w-5 h-5 text-blue-500" />
              Próximos Passos
            </h2>
          </div>
          <div className="divide-y overflow-y-auto max-h-[420px] flex-1">
            {nextActions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                <Clock className="w-10 h-10 text-slate-200" />
                <p className="text-sm">Sem ações agendadas para o período.</p>
              </div>
            ) : (
              nextActions.map(r => (
                <div key={r.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{getCompanyName(r.company_id)}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{r.next_action}</p>
                    {selectedEventId === 'all' && (
                      <p className="text-[9px] text-slate-400 italic">No evento: {getEventName(r.event_id)}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100">
                      <p className="text-[10px] font-black uppercase leading-none mb-0.5">Prazo</p>
                      <p className="text-xs font-bold">{r.next_action_date ? new Date(r.next_action_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '--/--'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
