
import React, { useState, useMemo } from 'react';
import { useData } from '../src/contexts/DataContext';
import { Plus, Calendar, MapPin, ChevronRight, X, Loader2, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Events: React.FC = () => {
  const { events, addEvent, archiveEvent, loading: dataLoading } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    venue: '',
    start_date: '',
    end_date: '',
    notes: ''
  });

  // Sort events by start_date (ascending) and filter out archived
  const sortedEvents = useMemo(() => {
    return [...events]
      .filter(e => !e.archived)
      .sort((a, b) => {
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      });
  }, [events]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    try {
      await addEvent(formData);
      setIsModalOpen(false);
      setFormData({ name: '', city: '', venue: '', start_date: '', end_date: '', notes: '' });
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar evento');
    } finally {
      setLoading(false);
    }
  };

  const formatDateRange = (start?: string, end?: string) => {
    if (!start) return 'Data não definida';
    const s = new Date(start).toLocaleDateString();
    if (!end || end === start) return s;
    return `${s} - ${new Date(end).toLocaleDateString()}`;
  };

  if (dataLoading && events.length === 0) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Eventos</h1>
          <p className="text-slate-500">Gerencie seu portfólio de eventos.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-100"
        >
          <Plus className="w-5 h-5" /> Novo Evento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedEvents.map(event => (
          <div key={event.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all group flex flex-col">
            <div className="p-6 flex-1">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">{event.name}</h2>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-700">{event.venue || 'Local a definir'}</p>
                    <p className="text-xs text-slate-400">{event.city || 'Cidade não definida'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{formatDateRange(event.start_date, event.end_date)}</span>
                </div>
              </div>

              {event.notes && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <p className="text-xs text-slate-400 italic line-clamp-2">{event.notes}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Link
                to={`/events/${event.id}`}
                className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                Ver Patrocinadores <ChevronRight className="w-4 h-4" />
              </Link>
              <button
                onClick={async () => {
                  try {
                    await archiveEvent(event.id);
                  } catch (error) {
                    console.error(error);
                    alert('Erro ao arquivar evento');
                  }
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
                title="Arquivar evento"
              >
                <Archive className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {events.length === 0 && !dataLoading && (
          <div className="col-span-full py-20 text-center bg-white border border-dashed rounded-2xl">
            <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Nenhum evento cadastrado.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl text-slate-800">Cadastrar Novo Evento</h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-0.5">Ficha Básica</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome do Evento *</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-300 transition-all font-medium"
                  placeholder="Ex: Summit Tech 2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cidade</label>
                  <input
                    type="text"
                    value={formData.city}
                    placeholder="Ex: São Paulo"
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-300 transition-all"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Local (Venue)</label>
                  <input
                    type="text"
                    value={formData.venue}
                    placeholder="Ex: Expo Center Norte"
                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-300 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data de Início</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data de Término</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notas Adicionais</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Informações gerais sobre o evento..."
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-300 transition-all min-h-[80px]"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
