import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { uploadImage } from '../../lib/storage';

const projectSchema = z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    category: z.string().min(1, 'Selecione uma categoria'),
    description: z.string().optional(),
    base_price: z.string().transform(v => v === '' ? null : parseFloat(v.replace(',', '.'))),
    execution_time: z.string().optional(),
});

export default function StandardProjectForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: '',
            category: 'cozinha',
            description: '',
            base_price: '',
            execution_time: '',
        }
    });

    useEffect(() => {
        if (id) {
            fetchProject();
        }
    }, [id]);

    async function fetchProject() {
        try {
            const { data, error } = await supabase
                .from('standard_projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                reset({
                    name: data.name,
                    category: data.category,
                    description: data.description || '',
                    base_price: data.base_price ? data.base_price.toString() : '',
                    execution_time: data.execution_time || '',
                });
                if (data.images?.[0]) {
                    setImagePreview(data.images[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching project:', error);
            alert('Erro ao carregar dados do modelo');
        } finally {
            setFetching(false);
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            if (!user) throw new Error('Usuário não autenticado');

            let imageUrls = imagePreview ? [imagePreview] : [];

            if (imageFile) {
                const uploadedUrl = await uploadImage(imageFile);
                imageUrls = [uploadedUrl];
            }

            const payload = {
                ...data,
                user_id: user.id,
                images: imageUrls
            };

            if (id) {
                const { error } = await supabase
                    .from('standard_projects')
                    .update(payload)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('standard_projects')
                    .insert([payload]);
                if (error) throw error;
            }

            navigate('/catalog');
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Erro ao salvar modelo: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center text-gray-500">Carregando dados...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/catalog')}
                    className="inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 mr-1" />
                    Voltar ao Catálogo
                </button>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {id ? 'Editar Modelo' : 'Novo Modelo de Projeto'}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Image Section */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                            Foto de Referência
                        </label>
                        <div className="relative group aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex flex-col items-center justify-center transition-all hover:border-primary-400">
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null);
                                            setImageFile(null);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center p-4">
                                    <Upload className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs text-gray-400 font-medium">PNG, JPG até 5MB</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <p className="mt-3 text-[10px] text-gray-400 text-center uppercase font-bold tracking-widest">
                            Clique para selecionar
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50 space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome do Projeto *</label>
                                <input
                                    {...register('name')}
                                    placeholder="Ex: Armário de Cozinha Provençal"
                                    className={`w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'bg-gray-50'}`}
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categoria *</label>
                                <select
                                    {...register('category')}
                                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border bg-gray-50 transition-all"
                                >
                                    <option value="cozinha">Cozinha</option>
                                    <option value="quarto">Quarto</option>
                                    <option value="closet">Closet</option>
                                    <option value="banheiro">Banheiro</option>
                                    <option value="sala">Sala/Home</option>
                                    <option value="comercial">Comercial</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preço Base (R$)</label>
                                <input
                                    {...register('base_price')}
                                    placeholder="0,00"
                                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border bg-gray-50 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tempo Est. Produção</label>
                                <input
                                    {...register('execution_time')}
                                    placeholder="Ex: 15 dias úteis"
                                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border bg-gray-50 transition-all"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descrição Detalhada</label>
                                <textarea
                                    {...register('description')}
                                    rows={4}
                                    placeholder="Detalhes técnicos, materiais recomendados, diferenciais..."
                                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border bg-gray-50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-8 py-3 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-50"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? 'Salvando...' : (id ? 'Atualizar Modelo' : 'Criar Modelo')}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
