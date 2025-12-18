import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Plus, Calendar, MapPin, Clock, ChevronRight, User } from 'lucide-react';
import clsx from 'clsx';

export default function VisitList() {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVisits();
    }, []);

    async function fetchVisits() {
        try {
            const { data, error } = await supabase
                .from('technical_visits')
                .select(`
                    *,
                    customer:customers(name, address)
                `)
                .order('scheduled_date', { ascending: true });

            if (error) throw error;
            setVisits(data || []);
        } catch (error) {
            console.error('Error fetching visits:', error);
        } finally {
            setLoading(false);
        }
    }

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Agendada': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Realizada': return 'bg-green-50 text-green-700 border-green-100';
            case 'Cancelada': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Agenda de Visitas</h1>
                    <p className="text-sm text-gray-500 mt-1 caps">Gerencie suas visitas técnicas e medições.</p>
                </div>
                <Link
                    to="/visits/new"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Visita
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Carregando agenda...</p>
                </div>
            ) : visits.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Calendar className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhuma visita agendada</h3>
                    <p className="text-gray-500 mt-1 caps">Clique em "Nova Visita" para agendar uma medição.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {visits.map((visit) => (
                        <div
                            key={visit.id}
                            onClick={() => navigate(`/visits/edit/${visit.id}`)}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="flex items-start gap-4">
                                <div className="bg-gray-50 p-3 rounded-xl text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900">{visit.customer?.name || 'Cliente não encontrado'}</h3>
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                            getStatusStyles(visit.status)
                                        )}>
                                            {visit.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 gap-4">
                                        <span className="flex items-center">
                                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                            {new Date(visit.scheduled_date).toLocaleDateString('pt-BR')}
                                        </span>
                                        <span className="flex items-center">
                                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                                            {new Date(visit.scheduled_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-400 italic truncate max-w-sm">
                                        <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                                        {visit.customer?.address || 'Sem endereço'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end sm:justify-start">
                                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary-600 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
