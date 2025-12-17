import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Pencil, Trash2, Search, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  proposal: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const STATUS_LABELS = {
  draft: 'Rascunho',
  proposal: 'Proposta',
  approved: 'Aprovado',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado'
};

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          customers (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      alert('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Erro ao excluir projeto');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
        <Link
          to="/projects/new"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Link>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Buscar projetos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center p-8">Carregando...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full text-center p-8 text-gray-500">
            Nenhum projeto encontrado.
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-800'
                  )}>
                    {STATUS_LABELS[project.status] || project.status}
                  </span>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-indigo-600">
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => handleDelete(project.id)}
                        className="text-gray-400 hover:text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 truncate mb-2">
                  {project.title}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    {project.customers?.name || 'Sem cliente'}
                  </div>
                  {project.deadline && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      Entrega: {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                {project.budget_estimated && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Orçamento</span>
                        <span className="text-sm font-semibold text-gray-900">
                            R$ {project.budget_estimated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
