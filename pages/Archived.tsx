
import React, { useState, useMemo } from 'react';
import { useData } from '../src/contexts/DataContext';
import { Archive, Trash2, RotateCcw, Calendar, Building2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Archived: React.FC = () => {
    const { events, companies, relations, unarchiveEvent, deleteEvent, unarchiveRelation, deleteRelation } = useData();
    const [loading, setLoading] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    // Filtrar apenas itens arquivados
    const archivedEvents = useMemo(() => events.filter(e => e.archived), [events]);
    const archivedRelations = useMemo(() => relations.filter(r => r.archived), [relations]);

    const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || 'Empresa não encontrada';
    const getEventName = (id: string) => events.find(e => e.id === id)?.name || 'Evento não encontrado';

    const handleUnarchiveEvent = async (id: string) => {
        setLoading(id);
        try {
            await unarchiveEvent(id);
        } catch (error) {
            console.error(error);
            alert('Erro ao desarquivar evento');
        } finally {
            setLoading(null);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        setLoading(id);
        try {
            await deleteEvent(id);
            setConfirmDelete(null);
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir evento');
        } finally {
            setLoading(null);
        }
    };

    const handleUnarchiveRelation = async (id: string) => {
        setLoading(id);
        try {
            await unarchiveRelation(id);
        } catch (error) {
            console.error(error);
            alert('Erro ao desarquivar item');
        } finally {
            setLoading(null);
        }
    };

    const handleDeleteRelation = async (id: string) => {
        setLoading(id);
        try {
            await deleteRelation(id);
            setConfirmDelete(null);
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir item');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Archive className="w-8 h-8 text-slate-400" />
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Arquivados</h1>
                    <p className="text-slate-500">Gerencie seus itens arquivados</p>
                </div>
            </div>

            {/* Eventos Arquivados */}
            {archivedEvents.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        Eventos Arquivados ({archivedEvents.length})
                    </h2>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {archivedEvents.map(event => (
                                <div key={event.id} className="p-5 hover:bg-slate-50/50 transition-colors flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-800">{event.name}</h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {event.city || 'Cidade não definida'} • {event.start_date ? new Date(event.start_date).toLocaleDateString() : 'Data não definida'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleUnarchiveEvent(event.id)}
                                            disabled={loading === event.id}
                                            className="px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2 text-sm font-bold transition-all disabled:opacity-50"
                                            title="Desarquivar"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Desarquivar
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(event.id)}
                                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2 text-sm font-bold transition-all"
                                            title="Excluir Permanentemente"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Relações Arquivadas (Patrocinadores de Eventos) */}
            {archivedRelations.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        Patrocinadores Arquivados ({archivedRelations.length})
                    </h2>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {archivedRelations.map(relation => (
                                <div key={relation.id} className="p-5 hover:bg-slate-50/50 transition-colors flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-800">{getCompanyName(relation.company_id)}</h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Evento: <Link to={`/events/${relation.event_id}`} className="text-blue-600 hover:underline">{getEventName(relation.event_id)}</Link>
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Status: {relation.status.replace(/_/g, ' ')} • Expectativa: R$ {relation.value_expected?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleUnarchiveRelation(relation.id)}
                                            disabled={loading === relation.id}
                                            className="px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2 text-sm font-bold transition-all disabled:opacity-50"
                                            title="Desarquivar"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Desarquivar
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(relation.id)}
                                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2 text-sm font-bold transition-all"
                                            title="Excluir Permanentemente"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Mensagem quando não há nada arquivado */}
            {archivedEvents.length === 0 && archivedRelations.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center">
                    <Archive className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-400 mb-2">Nenhum item arquivado</h3>
                    <p className="text-sm text-slate-400">Itens arquivados aparecem aqui para você gerenciar</p>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-red-200">
                        <div className="p-6 bg-red-50 border-b border-red-100 flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                            <h3 className="font-bold text-lg text-red-900">Confirmar Exclusão Permanente</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-600">
                                Tem certeza que deseja <strong>excluir permanentemente</strong> este item? Esta ação não pode ser desfeita.
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-white transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    const isEvent = archivedEvents.find(e => e.id === confirmDelete);
                                    if (isEvent) {
                                        handleDeleteEvent(confirmDelete);
                                    } else {
                                        handleDeleteRelation(confirmDelete);
                                    }
                                }}
                                disabled={loading === confirmDelete}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading === confirmDelete ? 'Excluindo...' : 'Sim, Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
