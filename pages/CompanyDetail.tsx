
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../src/contexts/DataContext';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, Building2, Mail, Phone, Calendar, Tag, User, Users, Loader2, Edit3, Trash2, X, AlertCircle, UserPlus } from 'lucide-react';
import { Contact } from '../types';

export const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companies, events, relations, loading, updateCompany, deleteCompany } = useData();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const company = companies.find(c => c.id === id);
  const companyRelations = relations.filter(r => r.company_id === id);

  if (loading) return <div className="min-h-screen flex text-blue-600 font-bold items-center justify-center p-8"><Loader2 className="animate-spin mr-2" /> Carregando...</div>;
  if (!company) return <div className="p-8 text-center">Empresa não encontrada.</div>;

  const getEventName = (id: string) => events.find(e => e.id === id)?.name || 'Evento Desconhecido';

  const history = useMemo(() => {
    return companyRelations.map(r => ({
      ...r,
      eventName: getEventName(r.event_id)
    })).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [companyRelations, events]);

  const handleDelete = async () => {
    setLoadingAction(true);
    try {
      await deleteCompany(company.id);
      navigate('/companies');
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir empresa');
    } finally {
      setLoadingAction(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/companies')}
            className="p-2 hover:bg-white border rounded-lg transition-colors text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Ficha da Empresa</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2 text-sm font-bold transition-all"
          >
            <Edit3 className="w-4 h-4" />
            Editar Dados
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2 text-sm font-bold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Excluir Empresa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info & Contacts */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">{company.name}</h2>
              <p className="text-sm text-slate-500 font-medium">{company.segment || 'Segmento não informado'}</p>
            </div>

            <div className="space-y-6 border-t pt-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4" /> Contatos Principais
              </h3>

              <div className="space-y-4">
                {company.contacts && company.contacts.length > 0 ? (
                  company.contacts.map((contact) => (
                    <div key={contact.id} className="p-3 border rounded-lg bg-slate-50/50 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-slate-800 text-sm leading-tight">{contact.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium uppercase">{contact.role || 'Contato'}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {contact.email && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{contact.email}</span>
                          </div>
                        )}
                        {contact.whatsapp && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-green-500" />
                            <span>{contact.whatsapp}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">Nenhum contato cadastrado.</p>
                )}
              </div>
            </div>
          </section>

          {company.notes && (
            <section className="bg-slate-50 border border-dashed rounded-xl p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                <Tag className="w-3 h-3" /> Observações Internas
              </h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{company.notes}</p>
            </section>
          )}
        </div>

        {/* Event History */}
        <div className="lg:col-span-2">
          <section className="bg-white border rounded-xl shadow-sm overflow-hidden h-full">
            <div className="px-6 py-4 border-b bg-slate-50">
              <h2 className="font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Histórico em Eventos
              </h2>
            </div>
            <div className="divide-y">
              {history.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  Esta empresa ainda não participou de nenhum evento.
                </div>
              ) : (
                history.map(rel => (
                  <div key={rel.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Link to={`/events/${rel.event_id}`} className="font-bold text-slate-800 hover:text-blue-600 transition-colors block mb-1">
                          {rel.eventName}
                        </Link>
                        <StatusBadge status={rel.status} />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Última Atu.</p>
                        <p className="text-sm font-medium">{new Date(rel.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg text-sm border">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Expectativa</p>
                        <p className="font-semibold">R$ {rel.value_expected?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Fechado</p>
                        <p className="font-bold text-green-600">R$ {rel.value_closed?.toLocaleString() || '0'}</p>
                      </div>
                      {rel.next_action && (
                        <div className="col-span-2 pt-2 border-t border-slate-200">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Próxima Ação</p>
                          <p className="text-slate-600">{rel.next_action}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && <EditCompanyModal company={company} onClose={() => setIsEditModalOpen(false)} />}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-red-200">
            <div className="p-6 bg-red-50 border-b border-red-100 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="font-bold text-lg text-red-900">Confirmar Exclusão Permanente</h3>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-slate-700 font-semibold">
                Tem certeza que deseja excluir <strong>"{company.name}"</strong>?
              </p>
              <p className="text-sm text-slate-600">
                Esta ação é <strong>irreversível</strong> e apagará todos os dados da empresa, incluindo contatos e histórico de eventos.
              </p>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-white transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loadingAction}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingAction ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Edit Company Modal Component
const EditCompanyModal: React.FC<{ company: any; onClose: () => void }> = ({ company, onClose }) => {
  const { updateCompany } = useData();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: company.name || '',
    segment: company.segment || '',
    notes: company.notes || ''
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateCompany(company.id, formData);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Editar Dados da Empresa</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Atualizar Informações</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome da Empresa *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
              placeholder="Nome da empresa"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Segmento</label>
            <input
              type="text"
              value={formData.segment}
              onChange={e => setFormData({ ...formData, segment: e.target.value })}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              placeholder="Ex: Tecnologia"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notas/Observações</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all min-h-[100px]"
              placeholder="Informações adicionais..."
            />
          </div>
        </div>
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-white transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !formData.name}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Edit3 className="w-5 h-5" />}
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
};
