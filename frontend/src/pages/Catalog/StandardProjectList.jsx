import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Plus, Search, MoreVertical, Edit2, Trash2, Package } from 'lucide-react';

export default function StandardProjectList() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    async function fetchProjects() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('standard_projects')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id) => {
        if (!confirm('Deseja excluir este modelo?')) return;
        try {
            const { error } = await supabase.from('standard_projects').delete().eq('id', id);
            if (error) throw error;
            setProjects(projects.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Erro ao excluir projeto');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Catálogo de Projetos</h1>
                <Link
                    to="/catalog/new"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Modelo
                </Link>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nome ou categoria..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Carregando catálogo...</p>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhum modelo encontrado</h3>
                    <p className="text-gray-500 mt-1 caps">Comece criando seu primeiro projeto padrão.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                {project.images?.[0] ? (
                                    <img
                                        src={project.images[0]}
                                        alt={project.name}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-300">
                                        <Package className="h-12 w-12" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link
                                        to={`/catalog/edit/${project.id}`}
                                        className="p-2 bg-white/90 backdrop-blur rounded-full text-gray-600 hover:text-primary-600 shadow-sm"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        className="p-2 bg-white/90 backdrop-blur rounded-full text-gray-600 hover:text-red-600 shadow-sm"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">
                                        {project.category || 'Geral'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{project.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                    {project.description || 'Sem descrição cadastrada.'}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preço Base</p>
                                        <p className="text-lg font-black text-primary-600">
                                            {project.base_price ? `R$ ${parseFloat(project.base_price).toLocaleString('pt-BR')}` : 'Sob consulta'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tempo est.</p>
                                        <p className="font-bold text-gray-700">{project.execution_time || '--'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
