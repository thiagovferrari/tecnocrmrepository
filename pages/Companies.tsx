
import React, { useState } from 'react';
import { useData } from '../src/contexts/DataContext';
import { Company, Contact } from '../types';
import { Plus, Building2, User, Phone, Mail, Search, ExternalLink, Trash2, UserPlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Companies: React.FC = () => {
  const { companies, addCompany } = useData();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    segment: '',
    contacts: [{ id: crypto.randomUUID(), name: '', email: '', whatsapp: '', role: '' }] as Contact[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    try {
      const validContacts = formData.contacts.filter(c => c.name.trim() !== '');

      await addCompany({
        ...formData,
        contacts: validContacts.map(c => ({
          name: c.name,
          email: c.email,
          whatsapp: c.whatsapp,
          role: c.role
        })) as any // Casting necessary as we are passing contacts structure slightly different from table
      });

      setIsModalOpen(false);
      setFormData({
        name: '',
        segment: '',
        contacts: [{ id: crypto.randomUUID(), name: '', email: '', whatsapp: '', role: '' }]
      });
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar empresa');
    } finally {
      setLoading(false);
    }
  };

  const addContactRow = () => {
    setFormData({
      ...formData,
      contacts: [...formData.contacts, { id: crypto.randomUUID(), name: '', email: '', whatsapp: '', role: '' }]
    });
  };

  const removeContactRow = (id: string) => {
    if (formData.contacts.length <= 1) return;
    setFormData({
      ...formData,
      contacts: formData.contacts.filter(c => c.id !== id)
    });
  };

  const updateContact = (id: string, field: keyof Contact, value: string) => {
    setFormData({
      ...formData,
      contacts: formData.contacts.map(c => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.segment?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Empresas</h1>
          <p className="text-slate-500">Banco de dados de patrocinadores e contatos.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Nova Empresa
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Pesquisar por nome ou segmento..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(company => (
          <div key={company.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{company.name}</h2>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold uppercase">{company.segment || 'Sem Segmento'}</span>
              </div>
              <Link to={`/companies/${company.id}`} className="text-blue-500 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              {company.contacts && company.contacts.length > 0 ? (
                <div className="space-y-2">
                  {company.contacts.slice(0, 2).map(contact => (
                    <div key={contact.id} className="flex items-center gap-2 border-b border-slate-50 pb-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate font-medium">{contact.name}</span>
                      {contact.whatsapp && <Phone className="w-3 h-3 text-green-500 shrink-0" />}
                    </div>
                  ))}
                  {company.contacts.length > 2 && (
                    <p className="text-[10px] text-slate-400 italic">+ {company.contacts.length - 2} outros contatos</p>
                  )}
                </div>
              ) : (
                <p className="text-xs italic text-slate-400">Sem contatos cadastrados</p>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400">
            Nenhuma empresa encontrada.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center justify-between">
              <h3 className="font-bold text-xl text-slate-800">Cadastrar Nova Empresa</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 flex-1 overflow-y-auto space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome da Empresa *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Coca-Cola"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-400 transition-all"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Segmento</label>
                  <input
                    type="text"
                    value={formData.segment}
                    onChange={e => setFormData({ ...formData, segment: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-400 transition-all"
                    placeholder="Ex: Tecnologia"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-blue-500" /> Contatos da Empresa
                  </h4>
                  <button
                    type="button"
                    onClick={addContactRow}
                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Contato
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.contacts.map((contact, index) => (
                    <div key={contact.id} className="p-5 border border-slate-100 rounded-xl bg-slate-50/30 space-y-4 relative group hover:border-slate-200 transition-colors">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome do Contato</label>
                          <input
                            placeholder="Nome Completo"
                            value={contact.name}
                            onChange={e => updateContact(contact.id, 'name', e.target.value)}
                            className="w-full text-sm bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 outline-none focus:border-blue-500 placeholder:text-slate-300 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cargo</label>
                          <input
                            placeholder="Ex: Gerente Comercial"
                            value={contact.role}
                            onChange={e => updateContact(contact.id, 'role', e.target.value)}
                            className="w-full text-sm bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 outline-none focus:border-blue-500 placeholder:text-slate-300 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">E-mail</label>
                          <input
                            placeholder="contato@empresa.com"
                            type="email"
                            value={contact.email}
                            onChange={e => updateContact(contact.id, 'email', e.target.value)}
                            className="w-full text-sm bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 outline-none focus:border-blue-500 placeholder:text-slate-300 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">WhatsApp / Telefone</label>
                          <input
                            placeholder="(00) 00000-0000"
                            value={contact.whatsapp}
                            onChange={e => updateContact(contact.id, 'whatsapp', e.target.value)}
                            className="w-full text-sm bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 outline-none focus:border-blue-500 placeholder:text-slate-300 transition-all"
                          />
                        </div>
                      </div>
                      {formData.contacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContactRow(contact.id)}
                          className="absolute -top-2 -right-2 bg-white border border-slate-100 text-slate-400 p-1.5 rounded-full hover:text-red-500 hover:border-red-100 shadow-sm transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex gap-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50">{loading ? 'Salvando...' : 'Salvar Empresa'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
