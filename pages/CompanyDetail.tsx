
import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../store';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, Building2, Mail, Phone, Calendar, Tag, User, Users } from 'lucide-react';

export const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const company = db.getCompanies().find(c => c.id === id);
  const events = db.getEvents();
  const relations = db.getRelations().filter(r => r.company_id === id);

  if (!company) return <div className="p-8 text-center">Empresa não encontrada.</div>;

  const getEventName = (id: string) => events.find(e => e.id === id)?.name || 'Evento Desconhecido';
  
  const history = useMemo(() => {
    return relations.map(r => ({
      ...r,
      eventName: getEventName(r.event_id)
    })).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }, [relations, events]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/companies')} 
          className="p-2 hover:bg-white border rounded-lg transition-colors text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Ficha da Empresa</h1>
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
    </div>
  );
};
