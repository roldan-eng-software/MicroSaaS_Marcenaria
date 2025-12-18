import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Search,
    Filter,
    Printer,
    FileText,
    BarChart3,
    PieChart as PieChartIcon,
    ArrowRightLeft,
    CalendarDays
} from 'lucide-react';
import clsx from 'clsx';

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [quotes, setQuotes] = useState([]);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchReports();
    }, [dateRange]);

    async function fetchReports() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('quotes')
                .select('*, customer:customers(name)')
                .gte('created_at', dateRange.start)
                .lte('created_at', dateRange.end + 'T23:59:59')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuotes(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    }

    const stats = {
        total: quotes.reduce((sum, q) => sum + Number(q.total), 0),
        count: quotes.length,
        approved: quotes.filter(q => q.status === 'Aprovado').length,
        approvedTotal: quotes.filter(q => q.status === 'Aprovado').reduce((sum, q) => sum + Number(q.total), 0),
        conversion: quotes.length > 0 ? (quotes.filter(q => q.status === 'Aprovado').length / quotes.length) * 100 : 0
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Relatórios Gerenciais</h1>
                    <p className="text-sm text-gray-500 font-medium">Analise o desempenho de vendas por período.</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center px-6 py-3 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-800 transition-all shadow-xl active:scale-95 group"
                >
                    <Printer className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Imprimir Relatório
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100/50 flex flex-col md:flex-row items-end gap-6">
                <div className="flex-1 w-full space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Data Início</label>
                    <div className="relative">
                        <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="date"
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        />
                    </div>
                </div>
                <div className="flex-1 w-full space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Data Fim</label>
                    <div className="relative">
                        <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="date"
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        />
                    </div>
                </div>
                <button
                    onClick={fetchReports}
                    className="w-full md:w-auto px-8 py-4 bg-primary-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary-700 transition-all shadow-lg active:scale-95"
                >
                    Filtrar
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ReportStat
                    label="Volume no Período"
                    value={`R$ ${stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    subvalue={`${stats.count} orçamentos criados`}
                    icon={BarChart3}
                    color="text-primary-600"
                    bg="bg-primary-50"
                />
                <ReportStat
                    label="Vendas Aprovadas"
                    value={`R$ ${stats.approvedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    subvalue={`${stats.approved} contratos fechados`}
                    icon={PieChartIcon}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <ReportStat
                    label="Conversão Média"
                    value={`${stats.conversion.toFixed(1)}%`}
                    subvalue="Performance do funil"
                    icon={ArrowRightLeft}
                    color="text-amber-600"
                    bg="bg-amber-50"
                />
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-[32px] shadow-2xl border border-gray-50 overflow-hidden print:shadow-none print:border-none">
                <div className="px-8 py-6 border-b border-gray-100/50 flex items-center justify-between bg-gray-50/50">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Detalhamento dos Orçamentos</h3>
                    <FileText className="h-5 w-5 text-gray-300" />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Nº / Data</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-10 text-center text-gray-400 font-medium">Carregando dados...</td>
                                </tr>
                            ) : quotes.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-10 text-center text-gray-400 font-medium">Nenhum dado encontrado para este período.</td>
                                </tr>
                            ) : (
                                quotes.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="text-sm font-black text-gray-900">#{quote.quote_number}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">{new Date(quote.created_at).toLocaleDateString('pt-BR')}</div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-600">{quote.customer?.name}</div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className={clsx(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                                quote.status === 'Aprovado' ? "bg-emerald-50 text-emerald-600" :
                                                    quote.status === 'Recusado' ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"
                                            )}>
                                                {quote.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-black text-gray-900">
                                            R$ {Number(quote.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ReportStat({ label, value, subvalue, icon: Icon, color, bg }) {
    return (
        <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100/50 flex items-center gap-6">
            <div className={clsx("p-5 rounded-[22px]", bg, color)}>
                <Icon size={28} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-xl font-black text-gray-900 tracking-tight">{value}</p>
                <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">{subvalue}</p>
            </div>
        </div>
    );
}
