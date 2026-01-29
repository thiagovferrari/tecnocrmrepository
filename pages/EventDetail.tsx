import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../src/contexts/DataContext';
import { SponsorshipStatus, Contact } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, Search, Plus, Download, Edit3, Save, X, UserPlus, Trash2, MapPin, Calendar, Loader2 } from 'lucide-react';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, companies, relations, addRelation, updateRelation, addCompany, loading: dataLoading } = useData();

  const event = events.find(e => e.id === id);
  const eventRelations = relations.filter(r => r.event_id === id);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<string | null>(null);

  if (dataLoading) return <div className="min-h-screen flex text-blue-600 font-bold items-center justify-center p-8"><Loader2 className="animate-spin mr-2" /> Carregando dados...</div>;

  if (!event) return <div className="p-8 text-center font-medium text-slate-500">Evento não encontrado.</div>;

  const filteredRelations = useMemo(() => {
    return eventRelations.filter(r => {
      const company = companies.find(c => c.id === r.company_id);
      const matchesSearch = company?.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [eventRelations, companies, search, statusFilter]);

  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || 'Nova Empresa...';

  const formatDateRange = (start?: string, end?: string) => {
    if (!start) return 'Data não definida';
    const s = new Date(start).toLocaleDateString();
    if (!end || end === start) return s;
    return `${s} - ${new Date(end).toLocaleDateString()}`;
  };

  const exportToCSV = () => {
    const headers = ['Empresa,Status,Valor Esperado,Valor Fechado,Próxima Ação,Data Ação'];
    const rows = filteredRelations.map(r => {
      const company = companies.find(c => c.id === r.company_id);
      return `"${company?.name}","${r.status}","${r.value_expected || 0}","${r.value_closed || 0}","${r.next_action || ''}","${r.next_action_date || ''}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `patrocinadores_${event.name.replace(/\s/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/events')}
            className="p-2 hover:bg-white border border-slate-200 rounded-lg transition-colors text-slate-600 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{event.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                {event.venue ? `${event.venue}, ${event.city}` : event.city || 'Local a definir'}
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                {formatDateRange(event.start_date, event.end_date)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-2 text-sm font-bold text-slate-600 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-100"
          >
            <Plus className="w-4 h-4" /> Add Empresa
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome da empresa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-400 transition-all"
          />
        </div>
        <div className="relative min-w-[200px]">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none transition-all cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            {Object.values(SponsorshipStatus).map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <X className="w-4 h-4 rotate-45" />
          </div>
        </div>
      </div>

      {/* Sponsorship Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Empresa</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Próxima Ação</th>
                <th className="px-6 py-4">Expectativa</th>
                <th className="px-6 py-4">Responsável</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRelations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic font-medium">Nenhuma empresa vinculada com os filtros atuais.</td>
                </tr>
              ) : (
                filteredRelations.map(rel => (
                  <tr key={rel.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-800 text-sm">{getCompanyName(rel.company_id)}</p>
                      <button
                        onClick={() => navigate(`/companies/${rel.company_id}`)}
                        className="text-[10px] text-blue-500 hover:text-blue-700 font-bold mt-0.5 transition-colors"
                      >
                        Ver Detalhes →
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => setIsEditModalOpen(rel.id)}
                        className="hover:scale-105 active:scale-95 transition-transform flex"
                        title="Clique para alterar o status"
                      >
                        <StatusBadge status={rel.status} />
                      </button>
                    </td>
                    <td className="px-6 py-5 max-w-xs">
                      <p className="text-sm text-slate-600 truncate font-medium">{rel.next_action || '-'}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{rel.next_action_date ? new Date(rel.next_action_date).toLocaleDateString() : ''}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-800">R$ {rel.value_expected?.toLocaleString() || '0'}</p>
                      {rel.value_closed && rel.value_closed > 0 && (
                        <p className="text-[10px] text-green-600 font-black mt-0.5 uppercase">Pago: R$ {rel.value_closed.toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{rel.responsible || 'Sem resp.'}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => setIsEditModalOpen(rel.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-xs font-bold shadow-sm"
                        title="Gerenciar Negociação"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Relation Modal */}
      {isAddModalOpen && (
        <AddRelationModal
          eventId={event.id}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* Edit Relation Modal */}
      {isEditModalOpen && (
        <EditRelationModal
          relationId={isEditModalOpen}
          onClose={() => setIsEditModalOpen(null)}
        />
      )}
    </div>
  );
};

const AddRelationModal: React.FC<{ eventId: string; onClose: () => void; }> = ({ eventId, onClose }) => {
  const { companies: existingCompanies, addCompany, addRelation } = useData();
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newCompanyData, setNewCompanyData] = useState({
    name: '',
    segment: '',
    contacts: [{ id: crypto.randomUUID(), name: '', email: '', whatsapp: '', role: '' }] as Contact[]
  });

  const [status, setStatus] = useState<SponsorshipStatus>(SponsorshipStatus.CONTATO_FEITO);
  const [expectedValue, setExpectedValue] = useState('');
  const [error, setError] = useState('');

  const addContactRow = () => {
    setNewCompanyData({
      ...newCompanyData,
      contacts: [...newCompanyData.contacts, { id: crypto.randomUUID(), name: '', email: '', whatsapp: '', role: '' }]
    });
  };

  const removeContactRow = (id: string) => {
    if (newCompanyData.contacts.length <= 1) return;
    setNewCompanyData({
      ...newCompanyData,
      contacts: newCompanyData.contacts.filter(c => c.id !== id)
    });
  };

  const updateContact = (id: string, field: keyof Contact, value: string) => {
    setNewCompanyData({
      ...newCompanyData,
      contacts: newCompanyData.contacts.map(c => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const handleAdd = async () => {
    setError('');
    setLoading(true);
    try {
      let finalCompanyId = selectedCompanyId;

      if (isCreatingCompany) {
        if (!newCompanyData.name) throw new Error('Dê um nome para a empresa.');

        const validContacts = newCompanyData.contacts.filter(c => c.name.trim() !== '');

        const newCompany = await addCompany({
          name: newCompanyData.name,
          segment: newCompanyData.segment,
          contacts: validContacts as any
        });

        finalCompanyId = newCompany?.id;
      }

      if (!finalCompanyId && !isCreatingCompany) throw new Error('Selecione uma empresa.');

      await addRelation({
        event_id: eventId,
        company_id: finalCompanyId,
        status: status,
        value_expected: Number(expectedValue) || 0,
        next_action: '',
        next_action_date: null, // ← ERA '' AGORA É null!
        responsible: ''
      });
      onClose();
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Erro ao vincular.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="font-bold text-lg text-slate-800">Vincular Patrocinador</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 transition-colors"><X /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {error && <p className="text-red-600 text-[10px] font-black uppercase bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setIsCreatingCompany(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isCreatingCompany ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Empresa Existente
            </button>
            <button
              onClick={() => setIsCreatingCompany(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isCreatingCompany ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Cadastrar Nova Empresa
            </button>
          </div>

          {!isCreatingCompany ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Selecione no Banco de Dados</label>
                <select
                  value={selectedCompanyId}
                  onChange={e => setSelectedCompanyId(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer font-medium"
                >
                  <option value="">Buscar empresa...</option>
                  {existingCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome da Empresa *</label>
                  <input
                    type="text"
                    value={newCompanyData.name}
                    onChange={e => setNewCompanyData({ ...newCompanyData, name: e.target.value })}
                    placeholder="Ex: Amazon"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-300 transition-all"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Segmento</label>
                  <input
                    type="text"
                    value={newCompanyData.segment}
                    onChange={e => setNewCompanyData({ ...newCompanyData, segment: e.target.value })}
                    placeholder="Ex: Tecnologia"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-300 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-blue-500" /> Contatos Iniciais
                  </h4>
                  <button
                    type="button"
                    onClick={addContactRow}
                    className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                  >
                    + Adicionar
                  </button>
                </div>

                <div className="space-y-4">
                  {newCompanyData.contacts.map((contact, index) => (
                    <div key={contact.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 relative group">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          placeholder="Nome do Contato"
                          value={contact.name}
                          onChange={e => updateContact(contact.id, 'name', e.target.value)}
                          className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                        />
                        <input
                          placeholder="Cargo"
                          value={contact.role}
                          onChange={e => updateContact(contact.id, 'role', e.target.value)}
                          className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                        />
                        <input
                          placeholder="Email"
                          value={contact.email}
                          onChange={e => updateContact(contact.id, 'email', e.target.value)}
                          className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                        />
                        <input
                          placeholder="WhatsApp"
                          value={contact.whatsapp}
                          onChange={e => updateContact(contact.id, 'whatsapp', e.target.value)}
                          className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                        />
                      </div>
                      {newCompanyData.contacts.length > 1 && (
                        <button
                          onClick={() => removeContactRow(contact.id)}
                          className="absolute -top-2 -right-2 bg-white border border-slate-200 text-red-500 p-1 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status da Negociação</label>
                <select value={status} onChange={e => setStatus(e.target.value as SponsorshipStatus)} className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer font-medium">
                  {Object.values(SponsorshipStatus).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expectativa (R$)</label>
                <input
                  type="number"
                  value={expectedValue}
                  onChange={e => setExpectedValue(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-300 transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 sticky bottom-0 z-10">
          <button onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-white transition-colors bg-white">Cancelar</button>
          <button onClick={handleAdd} disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-50">{loading ? 'Vinculando...' : 'Vincular Agora'}</button>
        </div>
      </div>
    </div>
  );
};

const EditRelationModal: React.FC<{ relationId: string; onClose: () => void; }> = ({ relationId, onClose }) => {
  const { relations, companies, updateRelation } = useData();
  const rel = relations.find(r => r.id === relationId);
  const company = companies.find(c => c.id === rel?.company_id);
  const [loading, setLoading] = useState(false);

  // Helper function to convert date from ISO to YYYY-MM-DD (local time, no timezone offset)
  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return '';
    // Se a data já está no formato YYYY-MM-DD, retorna direto
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Caso contrário, converte da ISO para local
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    status: rel?.status || SponsorshipStatus.CONTATO_FEITO,
    value_expected: rel?.value_expected || 0,
    value_closed: rel?.value_closed || 0,
    next_action: rel?.next_action || '',
    next_action_date: formatDateForInput(rel?.next_action_date), // Preserva a data existente
    responsible: rel?.responsible || ''
  });

  if (!rel) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateRelation(relationId, formData);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-slate-800">{company?.name}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Atualizar Negociação</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X /></button>
        </div>
        <div className="p-8 grid grid-cols-2 gap-6">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status Atual</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as SponsorshipStatus })}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer font-medium"
            >
              {Object.values(SponsorshipStatus).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Responsável</label>
            <input
              type="text"
              value={formData.responsible}
              onChange={e => setFormData({ ...formData, responsible: e.target.value })}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-400 transition-all"
              placeholder="Nome do consultor"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valor Esperado (R$)</label>
            <input
              type="number"
              value={formData.value_expected}
              onChange={e => setFormData({ ...formData, value_expected: Number(e.target.value) })}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valor Fechado (R$)</label>
            <input
              type="number"
              value={formData.value_closed}
              onChange={e => setFormData({ ...formData, value_closed: Number(e.target.value) })}
              className="w-full bg-green-50/30 border border-green-200 text-green-700 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-bold"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Próxima Ação Agendada</label>
            <textarea
              value={formData.next_action}
              onChange={e => setFormData({ ...formData, next_action: e.target.value })}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-400 transition-all min-h-[100px]"
              placeholder="Ex: Ligar para confirmar envio do logo..."
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data Limite da Ação</label>
            <input
              type="date"
              value={formData.next_action_date}
              onChange={e => setFormData({ ...formData, next_action_date: e.target.value })}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
            />
          </div>
        </div>
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-white transition-all bg-white">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
};
