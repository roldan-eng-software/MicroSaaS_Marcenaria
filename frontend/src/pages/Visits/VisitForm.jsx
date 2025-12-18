import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Clock, MapPin, Camera, X, CheckCircle2, Ruler } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { uploadImage } from '../../lib/storage';

const visitSchema = z.object({
    customer_id: z.string().uuid('Selecione um cliente'),
    scheduled_date: z.string().min(1, 'Selecione a data e hora'),
    status: z.string(),
    notes: z.string().optional(),
    color: z.string().optional(),
    hardware_type: z.string().optional(),
    led: z.boolean().default(false),
    led_color: z.string().optional(),
    hinges_type: z.string().optional(),
    slides_type: z.string().optional(),
    mdf_thickness: z.string().optional(),
    measurements: z.object({
        height: z.string().optional(),
        width: z.string().optional(),
        depth: z.string().optional()
    }).optional()
});

export default function VisitForm() {
    const { id, customerId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [customers, setCustomers] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [photoFiles, setPhotoFiles] = useState([]);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(visitSchema),
        defaultValues: {
            customer_id: customerId || '',
            scheduled_date: new Date().toISOString().slice(0, 16),
            status: 'Agendada',
            notes: '',
            led: false,
            measurements: {
                height: '',
                width: '',
                depth: ''
            }
        }
    });

    useEffect(() => {
        fetchCustomers();
        if (id) {
            fetchVisit();
        }
    }, [id]);

    async function fetchCustomers() {
        const { data } = await supabase.from('customers').select('id, name').order('name');
        setCustomers(data || []);
    }

    async function fetchVisit() {
        try {
            const { data, error } = await supabase
                .from('technical_visits')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                reset({
                    ...data,
                    scheduled_date: new Date(data.scheduled_date).toISOString().slice(0, 16),
                    measurements: data.measurements || { height: '', width: '', depth: '' }
                });
                setPhotoPreviews(data.photos || []);
            }
        } catch (error) {
            console.error('Error fetching visit:', error);
            alert('Erro ao carregar dados da visita');
        } finally {
            setFetching(false);
        }
    }

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        setPhotoFiles(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index) => {
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
        setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            let photoUrls = [...photoPreviews.filter(p => p.startsWith('http'))];

            // Upload new photos
            for (const file of photoFiles) {
                const url = await uploadImage(file);
                photoUrls.push(url);
            }

            const payload = {
                ...data,
                photos: photoUrls
            };

            if (id) {
                const { error } = await supabase
                    .from('technical_visits')
                    .update(payload)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('technical_visits')
                    .insert([payload]);
                if (error) throw error;
            }

            navigate('/visits');
        } catch (error) {
            console.error('Error saving visit:', error);
            alert('Erro ao salvar visita: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center text-gray-500">Carregando dados...</div>;

    const currentStatus = watch('status');

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/visits')}
                    className="inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 mr-1" />
                    Voltar para Agenda
                </button>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {id ? 'Editar Visita Técnica' : 'Agendar Nova Visita'}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50 space-y-6">
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest border-l-4 border-primary-500 pl-3">
                                Informações Básicas
                            </h2>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cliente *</label>
                                    <select
                                        {...register('customer_id')}
                                        disabled={!!customerId}
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border bg-gray-50 disabled:opacity-60"
                                    >
                                        <option value="">Selecione um cliente...</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {errors.customer_id && <p className="mt-1 text-xs text-red-600">{errors.customer_id.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data e Hora *</label>
                                    <input
                                        type="datetime-local"
                                        {...register('scheduled_date')}
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                                    <select
                                        {...register('status')}
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border bg-gray-50"
                                    >
                                        <option value="Agendada">Agendada</option>
                                        <option value="Realizada">Realizada</option>
                                        <option value="Cancelada">Cancelada</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50 space-y-6">
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest border-l-4 border-primary-500 pl-3">
                                Medições e Checklist
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-primary-50/30 p-6 rounded-2xl border border-primary-100">
                                <div>
                                    <label className="block text-[10px] font-black text-primary-700 uppercase mb-2">Altura (mm)</label>
                                    <input
                                        {...register('measurements.height')}
                                        placeholder="0000"
                                        className="w-full rounded-xl border-primary-200 focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-primary-700 uppercase mb-2">Largura (mm)</label>
                                    <input
                                        {...register('measurements.width')}
                                        placeholder="0000"
                                        className="w-full rounded-xl border-primary-200 focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-primary-700 uppercase mb-2">Profundidade (mm)</label>
                                    <input
                                        {...register('measurements.depth')}
                                        placeholder="0000"
                                        className="w-full rounded-xl border-primary-200 focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cor/Padrão MDF</label>
                                    <input {...register('color')} placeholder="Ex: Branco Diamante, Louro Freijó" className="w-full rounded-xl border-gray-200 p-3 border bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Espessura MDF</label>
                                    <select {...register('mdf_thickness')} className="w-full rounded-xl border-gray-200 p-3 border bg-gray-50">
                                        <option value="">Selecione...</option>
                                        <option value="15mm">15mm</option>
                                        <option value="18mm">18mm</option>
                                        <option value="25mm">25mm</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo de Dobradiça</label>
                                    <input {...register('hinges_type')} placeholder="Ex: Com amortecimento" className="w-full rounded-xl border-gray-200 p-3 border bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo de Trilho</label>
                                    <input {...register('slides_type')} placeholder="Ex: Telescópico" className="w-full rounded-xl border-gray-200 p-3 border bg-gray-50" />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" {...register('led')} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                <label className="text-sm font-bold text-gray-700">Inclui Iluminação LED?</label>
                            </div>

                            {watch('led') && (
                                <div className="animate-in fade-in slide-in-from-top-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cor/Temperatura do LED</label>
                                    <input {...register('led_color')} placeholder="Ex: 3000K (Branco Quente)" className="w-full rounded-xl border-gray-200 p-3 border bg-gray-50" />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Observações Adicionais</label>
                                <textarea
                                    {...register('notes')}
                                    rows={4}
                                    placeholder="Pontos de energia, encanamento, irregularidades no piso/parede..."
                                    className="w-full rounded-xl border-gray-200 p-3 border bg-gray-50"
                                />
                            </div>
                        </section>
                    </div>

                    {/* Photos and Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fotos do Local</label>
                                <div className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500">
                                    {photoPreviews.length} FOTOS
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {photoPreviews.map((photo, index) => (
                                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                                        <img src={photo} alt="" className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(index)}
                                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/10 transition-all">
                                    <Camera className="h-6 w-6 text-gray-300" />
                                    <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Adicionar</span>
                                    <input type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                </label>
                            </div>
                        </section>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-200 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <Clock className="animate-spin h-5 w-5 mr-2" />
                                    Salvando...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <Save className="h-5 w-5 mr-2" />
                                    {id ? 'Atualizar Medição' : 'Agendar Visita'}
                                </span>
                            )}
                        </button>

                        {id && (
                            <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-green-900 leading-tight">Medição Registrada</p>
                                    <p className="text-[10px] text-green-700 mt-1">Os dados estão salvos e vinculados ao cliente para geração de orçamentos.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
