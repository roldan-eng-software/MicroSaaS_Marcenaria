import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, User, Building, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        company_name: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    async function fetchProfile() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    full_name: data.full_name || '',
                    company_name: data.company_name || '',
                    phone: data.phone || '',
                    address: data.address || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    ...formData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Erro ao atualizar perfil: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Meu Perfil / Empresa</h1>

            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <User className="h-4 w-4 mr-2 text-primary-500" />
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                            />
                        </div>

                        {/* Company Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <Building className="h-4 w-4 mr-2 text-primary-500" />
                                Nome da Marcenaria
                            </label>
                            <input
                                type="text"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-primary-500" />
                                Telefone Comercial
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                            />
                        </div>

                        {/* Email (Read Only from User) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 flex items-center">
                                Email de Acesso
                            </label>
                            <input
                                type="text"
                                disabled
                                value={user?.email || ''}
                                className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-500 sm:text-sm p-2 border cursor-not-allowed"
                            />
                        </div>

                        {/* Address */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                                Endereço da Oficina
                            </label>
                            <textarea
                                name="address"
                                rows={3}
                                value={formData.address}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            <Save className="h-5 w-5 mr-2" />
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
