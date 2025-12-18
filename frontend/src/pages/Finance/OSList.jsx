import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import {
    ClipboardList,
    Search,
    Filter,
    ChevronRight,
    Clock,
    CheckCircle2,
    Package,
    Truck,
    User
} from 'lucide-react';
import clsx from 'clsx';

const STATUS_CONFIG = {
    'Aguardando material': { color: 'text-amber-700 bg-amber-50 border-amber-100', icon: Clock },
    'Em produção': { color: 'text-blue-700 bg-blue-50 border-blue-100', icon: Package },
    'Pronto': { color: 'text-indigo-700 bg-indigo-50 border-indigo-100', icon: CheckCircle2 },
    'Instalado': { color: 'text-green-700 bg-green-50 border-green-100', icon: Truck },
};

import { useAuth } from '../../contexts/AuthContext';

export default function OSList() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    async function fetchOrders() {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('service_orders')
                .select(`
                    *,
                    quote:quotes(
                        quote_number,
                        customer:customers(name)
                    )
                `)
                .eq('user_id', user.id)
                .order('os_number', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching OS:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredOrders = orders.filter(os =>
        os.quote?.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.os_number.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ordens de Serviço</h1>
                    <p className="text-sm text-gray-500 mt-1">Acompanhe a produção e instalação dos projetos aprovados.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex-1 flex items-center gap-3 w-full">
                    <Search className="h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou número da OS..."
                        className="flex-1 border-none focus:ring-0 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="h-6 w-px bg-gray-100 hidden sm:block"></div>
                <button className="flex items-center text-sm font-bold text-gray-600 hover:text-primary-600 transition-colors">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar Status
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500 font-medium font-medium">Carregando ordens...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <ClipboardList className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhuma OS em andamento</h3>
                    <p className="text-gray-500 mt-1">Aprove um orçamento para gerar uma nova ordem de serviço.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">OS / Cliente</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsável</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Prazos</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {filteredOrders.map((os) => {
                                    const config = STATUS_CONFIG[os.status] || STATUS_CONFIG['Aguardando material'];
                                    const StatusIcon = config.icon;

                                    return (
                                        <tr key={os.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-xl bg-gray-900 flex items-center justify-center text-white mr-4 font-bold text-xs shadow-sm group-hover:bg-primary-600 transition-all font-bold">
                                                        OS {os.os_number}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">{os.quote?.customer?.name}</div>
                                                        <div className="text-xs text-gray-400 mt-0.5">Ref: Orçamento #{os.quote?.quote_number}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-600 font-medium">
                                                    <User size={14} className="mr-2 text-gray-400" />
                                                    {os.responsible || 'Não atribuído'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="text-xs space-y-1">
                                                    <p className="text-gray-400 uppercase font-black tracking-tighter">Início</p>
                                                    <p className="text-gray-700 font-bold">{os.start_date ? new Date(os.start_date).toLocaleDateString('pt-BR') : '--/--/----'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className={clsx(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                                                    config.color
                                                )}>
                                                    <StatusIcon size={14} />
                                                    {os.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right">
                                                <Link
                                                    to={`/finance/os/${os.id}`}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all inline-block"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
