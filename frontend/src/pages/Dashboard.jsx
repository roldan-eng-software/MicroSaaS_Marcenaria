import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    TrendingUp,
    Users,
    FileText,
    ClipboardList,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    Package
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

// A more robust, modular Dashboard component

const StatLoader = () => (
    <div className="bg-gray-100 animate-pulse rounded-[32px] h-36"></div>
);

const ChartLoader = () => (
    <div className="bg-gray-100 animate-pulse rounded-[32px] lg:col-span-2 h-[400px]"></div>
);

const ListLoader = () => (
    <div className="bg-gray-100 animate-pulse rounded-[32px] h-[400px]"></div>
);


export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Separate states for each data piece for resilience
    const [kpiData, setKpiData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [recentVisits, setRecentVisits] = useState(null);

    useEffect(() => {
        if (user) {
            fetchAllDashboardData();
        }
    }, [user]);

    async function fetchAllDashboardData() {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // Fetch all data in parallel for better performance
            const [kpis, visits] = await Promise.all([
                fetchKpiData(),
                fetchRecentVisits(),
            ]);

            setKpiData(kpis);
            setRecentVisits(visits);
            // Chart data depends on KPIs, so it's processed after
            processChartData(kpis.quotes);

        } catch (err) {
            console.error('Failed to load dashboard:', err);
            setError('Não foi possível carregar os dados do painel.');
        } finally {
            setLoading(false);
        }
    }

    async function fetchKpiData() {
        const { data: quotes, error: quotesErr } = await supabase
            .from('quotes')
            .select('total, status, approved_at, created_at')
            .eq('user_id', user.id);
        if (quotesErr) throw quotesErr;

        const { count: activeOSCount, error: osErr } = await supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .neq('status', 'Instalado');
        if (osErr) throw osErr;

        const approvedQuotes = quotes.filter(q => q.status === 'Aprovado');
        const totalRevenue = approvedQuotes.reduce((sum, q) => sum + Number(q.total), 0);
        const conversionRate = quotes.length > 0 ? (approvedQuotes.length / quotes.length) * 100 : 0;

        return {
            totalRevenue,
            conversionRate,
            activeOS: activeOSCount || 0,
            quotes // Pass quotes for chart processing
        };
    }

    async function fetchRecentVisits() {
        const today = new Date().toISOString().split('T')[0];
        const { data: visits, error: visitsErr } = await supabase
            .from('technical_visits')
            .select('id, scheduled_date, customer:customers(name)')
            .eq('user_id', user.id)
            .gte('scheduled_date', today)
            .order('scheduled_date', { ascending: true })
            .limit(5);
        if (visitsErr) throw visitsErr;
        return visits;
    }

    function processChartData(quotes) {
        const approvedQuotes = quotes.filter(q => q.status === 'Aprovado');
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = d.toLocaleDateString('pt-BR', { month: 'short' });
            const monthValue = d.getMonth();
            const yearValue = d.getFullYear();

            const monthRevenue = approvedQuotes
                .filter(q => {
                    if (!q.approved_at && !q.created_at) return false;
                    const date = new Date(q.approved_at || q.created_at);
                    return date.getMonth() === monthValue && date.getFullYear() === yearValue;
                })
                .reduce((sum, q) => sum + Number(q.total), 0);

            months.push({ name: monthName, total: monthRevenue });
        }
        setMonthlyData(months);
    }

    const visitsTodayCount = useMemo(() => {
        if (!recentVisits) return 0;
        const today = new Date().toISOString().split('T')[0];
        return recentVisits.filter(v => v.scheduled_date.startsWith(today)).length;
    }, [recentVisits]);

    if (loading && !kpiData) {
        return (
            <div className="space-y-8 pb-12">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Painel de Gestão</h1>
                    <p className="text-sm text-gray-500 font-medium">Carregando dados...</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatLoader /><StatLoader /><StatLoader /><StatLoader />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <ChartLoader />
                    <ListLoader />
                </div>
            </div>
        );
    }
    
    if (error) return (
        <div className="text-center py-20 bg-red-50 rounded-lg">
             <p className="text-red-500 font-semibold">{error}</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Painel de Gestão</h1>
                <p className="text-sm text-gray-500 font-medium">Bem-vindo de volta! Aqui está o resumo da sua marcenaria.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Faturamento (Total)"
                    value={kpiData ? `R$ ${kpiData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '...'}
                    icon={TrendingUp}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <KPICard
                    title="Taxa de Conversão"
                    value={kpiData ? `${kpiData.conversionRate.toFixed(1)}%` : '...'}
                    icon={CheckCircle2}
                    color="text-blue-600"
                    bg="bg-blue-50"
                    subtitle="Orçamentos vs Aprovados"
                />
                <KPICard
                    title="Produção Ativa"
                    value={kpiData ? kpiData.activeOS : '...'}
                    icon={Package}
                    color="text-amber-600"
                    bg="bg-amber-50"
                    subtitle="OS em andamento"
                />
                <KPICard
                    title="Visitas Hoje"
                    value={visitsTodayCount}
                    icon={Calendar}
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                    subtitle="Medições agendadas"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100/50">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Evolução de Vendas</h2>
                            <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">Últimos 6 Meses</p>
                        </div>
                    </div>
                    {monthlyData ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4351ff" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#4351ff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }} formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']} />
                                    <Area type="monotone" dataKey="total" stroke="#4351ff" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <ChartLoader />}
                </div>

                {/* Upcoming Visits */}
                <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100/50">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Próximas Visitas</h2>
                            <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">Sua Agenda</p>
                        </div>
                        <Calendar className="text-primary-600 h-6 w-6" />
                    </div>

                    <div className="space-y-6">
                        {!recentVisits ? <ListLoader /> : recentVisits.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-gray-400 font-medium">Nenhuma visita agendada.</p>
                            </div>
                        ) : (
                            recentVisits.map((visit) => (
                                <div key={visit.id} className="flex items-start gap-4 group">
                                    <div className="bg-primary-50 p-3 rounded-2xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                        <Clock size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{visit.customer?.name || 'Cliente não encontrado'}</p>
                                        <p className="text-xs text-gray-500 font-medium">
                                            {new Date(visit.scheduled_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} às {new Date(visit.scheduled_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <Link to={`/visits/edit/${visit.id}`} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                                        <ArrowUpRight size={18} />
                                    </Link>
                                </div>
                            ))
                        )}
                        <Link to="/visits" className="block w-full text-center py-4 bg-gray-50 text-gray-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all mt-4">
                            Ver Todas as Visitas
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color, bg, subtitle }) {
    // This component remains the same, but I added a fallback for the dynamic part in the main component.
    return (
        <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100/50 hover:scale-[1.02] transition-all cursor-default group">
            <div className="flex items-start justify-between mb-4">
                <div className={clsx("p-4 rounded-2xl transition-all group-hover:scale-110 duration-300", bg, color)}>
                    <Icon size={24} />
                </div>
                {/* Static for now, can be made dynamic later */}
                {/* <div className="flex items-center text-emerald-500 text-xs font-black bg-emerald-50 px-2 py-1 rounded-lg">
                    <TrendingUp size={12} className="mr-1" />
                    +12%
                </div> */}
            </div>
            <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">{value}</h3>
                {subtitle && <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">{subtitle}</p>}
            </div>
        </div>
    );
}