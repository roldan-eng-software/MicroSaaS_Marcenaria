import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, ArrowUpCircle, ArrowDownCircle, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

import { useAuth } from '../../contexts/AuthContext';

export default function TransactionList() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });

    useEffect(() => {
        if (user) {
            fetchTransactions();
        }
    }, [user]);

    async function fetchTransactions() {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
          *,
          projects (
            title
          )
        `)
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (error) throw error;
            setTransactions(data);
            calculateSummary(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            alert('Erro ao carregar transações');
        } finally {
            setLoading(false);
        }
    }

    function calculateSummary(data) {
        const income = data
            .filter(t => t.type === 'income')
            .reduce((acc, curr) => acc + Number(curr.amount), 0);

        const expense = data
            .filter(t => t.type === 'expense')
            .reduce((acc, curr) => acc + Number(curr.amount), 0);

        setSummary({
            income,
            expense,
            balance: income - expense
        });
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta transação?')) return;

        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            const updatedTransactions = transactions.filter(t => t.id !== id);
            setTransactions(updatedTransactions);
            calculateSummary(updatedTransactions);
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Erro ao excluir transação');
        }
    };

    const filteredTransactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.projects?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
                <Link
                    to="/finance/new"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Transação
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ArrowUpCircle className="h-6 w-6 text-green-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Receitas</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            R$ {summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ArrowDownCircle className="h-6 w-6 text-red-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Despesas</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            R$ {summary.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className={clsx(
                                    "h-8 w-8 text-2xl font-bold flex items-center justify-center rounded-full",
                                    summary.balance >= 0 ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
                                )}>
                                    $
                                </span>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Saldo Atual</dt>
                                    <dd>
                                        <div className={clsx(
                                            "text-lg font-medium",
                                            summary.balance >= 0 ? "text-green-600" : "text-red-600"
                                        )}>
                                            R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Buscar transações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {loading ? (
                    <div className="p-4 text-center">Carregando...</div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Nenhuma transação encontrada.
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Descrição
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Categoria / Projeto
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valor
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Ações</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTransactions.map((t) => (
                                <tr key={t.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(t.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {t.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex flex-col">
                                            <span>{t.category}</span>
                                            {t.projects && (
                                                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full w-fit">
                                                    {t.projects.title}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className={clsx(
                                        "px-6 py-4 whitespace-nowrap text-sm text-right font-medium",
                                        t.type === 'income' ? "text-green-600" : "text-red-600"
                                    )}>
                                        {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
