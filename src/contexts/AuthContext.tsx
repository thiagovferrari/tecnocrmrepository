
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Loader2, WifiOff, RefreshCw } from 'lucide-react';

const AUTH_TIMEOUT_MS = 10000; // 10 segundos

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        let cancelled = false;

        // Timeout: se o Supabase não responder em 10s, exibe erro amigável
        const timeoutId = setTimeout(() => {
            if (!cancelled) {
                console.error('Auth timeout: Supabase demorou mais de 10s para responder. Banco pode estar pausado.');
                setTimedOut(true);
                setLoading(false);
            }
        }, AUTH_TIMEOUT_MS);

        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                if (!cancelled) {
                    clearTimeout(timeoutId);
                    setSession(session);
                    setUser(session?.user ?? null);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    clearTimeout(timeoutId);
                    console.error('Auth session check failed:', err);
                    setTimedOut(true);
                    setLoading(false);
                }
            });

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!cancelled) {
                clearTimeout(timeoutId);
                setTimedOut(false);
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        });

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    // Tela de erro: banco pausado ou sem conexão
    if (timedOut && !loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 p-8">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 flex flex-col items-center gap-5 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                        <WifiOff className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Banco de dados indisponível</h2>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            O servidor demorou muito para responder. Isso pode acontecer quando o banco de dados
                            fica <strong>inativo por mais de 7 dias</strong> no plano gratuito do Supabase.
                        </p>
                    </div>
                    <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                        <p className="text-amber-800 text-xs font-semibold mb-1">Como resolver:</p>
                        <ol className="text-amber-700 text-xs space-y-1 list-decimal list-inside">
                            <li>Acesse <span className="font-mono font-bold">supabase.com/dashboard</span></li>
                            <li>Clique no seu projeto</li>
                            <li>Clique em <strong>"Restore project"</strong></li>
                            <li>Aguarde ~2 minutos e tente novamente</li>
                        </ol>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors w-full justify-center"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 text-blue-600 font-bold gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Carregando Sistema...
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
