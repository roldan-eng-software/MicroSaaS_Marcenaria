import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function CustomerForm() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        document: '',
        address: '',
        origin: 'WhatsApp',
        status: 'Lead'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) throw new Error('User not authenticated');

            const { error } = await supabase
                .from('customers')
                .insert([{
                    ...formData,
                    user_id: user.id
                }]);

            if (error) throw error;

            navigate('/customers');
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('Erro ao salvar cliente: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/customers')}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Novo Cliente</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nome Completo *
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Telefone
                        </label>
                        <input
                            type="text"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label htmlFor="document" className="block text-sm font-medium text-gray-700">
                            CPF/CNPJ
                        </label>
                        <input
                            type="text"
                            name="document"
                            id="document"
                            value={formData.document}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Endereço
                        </label>
                        <textarea
                            name="address"
                            id="address"
                            rows={3}
                            value={formData.address}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label htmlFor="origin" className="block text-sm font-medium text-gray-700">
                            Origem do Contato
                        </label>
                        <select
                            name="origin"
                            id="origin"
                            value={formData.origin}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        >
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Indicação">Indicação</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Google">Google</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            name="status"
                            id="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        >
                            <option value="Lead">Lead</option>
                            <option value="Em negociação">Em negociação</option>
                            <option value="Cliente ativo">Cliente ativo</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Salvando...' : 'Salvar Cliente'}
                    </button>
                </div>
            </form>
        </div>
    );
}
