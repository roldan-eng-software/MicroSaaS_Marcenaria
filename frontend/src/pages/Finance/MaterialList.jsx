import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Search, Package, Trash2, Edit3, X, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

const CATEGORIES = [
    { id: 'chapas', name: 'Chapas/Painéis' },
    { id: 'ferragens', name: 'Ferragens' },
    { id: 'acabamentos', name: 'Acabamentos' },
    { id: 'LED', name: 'Iluminação/LED' },
    { id: 'mão de obra', name: 'Mão de Obra' }
];

export default function MaterialList() {
    const { user } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        category: 'chapas',
        unit: 'm2',
        cost_price: ''
    });

    useEffect(() => {
        if (user) {
            fetchMaterials();
        }
    }, [user]);

    async function fetchMaterials() {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('materials')
                .select('*')
                .eq('user_id', user.id)
                .order('name');

            if (error) throw error;
            setMaterials(data || []);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                user_id: user.id,
                cost_price: parseFloat(formData.cost_price)
            };

            if (editingMaterial) {
                const { error } = await supabase
                    .from('materials')
                    .update(payload)
                    .eq('id', editingMaterial.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('materials')
                    .insert([payload]);
                if (error) throw error;
            }

            setShowModal(false);
            setEditingMaterial(null);
            setFormData({ name: '', category: 'chapas', unit: 'm2', cost_price: '' });
            fetchMaterials();
        } catch (error) {
            alert('Erro ao salvar material: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este material?')) return;
        try {
            const { error } = await supabase.from('materials').delete().eq('id', id);
            if (error) throw error;
            fetchMaterials();
        } catch (error) {
            alert('Erro ao deletar material');
        }
    };

    const filteredMaterials = materials.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Catálogo de Materiais</h1>
                    <p className="text-sm text-gray-500 mt-1 caps">Gerencie seus custos de insumos e matérias-primas.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingMaterial(null);
                        setFormData({ name: '', category: 'chapas', unit: 'm2', cost_price: '' });
                        setShowModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Material
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nome ou categoria..."
                    className="flex-1 border-none focus:ring-0 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center py-20 animate-pulse">
                    <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">Carregando catálogo...</p>
                </div>
            ) : filteredMaterials.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhum material encontrado</h3>
                    <p className="text-gray-500 mt-1 caps">Comece adicionando seus custos fixos e variáveis.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingMaterial(item);
                                        setFormData({
                                            name: item.name,
                                            category: item.category,
                                            unit: item.unit,
                                            cost_price: item.cost_price.toString()
                                        });
                                        setShowModal(true);
                                    }}
                                    className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                >
                                    <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary-50 p-3 rounded-2xl text-primary-600">
                                    <Package className="h-6 w-6" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{item.category}</span>
                                    <h3 className="text-lg font-bold text-gray-900 mt-0.5">{item.name}</h3>
                                    <div className="mt-4 flex items-end gap-1">
                                        <span className="text-sm font-medium text-gray-400 mb-0.5">R$</span>
                                        <span className="text-2xl font-black text-gray-900 leading-none">
                                            {item.cost_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-xs font-bold text-gray-400 uppercase ml-1 mb-0.5">/ {item.unit}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingMaterial ? 'Editar Material' : 'Novo Material'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Nome do Item</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: MDF Branco Diamante 18mm"
                                        className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 text-sm focus:bg-white focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Categoria</label>
                                        <select
                                            className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 text-sm focus:ring-primary-500 focus:border-primary-500 transition-all font-medium appearance-none"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Unidade</label>
                                        <select
                                            className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 text-sm focus:ring-primary-500 focus:border-primary-500 transition-all font-medium appearance-none"
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        >
                                            <option value="m2">m²</option>
                                            <option value="un">Unidade</option>
                                            <option value="ml">Metro Linear</option>
                                            <option value="kg">kg</option>
                                            <option value="hora">Hora</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Preço de Custo (R$)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 text-sm focus:bg-white focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
                                        value={formData.cost_price}
                                        onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-200 transition-all disabled:opacity-50"
                            >
                                {saving ? 'Salvando...' : (
                                    <>
                                        <Save className="h-5 w-5 mr-2" />
                                        {editingMaterial ? 'Atualizar Material' : 'Adicionar ao Catálogo'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
