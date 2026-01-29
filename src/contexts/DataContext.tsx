
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
    addRelation: (relation: Omit<EventCompany, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateRelation: (id: string, updates: Partial<EventCompany>) => Promise<void>;
    updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType>({
    events: [],
    companies: [],
    relations: [],
    contacts: [],
    loading: true,
    addEvent: async () => { },
    addCompany: async () => { return {} as Company; },
    addRelation: async () => { },
    updateRelation: async () => { },
    updateEvent: async () => { },
    deleteEvent: async () => { },
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
            const contactsToInsert = contacts.map((c: any) => ({
                ...c,
                company_id: newCompany.id,
            }));
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

    return (
        <DataContext.Provider value={{ events, companies, relations, contacts, loading, addEvent, addCompany, addRelation, updateRelation, updateEvent, deleteEvent }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
