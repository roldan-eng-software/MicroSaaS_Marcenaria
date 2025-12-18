import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const customerSchema = z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido').or(z.literal('')),
    phone: z.string().min(10, 'Telefone inválido'),
    document: z.string().optional(),
    address: z.string().optional(),
    origin: z.string(),
    status: z.string()
});

export default function CustomerForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            document: '',
            address: '',
            origin: 'WhatsApp',
            status: 'Lead'
        }
    });

    useEffect(() => {
        if (id) {
            fetchCustomer();
        }
    }, [id]);

    async function fetchCustomer() {
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                reset({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    document: data.document || '',
                    address: data.address || '',
                    origin: data.origin || 'WhatsApp',
                    status: data.status || 'Lead'
                });
            }
        } catch (error) {
            console.error('Error fetching customer:', error);
            alert('Erro ao carregar dados do cliente');
        } finally {
            setFetching(false);
        }
    }

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            if (!user) throw new Error('Usuário não autenticado');

            if (id) {
                // Update
                const { error } = await supabase
                    .from('customers')
                    .update(data)
                    .eq('id', id);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('customers')
                    .insert([{
                        ...data,
                        user_id: user.id
                    }]);
                if (error) throw error;
            }

            navigate('/customers');
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('Erro ao salvar cliente: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center">Carregando dados...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/customers')}
                    className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para lista
                </button>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {id ? 'Editar Cliente' : 'Novo Cliente'}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-xl sm:rounded-2xl p-8 space-y-8 border border-gray-100">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Nome Completo *
                        </label>
                        <input
                            {...register('name')}
                            type="text"
                            className={`block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'bg-gray-50'
                                }`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Email
                        </label>
                        <input
                            {...register('email')}
                            type="email"
                            className={`block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border transition-all ${errors.email ? 'border-red-300 bg-red-50' : 'bg-gray-50'
                                }`}
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Telefone *
                        </label>
                        <input
                            {...register('phone')}
                            type="text"
                            placeholder="(XX) XXXXX-XXXX"
                            className={`block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border transition-all ${errors.phone ? 'border-red-300 bg-red-50' : 'bg-gray-50'
                                }`}
                        />
                        {errors.phone && <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            CPF/CNPJ
                        </label>
                        <input
                            {...register('document')}
                            type="text"
                            className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border bg-gray-50 transition-all"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Endereço de Instalação
                        </label>
                        <textarea
                            {...register('address')}
                            rows={3}
                            className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border bg-gray-50 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Origem do Contato
                        </label>
                        <select
                            {...register('origin')}
                            className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border bg-gray-50 transition-all"
                        >
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Indicação">Indicação</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Google">Google</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Status Atual
                        </label>
                        <select
                            {...register('status')}
                            className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border bg-gray-50 transition-all"
                        >
                            <option value="Lead">Lead</option>
                            <option value="Em negociação">Em negociação</option>
                            <option value="Cliente ativo">Cliente ativo</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-8 py-3 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-50"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Salvando...' : 'Cadastrar Cliente'}
                    </button>
                </div>
            </form>
        </div>
    );
}
