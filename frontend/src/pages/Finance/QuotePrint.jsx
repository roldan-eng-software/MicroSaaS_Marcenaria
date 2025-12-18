import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Printer, ArrowLeft } from 'lucide-react';

export default function QuotePrint() {
    const { id } = useParams();
    const [quote, setQuote] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    async function fetchData() {
        try {
            const { data: quoteData, error: quoteErr } = await supabase
                .from('quotes')
                .select('*, items:quote_items(*)')
                .eq('id', id)
                .single();

            if (quoteErr) throw quoteErr;
            setQuote(quoteData);

            const [custRes, profRes] = await Promise.all([
                supabase.from('customers').select('*').eq('id', quoteData.customer_id).single(),
                supabase.from('profiles').select('*').eq('id', quoteData.user_id).single()
            ]);

            setCustomer(custRes.data);
            setProfile(profRes.data);
        } catch (error) {
            console.error('Error fetching print data:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-12 text-center text-gray-500">Preparando documento...</div>;
    if (!quote) return <div className="p-12 text-center text-red-500">Orçamento não encontrado.</div>;

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 print:bg-white print:py-0 print:px-0">
            {/* Toolbar - Hidden when printing */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeft className="h-5 w-5 mr-1" />
                    Voltar
                </button>
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center px-6 py-2 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200"
                >
                    <Printer className="h-5 w-5 mr-2" />
                    Imprimir / Salvar PDF
                </button>
            </div>

            {/* A4 Paper Container */}
            <div className="max-w-[210mm] mx-auto bg-white p-[20mm] shadow-2xl print:shadow-none print:p-0 min-h-[297mm]">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-primary-500 pb-8 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-1">
                            {profile?.company_name || 'Marcenaria Premium'}
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">Propostas de Móveis Sob Medida</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-primary-600 uppercase tracking-widest">Orçamento</h2>
                        <p className="text-lg font-black text-gray-900">#{quote.quote_number}</p>
                        <p className="text-sm text-gray-500">{new Date(quote.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-3">Empresa</h3>
                        <div className="space-y-1 text-sm text-gray-600 font-medium">
                            <p className="font-bold text-gray-900">{profile?.company_name}</p>
                            <p>{profile?.address}</p>
                            <p>{profile?.phone}</p>
                            <p>{profile?.email}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-3">Para o Cliente</h3>
                        <div className="space-y-1 text-sm text-gray-600 font-medium">
                            <p className="font-bold text-gray-900">{customer?.name}</p>
                            <p>{customer?.address}</p>
                            <p>{customer?.phone}</p>
                            <p>{customer?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-12">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-y border-gray-100">
                                <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item / Descrição</th>
                                <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qtd</th>
                                <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Unitário</th>
                                <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {quote.items?.map((item, idx) => (
                                <tr key={item.id || idx}>
                                    <td className="py-5 px-4">
                                        <p className="text-sm font-bold text-gray-900">{item.description}</p>
                                    </td>
                                    <td className="py-5 px-4 text-center text-sm font-medium text-gray-600">
                                        {parseFloat(item.quantity)}
                                    </td>
                                    <td className="py-5 px-4 text-right text-sm font-medium text-gray-600 tabular-nums">
                                        R$ {parseFloat(item.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-5 px-4 text-right text-sm font-black text-gray-900 tabular-nums">
                                        R$ {(item.quantity * item.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary Table */}
                <div className="flex justify-end mb-12">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm text-gray-500 font-bold border-b border-gray-100 pb-2">
                            <span>Subtotal</span>
                            <span className="text-gray-900 tabular-nums">
                                R$ {quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        {quote.discount > 0 && (
                            <div className="flex justify-between text-sm text-red-500 font-bold border-b border-gray-100 pb-2">
                                <span>Desconto ({quote.discount_type})</span>
                                <span className="tabular-nums">
                                    - {quote.discount_type === 'R$' ? 'R$ ' : ''}
                                    {parseFloat(quote.discount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    {quote.discount_type === '%' ? '%' : ''}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Total Geral</span>
                            <span className="text-2xl font-black text-gray-900 tabular-nums">
                                R$ {parseFloat(quote.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Terms and Conditions */}
                <div className="grid grid-cols-2 gap-12 border-t border-gray-100 pt-8">
                    <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Condições de Pagamento</h4>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                            {quote.payment_conditions || 'A combinar.'}
                        </p>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Validade e Prazos</h4>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                            Proposta válida por 15 dias a partir da data de emissão.
                            Prazo de entrega conforme cronograma do projeto.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-20 pt-8 border-t border-gray-50 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Obrigado pela preferência</p>
                </div>
            </div>
        </div>
    );
}
