import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    ArrowLeft,
    Save,
    Calendar,
    User,
    FileText,
    CheckCircle2,
    Clock,
    Package,
    Truck,
    Layout,
    Upload,
    X as XIcon,
    Image as ImageIcon,
    Loader2
} from 'lucide-react';
import clsx from 'clsx';

const STATUS_STEPS = [
    { id: 'Aguardando material', icon: Clock, label: 'Aguardando Mat.' },
    { id: 'Em produção', icon: Package, label: 'Em Produção' },
    { id: 'Pronto', icon: CheckCircle2, label: 'Pronto' },
    { id: 'Instalado', icon: Truck, label: 'Instalado' },
];

export default function OSDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [os, setOS] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [status, setStatus] = useState('');
    const [responsible, setResponsible] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [technicalNotes, setTechnicalNotes] = useState('');
    const [photos, setPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchOS();
    }, [id]);

    async function fetchOS() {
        try {
            const { data, error } = await supabase
                .from('service_orders')
                .select(`
                    *,
                    quote:quotes(
                        quote_number,
                        customer:customers(name, phone, address),
                        items:quote_items(*)
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setOS(data);
            setStatus(data.status);
            setResponsible(data.responsible || '');
            setStartDate(data.start_date ? data.start_date.split('T')[0] : '');
            setEndDate(data.end_date ? data.end_date.split('T')[0] : '');
            setTechnicalNotes(data.technical_notes || '');
            setPhotos(data.photos || []);
        } catch (error) {
            console.error('Error fetching OS:', error);
            navigate('/finance/os');
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('service_orders')
                .update({
                    status,
                    responsible,
                    start_date: startDate || null,
                    end_date: endDate || null,
                    technical_notes: technicalNotes,
                    photos,
                    updated_at: new Date()
                })
                .eq('id', id);

            if (error) throw error;
            alert('Ordem de serviço atualizada com sucesso!');
        } catch (error) {
            console.error('Error saving OS:', error);
            alert('Erro ao salvar OS: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/os/${id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('photos')
                .getPublicUrl(filePath);

            const newPhotos = [...photos, publicUrl];
            setPhotos(newPhotos);

            // Auto-save the photos to the OS
            await supabase
                .from('service_orders')
                .update({ photos: newPhotos })
                .eq('id', id);

        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Erro ao enviar foto: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = async (index) => {
        const newPhotos = photos.filter((_, i) => i !== index);
        setPhotos(newPhotos);

        // Auto-save
        await supabase
            .from('service_orders')
            .update({ photos: newPhotos })
            .eq('id', id);
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Carregando Ordem de Serviço...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/finance/os')}
                    className="inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors font-medium shadow-sm p-1"
                >
                    <ArrowLeft className="h-5 w-5 mr-1" />
                    Voltar para Lista
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">OS #{os.os_number}</span>
                </div>
            </div>

            {/* Status Stepper */}
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-50 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    {STATUS_STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = status === step.id;
                        const isPast = STATUS_STEPS.findIndex(s => s.id === status) > index;

                        return (
                            <div key={step.id} className="flex-1 relative group">
                                <button
                                    onClick={() => setStatus(step.id)}
                                    className={clsx(
                                        "w-full flex md:flex-col items-center gap-4 md:gap-3 p-4 md:p-2 rounded-2xl transition-all",
                                        isActive ? "bg-primary-50 ring-2 ring-primary-500 shadow-lg" :
                                            isPast ? "opacity-40" : "hover:bg-gray-50"
                                    )}
                                >
                                    <div className={clsx(
                                        "h-12 w-12 rounded-xl flex items-center justify-center transition-all",
                                        isActive ? "bg-primary-600 text-white" :
                                            isPast ? "bg-gray-100 text-gray-400" : "bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-primary-600"
                                    )}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="text-left md:text-center">
                                        <p className={clsx(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            isActive ? "text-primary-600" : "text-gray-400"
                                        )}>Etapa {index + 1}</p>
                                        <p className={clsx(
                                            "text-sm font-bold",
                                            isActive ? "text-primary-700" : "text-gray-600"
                                        )}>{step.label}</p>
                                    </div>
                                </button>
                                {index < STATUS_STEPS.length - 1 && (
                                    <div className="hidden md:block absolute top-8 left-[70%] w-[60%] h-0.5 bg-gray-100 -z-10"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Customer & Info */}
                    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-2 w-8 bg-primary-500 rounded-full"></div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Informações Base</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cliente</p>
                                    <p className="text-lg font-bold text-gray-900">{os.quote?.customer?.name}</p>
                                    <p className="text-sm text-gray-500">{os.quote?.customer?.phone}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Endereço de Entrega/Instalação</p>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">{os.quote?.customer?.address}</p>
                                </div>
                            </div>

                            <div className="space-y-6 bg-gray-50/50 p-6 rounded-3xl">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Responsável pela Ordem</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={responsible}
                                            onChange={(e) => setResponsible(e.target.value)}
                                            placeholder="Nome do técnico/marceneiro"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Data Início</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Previsão Conclusão</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Technical Notes */}
                    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-2 w-8 bg-primary-500 rounded-full"></div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Notas Técnicas e de Produção</h2>
                        </div>
                        <textarea
                            rows={6}
                            value={technicalNotes}
                            onChange={(e) => setTechnicalNotes(e.target.value)}
                            placeholder="Descreva detalhes específicos da fabricação, ferragens, cores, ou observações para o montador..."
                            className="w-full rounded-3xl border-gray-100 bg-gray-50 p-6 text-sm focus:bg-white focus:ring-primary-500 focus:border-primary-500 transition-all font-medium leading-relaxed"
                        />
                    </div>

                    {/* Production Gallery */}
                    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-8 bg-primary-500 rounded-full"></div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Galeria de Produção</h2>
                            </div>
                            <label className="cursor-pointer bg-primary-50 text-primary-600 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all flex items-center gap-2">
                                {uploading ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload size={16} />}
                                {uploading ? 'Enviando...' : 'Adicionar Foto'}
                                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                            </label>
                        </div>

                        {photos.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100">
                                <ImageIcon className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold">Nenhuma foto do progresso ainda.</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Registre as etapas da fabricação</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {photos.map((url, idx) => (
                                    <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                        <img src={url} alt={`Produção ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(idx)}
                                                className="p-3 bg-white/20 hover:bg-red-500 text-white rounded-xl backdrop-blur-md transition-all active:scale-90"
                                            >
                                                <XIcon size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Left Sidebar - Summary & Actions */}
                <div className="space-y-6">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Itens para Produção</h3>
                        <div className="space-y-4">
                            {os.quote?.items?.map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-50">
                                    <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-xs font-black text-primary-600 shadow-sm border border-gray-100">
                                        {item.quantity}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate uppercase tracking-tight">{item.description}</p>
                                        <p className="text-[10px] text-gray-400 font-black mt-0.5 tracking-tighter">REF: {os.quote?.quote_number}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 bg-primary-600 text-white font-black rounded-3xl hover:bg-primary-700 active:scale-95 transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center disabled:opacity-50"
                            >
                                <Save className="h-5 w-5 mr-3" />
                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Layout className="h-24 w-24" />
                        </div>
                        <div className="relative">
                            <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-4">Ações Rápidas</p>
                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="w-full py-3 bg-gray-800 text-xs font-bold rounded-2xl hover:bg-gray-700 transition-all flex items-center px-4"
                                >
                                    <FileText className="h-4 w-4 mr-3 text-primary-400" />
                                    Imprimir Etiqueta OS
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
