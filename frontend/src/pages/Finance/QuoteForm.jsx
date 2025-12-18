import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    Calculator,
    Search,
    Package,
    CheckCircle2,
    Clock,
    FileText,
    Percent,
    Banknote
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

export default function QuoteForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [customers, setCustomers] = useState([]);
    const [materials, setMaterials] = useState([]);

    // Form state
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [status, setStatus] = useState('Rascunho');
    const [items, setItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState('R$');
    const [notes, setNotes] = useState('');
    const [paymentConditions, setPaymentConditions] = useState('');

    useEffect(() => {
        fetchInitialData();
        if (id) fetchQuote();
    }, [id]);

    async function fetchInitialData() {
        const [custRes, matRes] = await Promise.all([
            supabase.from('customers').select('id, name').order('name'),
            supabase.from('materials').select('*').order('name')
        ]);
        setCustomers(custRes.data || []);
        setMaterials(matRes.data || []);
    }

    async function fetchQuote() {
        try {
            const { data: quote, error: quoteErr } = await supabase
                .from('quotes')
                .select('*, items:quote_items(*)')
                .eq('id', id)
                .single();

            if (quoteErr) throw quoteErr;

            setSelectedCustomer(quote.customer_id);
            setStatus(quote.status);
            setDiscount(quote.discount);
            setDiscountType(quote.discount_type);
            setNotes(quote.notes || '');
            setPaymentConditions(quote.payment_conditions || '');
            setItems(quote.items.map(i => ({
                id: i.id,
                material_id: i.material_id,
                description: i.description,
                quantity: parseFloat(i.quantity),
                unit_price: parseFloat(i.unit_price)
            })));
        } catch (error) {
            console.error('Error fetching quote:', error);
        } finally {
            setFetching(false);
        }
    }

    const addItem = (material = null) => {
        const newItem = {
            tempId: Date.now(),
            material_id: material?.id || '',
            description: material?.name || '',
            quantity: 1,
            unit_price: material?.cost_price || 0
        };
        setItems([...items, newItem]);
    };

    const removeItem = (targetId) => {
        setItems(items.filter(item => (item.id || item.tempId) !== targetId));
    };

    const updateItem = (targetId, field, value) => {
        setItems(items.map(item => {
            if ((item.id || item.tempId) === targetId) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    }, [items]);

    const finalTotal = useMemo(() => {
        const d = parseFloat(discount) || 0;
        if (discountType === '%') {
            return subtotal * (1 - d / 100);
        }
        return subtotal - d;
    }, [subtotal, discount, discountType]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedCustomer) return alert('Selecione um cliente');
        if (items.length === 0) return alert('Adicione pelo menos um item');

        setLoading(true);
        try {
            const quotePayload = {
                user_id: user.id,
                customer_id: selectedCustomer,
                status,
                total: finalTotal,
                discount: parseFloat(discount),
                discount_type: discountType,
                notes,
                payment_conditions: paymentConditions
            };

            let quoteId = id;

            if (id) {
                const { error } = await supabase.from('quotes').update(quotePayload).eq('id', id);
                if (error) throw error;

                // For simplicity, delete and re-insert items in edit mode
                await supabase.from('quote_items').delete().eq('quote_id', id);
            } else {
                const { data, error } = await supabase.from('quotes').insert([quotePayload]).select();
                if (error) throw error;
                quoteId = data[0].id;
            }

            const itemsPayload = items.map(item => ({
                quote_id: quoteId,
                material_id: item.material_id || null,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.quantity * item.unit_price
            }));

            const { error: itemsErr } = await supabase.from('quote_items').insert(itemsPayload);
            if (itemsErr) throw itemsErr;

            // Automation: If approved, create a project
            if (status === 'Aprovado') {
                const { data: existingProject } = await supabase.from('projects').select('id').eq('customer_id', selectedCustomer).eq('title', `Projeto do Orçamento #${quoteId.slice(0, 5)}`).single();

                if (!existingProject) {
                    await supabase.from('projects').insert([{
                        customer_id: selectedCustomer,
                        title: `Projeto do Orçamento #${quoteId.slice(0, 5)}`,
                        status: 'in_progress',
                        budget_estimated: finalTotal
                    }]);
                }
            }

            navigate('/finance/quotes');
        } catch (error) {
            console.error('Save error:', error);
            alert('Erro ao salvar orçamento: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-12 text-center text-gray-500">Carregando orçamento...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/finance/quotes')}
                    className="inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors font-medium"
                >
                    <ArrowLeft className="h-5 w-5 mr-1" />
                    Voltar para Lista
                </button>
                <div className="flex items-center gap-4">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={clsx(
                            "px-4 py-2 rounded-xl text-sm font-bold border outline-none transition-all",
                            status === 'Aprovado' ? 'bg-green-50 text-green-700 border-green-200' :
                                status === 'Recusado' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-gray-50 text-gray-700 border-gray-200'
                        )}
                    >
                        <option value="Rascunho">Rascunho</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Recusado">Recusado</option>
                    </select>
                </div>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    {/* Customer Selection */}
                    <section className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-2 w-8 bg-primary-500 rounded-full"></div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Dados do Cliente</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Selecione o Cliente</label>
                                <select
                                    required
                                    value={selectedCustomer}
                                    onChange={(e) => setSelectedCustomer(e.target.value)}
                                    className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 text-sm focus:bg-white focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
                                >
                                    <option value="">Buscar cliente...</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Items Management */}
                    <section className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50 overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-8 bg-primary-500 rounded-full"></div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Itens do Orçamento</h2>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => addItem()}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-primary-600 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all"
                                >
                                    + Item Manual
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 text-xs font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-md transition-all flex items-center"
                                    onClick={() => addItem(materials[0])} // Just a shortcut, in real app show a picker
                                >
                                    <Package className="h-4 w-4 mr-2" />
                                    Do Catálogo
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {items.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                                    <Calculator className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-400 font-medium">Nenhum item adicionado ainda.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div key={item.id || item.tempId} className="grid grid-cols-12 gap-3 items-center bg-gray-50/30 p-4 rounded-2xl border border-gray-50 group hover:border-primary-100 hover:bg-white transition-all">
                                            <div className="col-span-12 md:col-span-5">
                                                <input
                                                    placeholder="Descrição do item..."
                                                    className="w-full bg-transparent border-none text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:ring-0"
                                                    value={item.description}
                                                    onChange={(e) => updateItem(item.id || item.tempId, 'description', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-4 md:col-span-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-3 mb-1">QTD</span>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="w-full bg-white border border-gray-100 rounded-xl p-2 text-sm text-center font-bold focus:ring-primary-500 focus:border-primary-500"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(item.id || item.tempId, 'quantity', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-5 md:col-span-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-3 mb-1">UNITÁRIO (R$)</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full bg-white border border-gray-100 rounded-xl p-2 text-sm text-center font-bold focus:ring-primary-500 focus:border-primary-500 text-primary-700"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItem(item.id || item.tempId, 'unit_price', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-3">
                                                <div className="text-right sr-only md:not-sr-only">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">SUBTOTAL</p>
                                                    <p className="text-sm font-black text-gray-900">
                                                        {(item.quantity * item.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.id || item.tempId)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-2 w-8 bg-primary-500 rounded-full"></div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Condições e Notas</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Condições de Pagamento</label>
                                <textarea
                                    value={paymentConditions}
                                    onChange={(e) => setPaymentConditions(e.target.value)}
                                    rows={4}
                                    placeholder="Ex: 50% entrada, 50% entrega no cartão em 3x..."
                                    className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 text-sm focus:bg-white focus:ring-primary-500 focus:border-primary-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Observações Internas</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                    placeholder="Detalhes técnicos, ferragens específicas, prazos..."
                                    className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 text-sm focus:bg-white focus:ring-primary-500 focus:border-primary-500 transition-all"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900 text-white p-8 rounded-[40px] shadow-2xl sticky top-6 overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Banknote className="h-32 w-32" />
                        </div>

                        <div className="relative space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary-400">Resumo de Venda</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-gray-400 font-bold">
                                    <span className="text-xs">Subtotal</span>
                                    <span className="text-sm tabular-nums">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-gray-400 font-bold">
                                        <span className="text-xs">Desconto</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setDiscountType(discountType === 'R$' ? '%' : 'R$')}
                                                className="bg-gray-800 p-1 rounded text-[10px] hover:bg-primary-600 transition-colors"
                                            >
                                                {discountType}
                                            </button>
                                            <input
                                                type="number"
                                                className="bg-transparent border-b border-gray-700 w-16 text-right text-sm focus:border-primary-500 focus:ring-0"
                                                value={discount}
                                                onChange={(e) => setDiscount(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-800"></div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Valor Final</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-medium text-gray-400">R$</span>
                                    <span className="text-5xl font-black tracking-tighter tabular-nums">
                                        {finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 space-y-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-primary-500 text-white font-black rounded-3xl hover:bg-primary-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center disabled:opacity-50"
                                >
                                    {loading ? 'Processando...' : (
                                        <>
                                            <Save className="h-5 w-5 mr-3" />
                                            {id ? 'Atualizar' : 'Finalizar Proposta'}
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-center text-gray-500 font-bold tracking-tight">
                                    Pressione para gerar o orçamento oficial.
                                </p>
                            </div>
                        </div>
                    </div>

                    {status === 'Aprovado' && (
                        <div className="bg-green-900 text-white p-6 rounded-3xl border border-green-800 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <CheckCircle2 className="h-24 w-24" />
                            </div>
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Automação Ativa</span>
                                </div>
                                <p className="text-xs font-bold leading-relaxed">Este orçamento criará automaticamente um projeto ativo no sistema.</p>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
