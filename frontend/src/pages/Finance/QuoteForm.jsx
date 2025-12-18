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
    Banknote,
    Printer,
    Phone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
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
                    <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-50">
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
                    <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-50 overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-8 bg-primary-500 rounded-full"></div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Itens do Orçamento</h2>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => addItem()}
                                    className="flex-1 sm:flex-none px-4 py-3 sm:py-2 text-xs font-bold text-gray-600 hover:text-primary-600 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all"
                                >
                                    + Item Manual
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 sm:flex-none px-4 py-3 sm:py-2 text-xs font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-md transition-all flex items-center justify-center font-bold"
                                    onClick={() => addItem(materials[0])}
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
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id || item.tempId} className="flex flex-col md:grid md:grid-cols-12 gap-3 bg-gray-50/30 p-5 rounded-2xl border border-gray-50 group hover:border-primary-100 hover:bg-white transition-all transition-all duration-300">
                                            <div className="w-full md:col-span-5">
                                                <label className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                                                    <FileText className="h-3 w-3" /> Descrição do Item
                                                </label>
                                                <input
                                                    placeholder="O que está sendo orçado?"
                                                    className="w-full bg-transparent border-none text-base md:text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:ring-0 p-0 md:p-1"
                                                    value={item.description}
                                                    onChange={(e) => updateItem(item.id || item.tempId, 'description', e.target.value)}
                                                />
                                            </div>

                                            <div className="flex gap-3 w-full md:col-span-5">
                                                <div className="flex-1">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">QTD</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            className="w-full bg-white border border-gray-100 rounded-xl p-3 md:p-2 text-sm text-center font-bold focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(item.id || item.tempId, 'quantity', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">UNITÁRIO (R$)</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            className="w-full bg-white border border-gray-100 rounded-xl p-3 md:p-2 text-sm text-center font-bold focus:ring-primary-500 focus:border-primary-500 text-primary-700 shadow-sm"
                                                            value={item.unit_price}
                                                            onChange={(e) => updateItem(item.id || item.tempId, 'unit_price', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:col-span-2 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                                <div className="text-left md:text-right">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">SUBTOTAL</p>
                                                    <p className="text-lg md:text-sm font-black text-gray-900 tracking-tight">
                                                        R$ {(item.quantity * item.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.id || item.tempId)}
                                                    className="p-3 bg-red-50 text-red-500 md:bg-transparent md:text-gray-300 md:hover:text-red-500 md:hover:bg-red-50 rounded-xl transition-all active:scale-90"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-50 space-y-6">
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
                                    className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 text-sm focus:bg-white focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Observações Internas</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                    placeholder="Detalhes técnicos, ferragens específicas, prazos..."
                                    className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 text-sm focus:bg-white focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900 text-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-2xl lg:sticky lg:top-24 overflow-hidden">
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
                                                className="bg-transparent border-b border-gray-700 w-16 text-right text-sm focus:border-primary-500 focus:ring-0 outline-none"
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
                                    className="w-full py-4 bg-primary-500 text-white font-black rounded-3xl hover:bg-primary-400 active:scale-95 transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center disabled:opacity-50"
                                >
                                    {loading ? 'Processando...' : (
                                        <>
                                            <Save className="h-5 w-5 mr-3" />
                                            {id ? 'Atualizar' : 'Finalizar Proposta'}
                                        </>
                                    )}
                                </button>

                                {id && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link
                                            to={`/finance/quotes/print/${id}`}
                                            target="_blank"
                                            className="py-3 bg-gray-800 text-white text-[10px] font-black uppercase rounded-2xl hover:bg-gray-700 transition-all flex items-center justify-center border border-gray-700 active:scale-95"
                                        >
                                            <Printer className="h-4 w-4 mr-2" />
                                            Ver PDF
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const customer = customers.find(c => c.id === selectedCustomer);
                                                const phone = customer?.phone?.replace(/\D/g, '');
                                                const msg = encodeURIComponent(`Olá ${customer?.name}! Segue o link da sua proposta: ${window.location.origin}/finance/quotes/print/${id}`);
                                                window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
                                            }}
                                            className="py-3 bg-green-600 text-white text-[10px] font-black uppercase rounded-2xl hover:bg-green-500 transition-all flex items-center justify-center active:scale-95"
                                        >
                                            <Phone className="h-4 w-4 mr-2" />
                                            WhatsApp
                                        </button>
                                    </div>
                                )}

                                <p className="text-[10px] text-center text-gray-500 font-bold tracking-tight">
                                    Pressione para gerar o orçamento oficial.
                                </p>
                            </div>
                        </div>
                    </div>

                    {status === 'Aprovado' && (
                        <div className="bg-green-900/40 text-green-100 p-6 rounded-3xl border border-green-800 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                <CheckCircle2 className="h-24 w-24" />
                            </div>
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Automação Ativa</span>
                                </div>
                                <p className="text-xs font-bold leading-relaxed">Este orçamento criará automaticamente um projeto ativo no sistema após salvar.</p>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
