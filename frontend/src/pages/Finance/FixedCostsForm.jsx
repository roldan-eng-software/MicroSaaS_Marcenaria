import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Banknote, Percent, Info, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function FixedCostsForm() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState({
        monthly_rent: 0,
        monthly_energy: 0,
        monthly_internet: 0,
        profit_margin_percent: 30,
        taxes_percent: 15,
        labor_cost_per_hour: 0
    });

    useEffect(() => {
        if (user) fetchFixedCosts();
    }, [user]);

    async function fetchFixedCosts() {
        try {
            const { data: existing, error } = await supabase
                .from('fixed_costs')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            if (existing) setData(existing);
        } catch (error) {
            console.error('Error fetching fixed costs:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...data, user_id: user.id, updated_at: new Date().toISOString() };

            const { error } = await supabase
                .from('fixed_costs')
                .upsert(payload, { onConflict: 'user_id' });

            if (error) throw error;
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Error saving fixed costs:', error);
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin h-10 w-10 text-primary-600" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Custos & Precificação</h1>
                    <p className="text-sm text-gray-500 font-medium">Configure seus custos fixos e margens globais.</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Operating Costs */}
                    <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100/50 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                <Banknote size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 tracking-tight">Custos Operacionais</h2>
                        </div>

                        <CostInput
                            label="Aluguel Mensal"
                            name="monthly_rent"
                            value={data.monthly_rent}
                            onChange={(val) => setData({ ...data, monthly_rent: val })}
                        />
                        <CostInput
                            label="Energia/Água"
                            name="monthly_energy"
                            value={data.monthly_energy}
                            onChange={(val) => setData({ ...data, monthly_energy: val })}
                        />
                        <CostInput
                            label="Internet/Telefone"
                            name="monthly_internet"
                            value={data.monthly_internet}
                            onChange={(val) => setData({ ...data, monthly_internet: val })}
                        />
                        <CostInput
                            label="Mão de Obra (Hora)"
                            name="labor_cost_per_hour"
                            value={data.labor_cost_per_hour}
                            onChange={(val) => setData({ ...data, labor_cost_per_hour: val })}
                        />
                    </div>

                    {/* Margins & Taxes */}
                    <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100/50 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <Percent size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 tracking-tight">Margens e Impostos</h2>
                        </div>

                        <CostInput
                            label="Margem de Lucro Desejada (%)"
                            name="profit_margin_percent"
                            value={data.profit_margin_percent}
                            onChange={(val) => setData({ ...data, profit_margin_percent: val })}
                            isPercent
                        />
                        <CostInput
                            label="Impostos e Taxas (%)"
                            name="taxes_percent"
                            value={data.taxes_percent}
                            onChange={(val) => setData({ ...data, taxes_percent: val })}
                            isPercent
                        />

                        <div className="bg-indigo-50 p-6 rounded-3xl mt-4">
                            <div className="flex items-start gap-3">
                                <Info className="text-indigo-600 h-5 w-5 mt-0.5 shrink-0" />
                                <p className="text-xs text-indigo-800 font-bold leading-relaxed">
                                    Essas margens serão usadas para sugerir o preço final nos orçamentos com base no custo dos materiais adicionados.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full md:w-auto px-12 py-4 bg-primary-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                        Salvar Configurações
                    </button>
                </div>
            </form>
        </div>
    );
}

function CostInput({ label, name, value, onChange, isPercent }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-black text-sm">
                    {isPercent ? '%' : 'R$'}
                </div>
                <input
                    type="number"
                    step="0.01"
                    className="w-full pl-10 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all transition-all duration-300 shadow-sm"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                />
            </div>
        </div>
    );
}
