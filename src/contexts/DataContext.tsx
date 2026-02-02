
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
    updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
    deleteContact: (id: string) => Promise<void>;
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

    const fetchData = async () => {
        setLoading(true);
        const { data: eventsData } = await supabase.from('events').select('*');
        const { data: companiesData } = await supabase.from('companies').select('*');
        const { data: relationsData } = await supabase.from('event_companies').select('*');
        const { data: contactsData } = await supabase.from('contacts').select('*');

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
                    setCompanies(prev => [...prev, payload.new as Company]);
                } else if (payload.eventType === 'UPDATE') {
                    setCompanies(prev => prev.map(item => item.id === payload.new.id ? payload.new as Company : item));
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
                if (payload.eventType === 'INSERT') {
                    setContacts(prev => [...prev, payload.new as Contact]);
                } else if (payload.eventType === 'UPDATE') {
                    setContacts(prev => prev.map(item => item.id === payload.new.id ? payload.new as Contact : item));
                } else if (payload.eventType === 'DELETE') {
                    setContacts(prev => prev.filter(item => item.id !== payload.old.id));
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
        // Separate contacts from company data if needed, or assume company object matches
        // But table 'companies' has 'tags', etc. 'contacts' is a separate table.
        // The previous store had nested contacts. Supabase needs separate inserts.
        const { contacts, ...companyData } = company as any;

        // Insert company
        const { data, error } = await supabase.from('companies').insert([companyData]).select();

        if (error || !data) throw error;

        const newCompany = data[0];

        // Insert contacts if any
        if (contacts && contacts.length > 0) {
            const contactsToInsert = contacts.map((c: any) => {
                const { id, ...contactData } = c;  // Remove o id do frontend
                return {
                    ...contactData,
                    company_id: newCompany.id,
                };
            });
            await supabase.from('contacts').insert(contactsToInsert);
        }

        // Return the company object (without contacts for now, or fetch them if needed contextually)
        // Ideally we should return with contacts but for ID usage this is enough.
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
        const { error } = await supabase.from('contacts').update(updates).eq('id', id);
        if (error) throw error;
        // Refresh company contacts after updating if companyId is provided
        if (companyId) {
            await refreshCompanyContacts(companyId);
        }
    };

    const deleteContact = async (id: string, companyId?: string) => {
        const { error } = await supabase.from('contacts').delete().eq('id', id);
        if (error) throw error;
        // Refresh company contacts after deleting if companyId is provided
        if (companyId) {
            await refreshCompanyContacts(companyId);
        }
    };

    const refreshCompanyContacts = async (companyId: string) => {
        const { data: contactsData } = await supabase.from('contacts').select('*').eq('company_id', companyId);
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
