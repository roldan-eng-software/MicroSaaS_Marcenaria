import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function ContractPrint() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    async function fetchData() {
        try {
            const { data: quote, error: quoteErr } = await supabase
                .from('quotes')
                .select(`
                    *,
                    customer:customers(*),
                    items:quote_items(*)
                `)
                .eq('id', id)
                .single();

            if (quoteErr) throw quoteErr;
            setData(quote);

            const { data: prof, error: profErr } = await supabase
                .from('profiles')
                .select('*')
                .single();

            if (profErr) throw profErr;
            setProfile(prof);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-10 text-center">Gerando contrato...</div>;
    if (!data) return <div className="p-10 text-center text-red-500">Erro: Orçamento não encontrado.</div>;

    const today = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="bg-white min-h-screen p-8 md:p-16 text-gray-900 font-serif leading-relaxed max-w-[21cm] mx-auto shadow-2xl print:shadow-none print:p-0">
            {/* Header / Logo */}
            <div className="border-b-2 border-gray-900 pb-8 mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900 mb-2">
                        Contrato de Prestação de Serviços
                    </h1>
                    <p className="text-sm font-bold text-gray-500">Ref: Orçamento Nº {data.quote_number}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg">{profile?.company_name}</p>
                    <p className="text-sm text-gray-500">{profile?.phone}</p>
                </div>
            </div>

            <div className="space-y-8 text-sm">
                {/* Partes */}
                <section>
                    <h2 className="font-bold uppercase border-b border-gray-100 pb-2 mb-4">1. Identificação das Partes</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="font-black text-[10px] uppercase text-gray-400 mb-1">Contratada</p>
                            <p className="font-medium">
                                <strong>{profile?.company_name}</strong>, com endereço em {profile?.address}, doravante denominada simplesmente CONTRATADA.
                            </p>
                        </div>
                        <div>
                            <p className="font-black text-[10px] uppercase text-gray-400 mb-1">Contratante</p>
                            <p className="font-medium">
                                <strong>{data.customer?.name}</strong>, CPF/CNPJ: {data.customer?.document || '____________________'},
                                residente em {data.customer?.address}, doravante denominado simplesmente CONTRATANTE.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Objeto */}
                <section>
                    <h2 className="font-bold uppercase border-b border-gray-100 pb-2 mb-4">2. Do Objeto</h2>
                    <p>
                        O presente contrato tem por objeto a fabricação e instalação de mobiliário sob medida, conforme descritivo detalhado no orçamento de número <strong>#{data.quote_number}</strong>,
                        composto pelos seguintes itens principais:
                    </p>
                    <ul className="mt-4 list-disc list-inside space-y-1 ml-4">
                        {data.items?.map((item, i) => (
                            <li key={i}>{item.description} (Qtd: {item.quantity})</li>
                        ))}
                    </ul>
                </section>

                {/* Valor e Pagamento */}
                <section>
                    <h2 className="font-bold uppercase border-b border-gray-100 pb-2 mb-4">3. Do Valor e Condições de Pagamento</h2>
                    <p>
                        Pela execução dos serviços objeto deste contrato, o CONTRATANTE pagará à CONTRATADA o valor total de:
                    </p>
                    <p className="text-xl font-black mt-4 mb-4">
                        R$ {data.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="bg-gray-50 p-6 rounded-2xl">
                        <p className="font-bold text-xs uppercase text-gray-400 mb-2">Condições Pactuadas:</p>
                        <p className="italic">{data.payment_conditions || 'As condições de pagamento seguem o padrão de 50% de entrada e 50% na data da entrega, salvo negociação prévia.'}</p>
                    </div>
                </section>

                {/* Prazo */}
                <section>
                    <h2 className="font-bold uppercase border-b border-gray-100 pb-2 mb-4">4. Dos Prazos</h2>
                    <p>
                        A CONTRATADA compromete-se a entregar e instalar os produtos descritos no prazo de <strong>30 a 45 dias úteis</strong>,
                        contados a partir da data de assinatura deste contrato e confirmação do pagamento de entrada (se houver).
                    </p>
                </section>

                {/* Cláusulas Gerais */}
                <section className="space-y-4">
                    <h2 className="font-bold uppercase border-b border-gray-100 pb-2 mb-4">5. Disposições Gerais</h2>
                    <p>
                        5.1. É de responsabilidade do CONTRATANTE garantir que o local da instalação esteja livre e pronto para receber o mobiliário nas datas agendadas.
                    </p>
                    <p>
                        5.2. A CONTRATADA oferece garantia de 01 (um) ano contra defeitos de fabricação, não cobrindo danos por mau uso, umidade excessiva ou intervenção de terceiros.
                    </p>
                </section>

                {/* Foro */}
                <p className="text-center py-8">
                    Para dirimir quaisquer dúvidas oriundas deste contrato, as partes elegem o foro da comarca de <strong>{profile?.address?.split(',').pop()?.trim() || '____________'}</strong>.
                </p>

                <p className="text-center italic">Localidade, {today}.</p>

                {/* Assinaturas */}
                <div className="grid grid-cols-2 gap-16 pt-16">
                    <div className="text-center">
                        <div className="border-t border-gray-900 pt-2">
                            <p className="font-bold">{profile?.company_name}</p>
                            <p className="text-[10px] text-gray-400">CONTRATADA</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-gray-900 pt-2">
                            <p className="font-bold">{data.customer?.name}</p>
                            <p className="text-[10px] text-gray-400">CONTRATANTE</p>
                        </div>
                    </div>
                </div>

                {/* Print Button UI - Invisible on print */}
                <div className="pt-20 print:hidden text-center">
                    <button
                        onClick={() => window.print()}
                        className="px-8 py-3 bg-primary-600 text-white font-black rounded-xl hover:bg-primary-700 shadow-xl transition-all"
                    >
                        Imprimir Contrato
                    </button>
                    <p className="text-xs text-gray-400 mt-4">DICA: Selecione "Salvar como PDF" no destino da impressão.</p>
                </div>
            </div>
        </div>
    );
}
