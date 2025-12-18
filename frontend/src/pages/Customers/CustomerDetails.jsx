import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    User,
    Calendar,
    Plus,
    MessageSquare,
    Clock,
    AlertCircle,
    CheckCircle2,
    Ruler
} from 'lucide-react';
import InteractionForm from './InteractionForm.jsx';

const URGENCY_COLORS = {
    'Alta': 'bg-red-100 text-red-800 border-red-200',
    'Média': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Baixa': 'bg-green-100 text-green-800 border-green-200'
};

const CHANNEL_ICONS = {
    'WhatsApp': MessageSquare,
    'Telefone': Phone,
    'Presencial': User,
    'Email': Mail
};

export default function CustomerDetails() {
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [interactions, setInteractions] = useState([]);
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchCustomerData();
    }, [id]);

    async function fetchCustomerData() {
        try {
            const { data: customerData, error: customerError } = await supabase
                .from('customers')
                .select('*')
                .eq('id', id)
                .single();

            if (customerError) throw customerError;
            setCustomer(customerData);

            const { data: interactionData, error: interactionError } = await supabase
                .from('interactions')
                .select('*')
                .eq('customer_id', id)
                .order('created_at', { ascending: false });

            if (interactionError) throw interactionError;
            setInteractions(interactionData);

            const { data: visitData, error: visitError } = await supabase
                .from('technical_visits')
                .select('*')
                .eq('customer_id', id)
                .order('scheduled_date', { ascending: false });

            if (visitError) throw visitError;
            setVisits(visitData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-8 text-center">Carregando detalhes...</div>;
    if (!customer) return <div className="p-8 text-center text-red-500">Cliente não encontrado.</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link to="/customers" className="flex items-center text-gray-500 hover:text-primary-600 transition-colors">
                    <ArrowLeft className="h-5 w-5 mr-1" />
                    Voltar para lista
                </Link>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            console.log('Abrindo modal de interação');
                            setShowModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-primary-200 text-sm font-medium rounded-xl text-primary-700 bg-white hover:bg-primary-50 transition-all"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Interação
                    </button>
                    <Link
                        to={`/visits/new/${id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
                    >
                        <Ruler className="h-4 w-4 mr-2" />
                        Agendar Visita
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-primary-600 h-24"></div>
                        <div className="px-6 pb-6">
                            <div className="-mt-12 mb-4 flex justify-center">
                                <div className="h-24 w-24 rounded-full bg-white p-1 shadow-md border-4 border-white">
                                    <div className="h-full w-full rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                        <User className="h-12 w-12" />
                                    </div>
                                </div>
                            </div>
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
                                <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {customer.status}
                                </span>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <Phone className="h-4 w-4 mr-3 text-gray-400" />
                                    {customer.phone || 'Sem telefone'}
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                                    {customer.email || 'Sem email'}
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                                    <span className="truncate">{customer.address || 'Sem endereço'}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                                    Desde {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats/Visits Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                            <Ruler className="h-4 w-4 mr-2 text-primary-500" />
                            Visitas e Medições
                        </h3>
                        {visits.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">Nenhuma visita registrada.</p>
                        ) : (
                            <div className="space-y-3">
                                {visits.slice(0, 3).map(visit => (
                                    <Link
                                        key={visit.id}
                                        to={`/visits/edit/${visit.id}`}
                                        className="block p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors group"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                {new Date(visit.scheduled_date).toLocaleDateString('pt-BR')}
                                            </span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${visit.status === 'Realizada' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {visit.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-700 group-hover:text-primary-700 tracking-tight">
                                            {visit.measurements?.height || '0'}x{visit.measurements?.width || '0'}x{visit.measurements?.depth || '0'} mm
                                        </p>
                                    </Link>
                                ))}
                                {visits.length > 3 && (
                                    <Link to="/visits" className="block text-center text-xs text-primary-600 font-bold hover:underline py-1">
                                        Ver todas as {visits.length} visitas
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-primary-500" />
                            Linha do Tempo de Atendimento
                        </h3>

                        {interactions.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-lg">
                                <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-500">Nenhuma interação registrada ainda.</p>
                                <button
                                    onClick={() => {
                                        console.log('Abrindo modal de interação (empty state)');
                                        setShowModal(true);
                                    }}
                                    className="mt-4 text-primary-600 font-medium hover:underline text-sm"
                                >
                                    Registrar primeiro contato
                                </button>
                            </div>
                        ) : (
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {interactions.map((event, idx) => {
                                        const Icon = CHANNEL_ICONS[event.channel] || MessageSquare;
                                        return (
                                            <li key={event.id}>
                                                <div className="relative pb-8">
                                                    {idx !== interactions.length - 1 && (
                                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                                    )}
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${event.type === 'Visita' ? 'bg-indigo-100 text-indigo-600' :
                                                                event.type === 'Proposta' ? 'bg-orange-100 text-orange-600' :
                                                                    'bg-primary-100 text-primary-600'
                                                                }`}>
                                                                <Icon className="h-4 w-4" />
                                                            </span>
                                                        </div>
                                                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm font-bold text-gray-900">{event.type}</p>
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${URGENCY_COLORS[event.urgency]}`}>
                                                                        {event.urgency}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                                                {event.timeline && (
                                                                    <p className="text-xs text-primary-600 font-medium mt-2 flex items-center">
                                                                        <Clock className="h-3 w-3 mr-1" />
                                                                        Expectativa: {event.timeline}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="whitespace-nowrap text-right text-xs text-gray-500">
                                                                {new Date(event.created_at).toLocaleDateString('pt-BR')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <InteractionForm
                    customerId={id}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchCustomerData();
                    }}
                />
            )}
        </div>
    );
}
