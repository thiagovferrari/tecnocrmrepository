
// Utilitário para formatar datas evitando problemas de timezone (fuso horário)

/**
 * Formata uma string de data (YYYY-MM-DD ou ISO) para exibição no formato PT-BR (DD/MM/YYYY)
 * Tratando a data como UTC para evitar voltar 1 dia
 */
export const formatDateDisplay = (dateString?: string): string => {
    if (!dateString) return '';

    // Se for apenas data YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    // Se for ISO string com time (ex: T00:00:00.000Z), usamos UTC methods
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Falback se inválido

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
};

/**
 * Prepara uma data vinda do banco (ISO ou String) para o Input type="date" (YYYY-MM-DD)
 * Garante que input receba o dia EXATO que está no banco, sem converter para timezone local
 */
export const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';

    // Se já está no formato certo, devolve
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

    // Se for ISO (2023-10-25T00:00:00Z)
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};
