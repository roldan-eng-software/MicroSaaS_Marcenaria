import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Plus, Search, FileText, ChevronRight, Filter, Printer, CheckCircle2, Clock, XCircle, Eye, FileSignature } from 'lucide-react';
import clsx from 'clsx';

export default function QuoteList() {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuotes();
    }, []);

    async function fetchQuotes() {
        try {
            const { data, error } = await supabase
                .from('quotes')
                .select(`
                    *,
                    customer:customers(name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuotes(data || []);
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    }

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Aprovado': return 'bg-green-100 text-green-700 border-green-200';
            case 'Recusado': return 'bg-red-100 text-red-700 border-red-200';
            case 'Enviado': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Aprovado': return <CheckCircle2 className="h-4 w-4" />;
            case 'Recusado': return <XCircle className="h-4 w-4" />;
            case 'Enviado': return <Eye className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const filteredQuotes = quotes.filter(q =>
        q.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.quote_number.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orçamentos</h1>
                    <p className="text-sm text-gray-500 mt-1 caps">Transforme atendimentos em vendas reais.</p>
                </div>
                <Link
                    to="/finance/quotes/new"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Orçamento
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex-1 flex items-center gap-3 w-full">
                    <Search className="h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou número..."
                        className="flex-1 border-none focus:ring-0 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="h-6 w-px bg-gray-100 hidden sm:block"></div>
                <button className="flex items-center text-sm font-bold text-gray-600 hover:text-primary-600 transition-colors">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500 font-medium">Carregando orçamentos...</p>
                </div>
            ) : filteredQuotes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <FileText className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhum orçamento emitido</h3>
                    <p className="text-gray-500 mt-1 caps">Crie seu primeiro orçamento para começar a faturar.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Nº / Cliente</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {filteredQuotes.map((quote) => (
                                    <tr
                                        key={quote.id}
                                        className="hover:bg-gray-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 mr-4 font-bold text-xs ring-4 ring-white shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-all">
                                                    #{quote.quote_number}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{quote.customer?.name}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">Criado {new Date(quote.created_at).toLocaleDateString('pt-BR')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{new Date(quote.created_at).toLocaleDateString('pt-BR')}</div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-sm font-black text-gray-900">
                                                R$ {quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className={clsx(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                                                getStatusStyles(quote.status)
                                            )}>
                                                {getStatusIcon(quote.status)}
                                                {quote.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/finance/quotes/print/${quote.id}`}
                                                    target="_blank"
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                    title="Imprimir / PDF"
                                                >
                                                    <Printer className="h-5 w-5" />
                                                </Link>
                                                <Link
                                                    to={`/finance/quotes/contract/${quote.id}`}
                                                    target="_blank"
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Gerar Contrato"
                                                >
                                                    <FileSignature className="h-5 w-5" />
                                                </Link>
                                                <Link
                                                    to={`/finance/quotes/edit/${quote.id}`}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
