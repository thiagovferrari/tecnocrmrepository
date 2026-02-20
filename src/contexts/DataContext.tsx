
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Event, Company, EventCompany, Contact } from '../../types';

interface DataContextType {
    events: Event[];
    companies: Company[];
    relations: EventCompany[];
    contacts: Contact[];
    loading: boolean;
    addEvent: (event: Omit<Event, 'id' | 'created_at'>) => Promise<void>;
    addCompany: (company: Omit<Company, 'id' | 'created_at'>) => Promise<Company>;
    updateCompany: (id: string, company: Partial<Company>) => Promise<void>;
    deleteCompany: (id: string) => Promise<void>;
    addRelation: (relation: Omit<EventCompany, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateRelation: (id: string, updates: Partial<EventCompany>) => Promise<void>;
    updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    archiveEvent: (id: string) => Promise<void>;
    unarchiveEvent: (id: string) => Promise<void>;
    archiveCompany: (id: string) => Promise<void>;
    unarchiveCompany: (id: string) => Promise<void>;
    archiveRelation: (id: string) => Promise<void>;
    unarchiveRelation: (id: string) => Promise<void>;
    deleteRelation: (id: string) => Promise<void>;
    // Contact management
    addContact: (contact: Omit<Contact, 'id'> & { company_id: string }) => Promise<void>;
    updateContact: (id: string, updates: Partial<Contact>, companyId?: string) => Promise<void>;
    deleteContact: (id: string, companyId?: string) => Promise<void>;
    refreshCompanyContacts: (companyId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType>({
    events: [],
    companies: [],
    relations: [],
    contacts: [],
    loading: true,
    addEvent: async () => { },
    addCompany: async () => { return {} as Company; },
    updateCompany: async () => { },
    deleteCompany: async () => { },
    addRelation: async () => { },
    updateRelation: async () => { },
    updateEvent: async () => { },
    deleteEvent: async () => { },
    archiveEvent: async () => { },
    unarchiveEvent: async () => { },
    archiveCompany: async () => { },
    unarchiveCompany: async () => { },
    archiveRelation: async () => { },
    unarchiveRelation: async () => { },
    deleteRelation: async () => { },
    addContact: async () => { },
    updateContact: async () => { },
    deleteContact: async () => { },
    refreshCompanyContacts: async () => { },
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [relations, setRelations] = useState<EventCompany[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);

    const DATA_FETCH_TIMEOUT_MS = 15000;

    const fetchData = async () => {
        setLoading(true);

        // Timeout: se o banco demorar >15s, libera o loading para não travar
        const timeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => {
                console.warn('DataContext timeout: queries demoraram mais de 15s');
                resolve(null);
            }, DATA_FETCH_TIMEOUT_MS)
        );

        // Todas as 4 queries em PARALELO (antes eram sequenciais)
        const fetchPromise = Promise.all([
            supabase.from('events').select('*'),
            supabase.from('companies').select('*'),
            supabase.from('event_companies').select('*'),
            supabase.from('contacts').select('*'),
        ]);

        const result = await Promise.race([fetchPromise, timeoutPromise]);

        if (!result) {
            // Timeout: libera o loading com dados vazios
            setLoading(false);
            return;
        }

        const [
            { data: eventsData },
            { data: companiesData },
            { data: relationsData },
            { data: contactsData },
        ] = result;

        // Manually join contacts to companies
        const companiesWithContacts = (companiesData || []).map(comp => ({
            ...comp,
            contacts: (contactsData || []).filter(c => c.company_id === comp.id)
        }));

        setEvents(eventsData || []);
        setCompanies(companiesWithContacts);
        setRelations(relationsData || []);
        setContacts(contactsData || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();

        // Realtime subscriptions
        const eventsSubscription = supabase
            .channel('public:events')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setEvents(prev => [...prev, payload.new as Event]);
                } else if (payload.eventType === 'UPDATE') {
                    setEvents(prev => prev.map(item => item.id === payload.new.id ? payload.new as Event : item));
                } else if (payload.eventType === 'DELETE') {
                    setEvents(prev => prev.filter(item => item.id !== payload.old.id));
                }
            })
            .subscribe();

        const companiesSubscription = supabase
            .channel('public:companies')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    // Nova empresa não tem contatos ainda
                    setCompanies(prev => [...prev, { ...payload.new as Company, contacts: [] }]);
                } else if (payload.eventType === 'UPDATE') {
                    // CRÍTICO: Preservar os contatos existentes ao atualizar a empresa
                    setCompanies(prev => prev.map(item => {
                        if (item.id === payload.new.id) {
                            // Manter os contatos que já existiam
                            return { ...payload.new as Company, contacts: item.contacts || [] };
                        }
                        return item;
                    }));
                } else if (payload.eventType === 'DELETE') {
                    setCompanies(prev => prev.filter(item => item.id !== payload.old.id));
                }
            })
            .subscribe();

        const relationsSubscription = supabase
            .channel('public:event_companies')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'event_companies' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setRelations(prev => [...prev, payload.new as EventCompany]);
                } else if (payload.eventType === 'UPDATE') {
                    setRelations(prev => prev.map(item => item.id === payload.new.id ? payload.new as EventCompany : item));
                } else if (payload.eventType === 'DELETE') {
                    setRelations(prev => prev.filter(item => item.id !== payload.old.id));
                }
            })
            .subscribe();

        const contactsSubscription = supabase
            .channel('public:contacts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, (payload) => {
                const newContact = payload.new as Contact;
                const oldContact = payload.old as Contact;

                if (payload.eventType === 'INSERT') {
                    setContacts(prev => [...prev, newContact]);
                    // Also update the company's contacts array
                    if (newContact.company_id) {
                        setCompanies(prev => prev.map(comp =>
                            comp.id === newContact.company_id
                                ? { ...comp, contacts: [...(comp.contacts || []), newContact] }
                                : comp
                        ));
                    }
                } else if (payload.eventType === 'UPDATE') {
                    setContacts(prev => prev.map(item => item.id === newContact.id ? newContact : item));
                    // Also update the company's contacts array
                    if (newContact.company_id) {
                        setCompanies(prev => prev.map(comp =>
                            comp.id === newContact.company_id
                                ? { ...comp, contacts: (comp.contacts || []).map(c => c.id === newContact.id ? newContact : c) }
                                : comp
                        ));
                    }
                } else if (payload.eventType === 'DELETE') {
                    setContacts(prev => prev.filter(item => item.id !== oldContact.id));
                    // Also update the company's contacts array
                    if (oldContact.company_id) {
                        setCompanies(prev => prev.map(comp =>
                            comp.id === oldContact.company_id
                                ? { ...comp, contacts: (comp.contacts || []).filter(c => c.id !== oldContact.id) }
                                : comp
                        ));
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(eventsSubscription);
            supabase.removeChannel(companiesSubscription);
            supabase.removeChannel(relationsSubscription);
            supabase.removeChannel(contactsSubscription);
        };
    }, []);

    const addEvent = async (event: Omit<Event, 'id' | 'created_at'>) => {
        await supabase.from('events').insert([event]);
    };

    const updateEvent = async (id: string, updates: Partial<Event>) => {
        await supabase.from('events').update(updates).eq('id', id);
    }

    const deleteEvent = async (id: string) => {
        await supabase.from('events').delete().eq('id', id);
    }

    const addCompany = async (company: Omit<Company, 'id' | 'created_at'>): Promise<Company> => {
        // Separar contacts dos dados da empresa (contacts vai em tabela separada)
        const { contacts, ...companyData } = company as any;

        console.log('📤 Inserindo empresa no banco:', companyData);

        // Insert company
        const { data, error } = await supabase.from('companies').insert([companyData]).select();

        if (error) {
            console.error('❌ Erro ao inserir empresa:', error);
            throw new Error(`Erro ao criar empresa: ${error.message}`);
        }

        if (!data || data.length === 0) {
            console.error('❌ Nenhum dado retornado após inserir empresa');
            throw new Error('Erro ao criar empresa: nenhum dado retornado');
        }

        const newCompany = data[0];
        console.log('✅ Empresa criada com ID:', newCompany.id);

        // Insert contacts if any
        if (contacts && contacts.length > 0) {
            const contactsToInsert = contacts
                .filter((c: any) => c.name && c.name.trim() !== '')
                .map((c: any) => {
                    const { id, ...contactData } = c;  // Remove o id do frontend
                    return {
                        ...contactData,
                        company_id: newCompany.id,
                    };
                });

            if (contactsToInsert.length > 0) {
                console.log('📤 Inserindo contatos:', contactsToInsert.length);
                const { error: contactsError } = await supabase.from('contacts').insert(contactsToInsert);

                if (contactsError) {
                    console.error('⚠️ Erro ao inserir contatos (empresa criada):', contactsError);
                    // Não lançar erro aqui - a empresa já foi criada
                } else {
                    console.log('✅ Contatos inseridos com sucesso');
                }
            }
        }

        return newCompany as Company;
    };

    const addRelation = async (relation: Omit<EventCompany, 'id' | 'created_at' | 'updated_at'>) => {
        console.log('📤 Tentando vincular empresa ao evento:', relation);

        const { data, error } = await supabase.from('event_companies').insert([relation]).select();

        if (error) {
            console.error('❌ ERRO ao vincular empresa:', error);
            throw new Error(`Erro ao vincular: ${error.message}`);
        }

        console.log('✅ Empresa vinculada com sucesso:', data);
    };

    const updateRelation = async (id: string, updates: Partial<EventCompany>) => {
        console.log('📤 Atualizando relação:', id, updates);

        const { error } = await supabase.from('event_companies').update({
            ...updates,
            updated_at: new Date().toISOString()
        }).eq('id', id);

        if (error) {
            console.error('❌ ERRO ao atualizar relação:', error);
            throw new Error(`Erro ao atualizar: ${error.message}`);
        }

        console.log('✅ Relação atualizada com sucesso');
    };

    // --- NOVAS FUNÇÕES ---

    const updateCompany = async (id: string, company: Partial<Company>) => {
        const { error } = await supabase.from('companies').update(company).eq('id', id);
        if (error) throw error;
    };

    const deleteCompany = async (id: string) => {
        const { error } = await supabase.from('companies').delete().eq('id', id);
        if (error) throw error;
    };

    const archiveEvent = async (id: string) => {
        await supabase.from('events').update({ archived: true }).eq('id', id);
    };

    const unarchiveEvent = async (id: string) => {
        await supabase.from('events').update({ archived: false }).eq('id', id);
    };

    const archiveCompany = async (id: string) => {
        await supabase.from('companies').update({ archived: true }).eq('id', id);
    };

    const unarchiveCompany = async (id: string) => {
        await supabase.from('companies').update({ archived: false }).eq('id', id);
    };

    const archiveRelation = async (id: string) => {
        await supabase.from('event_companies').update({ archived: true }).eq('id', id);
    };

    const unarchiveRelation = async (id: string) => {
        await supabase.from('event_companies').update({ archived: false }).eq('id', id);
    };

    const deleteRelation = async (id: string) => {
        const { error } = await supabase.from('event_companies').delete().eq('id', id);
        if (error) throw error;
    };

    // Contact management functions
    const addContact = async (contact: Omit<Contact, 'id'> & { company_id: string }) => {
        const { error } = await supabase.from('contacts').insert([contact]);
        if (error) throw error;
        // Refresh company contacts after adding
        await refreshCompanyContacts(contact.company_id);
    };

    const updateContact = async (id: string, updates: Partial<Contact>, companyId?: string) => {
        console.log('📤 Atualizando contato no banco:', { id, updates });

        // Primeiro, verificar se o contato existe
        const { data: existingContact, error: fetchError } = await supabase
            .from('contacts')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !existingContact) {
            console.error('❌ Contato não encontrado para update:', id, fetchError);
            throw new Error(`Contato com ID ${id} não encontrado no banco de dados`);
        }

        console.log('📋 Contato encontrado antes do update:', existingContact);

        // Agora fazer o update
        const { data, error } = await supabase
            .from('contacts')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error('❌ Erro ao atualizar contato:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.error('❌ Update não retornou dados - pode não ter atualizado');
            throw new Error('Update do contato falhou - nenhum dado retornado');
        }

        console.log('✅ Contato atualizado com sucesso:', data);

        // Refresh company contacts after updating if companyId is provided
        if (companyId) {
            await refreshCompanyContacts(companyId);
        }
    };

    const deleteContact = async (id: string, companyId?: string) => {
        console.log('🗑️ Deletando contato:', id);

        const { error } = await supabase.from('contacts').delete().eq('id', id);

        if (error) {
            console.error('❌ Erro ao deletar contato:', error);
            throw error;
        }

        console.log('✅ Contato deletado');

        // Refresh company contacts after deleting if companyId is provided
        if (companyId) {
            await refreshCompanyContacts(companyId);
        }
    };

    const refreshCompanyContacts = async (companyId: string) => {
        console.log('🔄 Buscando contatos da empresa:', companyId);

        const { data: contactsData, error } = await supabase.from('contacts').select('*').eq('company_id', companyId);

        if (error) {
            console.error('❌ Erro ao buscar contatos:', error);
            return;
        }

        console.log('📋 Contatos encontrados:', contactsData?.length || 0, contactsData);

        // Update the companies state with new contacts
        setCompanies(prev => prev.map(comp =>
            comp.id === companyId
                ? { ...comp, contacts: contactsData || [] }
                : comp
        ));
    };

    return (
        <DataContext.Provider value={{
            events,
            companies,
            relations,
            contacts,
            loading,
            addEvent,
            addCompany,
            updateCompany,
            deleteCompany,
            addRelation,
            updateRelation,
            updateEvent,
            deleteEvent,
            archiveEvent,
            unarchiveEvent,
            archiveCompany,
            unarchiveCompany,
            archiveRelation,
            unarchiveRelation,
            deleteRelation,
            addContact,
            updateContact,
            deleteContact,
            refreshCompanyContacts
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
