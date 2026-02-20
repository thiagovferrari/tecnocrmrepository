import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { History as HistoryIcon, User, Database, ArrowRight, Loader2, ArrowDownUp, RefreshCw } from 'lucide-react';

interface AuditLog {
    id: string;
    table_name: string;
    record_id: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    old_data: any;
    new_data: any;
    user_id: string;
    user_email?: string;
    created_at: string;
}

const FIELD_LABELS: Record<string, string> = {
    name: 'Nome',
    email: 'E-mail',
    whatsapp: 'WhatsApp',
    role: 'Cargo',
    segment: 'Segmento',
    notes: 'Observações',
    tags: 'Tags',
    archived: 'Arquivado',
    start_date: 'Data de Início',
    end_date: 'Data Término',
    city: 'Cidade',
    venue: 'Local',
    status: 'Status',
    value_expected: 'Valor Esperado',
    value_closed: 'Valor Fechado',
    next_action: 'Próxima Ação',
    next_action_date: 'Data da Próxima Ação',
    responsible: 'Responsável',
    company_id: 'ID da Empresa',
    event_id: 'ID do Evento'
};

const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined || value === '') return 'Vazio';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (key.startsWith('value_') && typeof value === 'number') {
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    if (key.includes('date') && typeof value === 'string') {
        try {
            // Check if it's strictly a date
            if (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return format(new Date(value), 'dd/MM/yyyy');
            }
        } catch {
            // fallback
        }
    }
    return String(value);
};

export const History: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.rpc('get_audit_logs');

            if (error) {
                // Ignore error if table doesn't exist yet (migration not run)
                if (error.code === '42P01' || error.message?.includes('schema cache')) {
                    setError('A tabela de auditoria ainda não foi criada no banco de dados. Por favor, acesse o painel do Supabase, vá no SQL Editor e cole/execute o código que está no arquivo setup_audit_logs.sql para ativar o histórico.');
                } else {
                    throw error;
                }
            } else {
                setLogs(data || []);
            }
        } catch (err: any) {
            console.error('Error fetching audit logs:', err);
            setError(err.message || 'Erro ao carregar o histórico.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getActionColor = (action: string) => {
        switch (action) {
            case 'INSERT': return 'bg-green-100 text-green-700 border-green-200';
            case 'UPDATE': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'DELETE': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'INSERT': return 'CRIADO';
            case 'UPDATE': return 'EDITADO';
            case 'DELETE': return 'EXCLUÍDO';
            default: return action;
        }
    };

    const getTableNameLabel = (table: string) => {
        switch (table) {
            case 'events': return 'Evento';
            case 'companies': return 'Empresa';
            case 'event_companies': return 'Negociação';
            case 'contacts': return 'Contato';
            default: return table;
        }
    };

    const formatDataChanges = (oldData: any, newData: any) => {
        if (!oldData && !newData) return <span className="text-slate-400 italic">Sem detalhes.</span>;

        if (!oldData && newData) {
            // INSERT
            return (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 mt-2 overflow-x-auto space-y-1">
                    {Object.entries(newData)
                        .filter(([k, v]) => !['id', 'created_at', 'updated_at', 'user_id', 'company_id', 'event_id'].includes(k) && v !== null && v !== '')
                        .map(([k, v]) => (
                            <div key={k} className="flex gap-2">
                                <span className="text-slate-500 font-semibold w-32 shrink-0">{FIELD_LABELS[k] || k}:</span>
                                <span className="text-slate-800 font-medium">{formatValue(k, v)}</span>
                            </div>
                        ))
                    }
                </div>
            );
        }

        if (oldData && !newData) {
            // DELETE
            return (
                <div className="text-xs text-slate-500 bg-red-50 p-2 rounded border border-red-100 mt-2 font-mono line-through opacity-70 overflow-x-auto">
                    {oldData.name || oldData.title || `ID: ${oldData.id}`} excluído.
                </div>
            );
        }

        // UPDATE
        const changes: { key: string, old: any, new: any }[] = [];

        // Find modified keys
        const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
        allKeys.forEach(key => {
            if (['updated_at'].includes(key)) return;

            const oldVal = oldData?.[key];
            const newVal = newData?.[key];

            if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                changes.push({ key, old: oldVal, new: newVal });
            }
        });

        if (changes.length === 0) return <span className="text-slate-400 italic text-xs mt-2 block">Nenhuma alteração de dados rastreada.</span>;

        return (
            <div className="mt-3 space-y-1.5">
                {changes.map(change => (
                    <div key={change.key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-600 font-bold w-full sm:w-32 shrink-0">{FIELD_LABELS[change.key] || change.key}</span>
                        <div className="flex-1 flex items-center gap-2">
                            <span className="text-slate-400 line-through bg-white px-2 py-0.5 rounded border border-slate-100">
                                {formatValue(change.key, change.old)}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                {formatValue(change.key, change.new)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold items-center flex gap-2 text-slate-800">
                        <HistoryIcon className="w-6 h-6 text-blue-600" />
                        Histórico do Sistema
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Trilha de auditoria das alterações recentes (últimos 100 registros).</p>
                </div>

                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-xl transition-colors text-sm shadow-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
                    Atualizar
                </button>
            </div>

            {error ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
                    <Database className="w-10 h-10 text-amber-500 mb-2" />
                    <h3 className="font-bold">Aviso do Sistema de Histórico</h3>
                    <p className="max-w-md text-sm">{error}</p>
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-blue-600">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="font-semibold animate-pulse">Carregando trilha de auditoria...</p>
                </div>
            ) : logs.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center">
                    <HistoryIcon className="w-12 h-12 text-slate-200 mb-4" />
                    <h3 className="font-bold text-slate-700 mb-1">Nenhum registro encontrado</h3>
                    <p className="text-slate-500 text-sm">O histórico começará a ser populado assim que edições forem feitas.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {logs.map((log) => (
                            <div key={log.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getActionColor(log.action)}`}>
                                                {getActionLabel(log.action)}
                                            </span>

                                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                <Database className="w-3 h-3 text-slate-400" />
                                                {getTableNameLabel(log.table_name)}
                                            </span>

                                            <span className="text-xs text-slate-400 flex items-center gap-1" title={log.record_id}>
                                                <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1 rounded truncate max-w-[120px]">
                                                    {log.record_id.split('-')[0]}...
                                                </span>
                                            </span>
                                        </div>

                                        {formatDataChanges(log.old_data, log.new_data)}
                                    </div>

                                    <div className="shrink-0 flex flex-col items-end gap-1 text-right">
                                        <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                            <User className="w-4 h-4 text-slate-400" />
                                            {log.user_email || 'Sistema / Bot'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                        </span>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
