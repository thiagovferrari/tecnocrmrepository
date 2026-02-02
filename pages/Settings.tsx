
import React from 'react';
import { Shield, Database, Trash2, AlertTriangle } from 'lucide-react';

export const Settings: React.FC = () => {
  const handleClearData = () => {
    if (confirm("Tem certeza? Isso apagará todos os dados salvos localmente (Eventos, Empresas e Negociações).")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-slate-500">Ajustes do sistema TecnoCRM.</p>
      </div>

      <section className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b bg-slate-50 flex items-center gap-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold">Segurança e Acesso</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">No momento o acesso é público. Para versões futuras, você poderá definir uma senha única de acesso.</p>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3">
            <Database className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-blue-700">Armazenamento na Nuvem</p>
              <p className="text-blue-600">Seus dados estão sendo salvos no Supabase (banco de dados na nuvem). Seus dados estão seguros e sincronizados em tempo real.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-red-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b bg-red-50 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h2 className="font-bold text-red-600">Zona de Perigo</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-800">Redefinir Banco de Dados</p>
              <p className="text-sm text-slate-500">Apaga permanentemente todas as informações e volta ao estado inicial.</p>
            </div>
            <button
              onClick={handleClearData}
              className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-bold flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Limpar Tudo
            </button>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-slate-400">TecnoCRM v0.1.0-MVP</p>
    </div>
  );
};
