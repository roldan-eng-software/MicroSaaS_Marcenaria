import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORIES = [
    'Material',
    'Mão de Obra',
    'Pagamento Cliente',
    'Aluguel',
    'Energia/Internet',
    'Ferramentas',
    'Outros'
];

export default function TransactionForm() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);

    const [formData, setFormData] = useState({
        type: 'expense', // 'income' or 'expense'
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        project_id: ''
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    async function fetchProjects() {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('id, title')
                .order('title');

            if (error) throw error;
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
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
            if (!user) throw new Error('User not authenticated');

            // Sanitize payload
            const payload = {
                ...formData,
                user_id: user.id,
                project_id: formData.project_id || null, // Convert empty string to null
                amount: parseFloat(formData.amount)
            };

            const { error } = await supabase
                .from('transactions')
                .insert([payload]);

            if (error) throw error;

            navigate('/finance');
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Erro ao salvar transação: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/finance')}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Nova Transação</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
                {/* Type Toggle */}
                <div className="flex justify-center space-x-4 mb-6">
                    <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, type: 'income' }))}
                        className={`px-4 py-2 rounded-md font-medium ${formData.type === 'income'
                            ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Receita (Entrada)
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, type: 'expense' }))}
                        className={`px-4 py-2 rounded-md font-medium ${formData.type === 'expense'
                            ? 'bg-red-100 text-red-800 ring-2 ring-red-500'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Despesa (Saída)
                    </button>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Descrição *
                    </label>
                    <input
                        type="text"
                        name="description"
                        id="description"
                        required
                        placeholder="Ex: Compra de MDF para Cozinha"
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                            Valor (R$) *
                        </label>
                        <input
                            type="number"
                            name="amount"
                            id="amount"
                            required
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                            Data *
                        </label>
                        <input
                            type="date"
                            name="date"
                            id="date"
                            required
                            value={formData.date}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                            Categoria
                        </label>
                        <select
                            name="category"
                            id="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                        >
                            <option value="">Selecione...</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="project_id" className="block text-sm font-medium text-gray-700">
                            Vincular a Projeto (Opcional)
                        </label>
                        <select
                            name="project_id"
                            id="project_id"
                            value={formData.project_id}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        >
                            <option value="">Nenhum</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
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
                        {loading ? 'Salvando...' : 'Salvar Transação'}
                    </button>
                </div>
            </form>
        </div>
    );
}
