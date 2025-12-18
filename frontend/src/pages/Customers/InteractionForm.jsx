import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Save, MessageSquare, Phone, User, Mail, AlertTriangle } from 'lucide-react';

export default function InteractionForm({ customerId, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Contato',
        channel: 'WhatsApp',
        description: '',
        urgency: 'Média',
        timeline: ''
    });

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('interactions')
                .insert([{
                    ...formData,
                    customer_id: customerId
                }]);

            if (error) throw error;
            onSuccess();
        } catch (error) {
            console.error('Error saving interaction:', error);
            alert('Erro ao salvar interação');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all scale-100">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-primary-50">
                    <h3 className="text-lg font-bold text-primary-900 flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-primary-600" />
                        Registrar Atendimento
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-white transition-all">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tipo</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm p-2.5 border bg-gray-50"
                            >
                                <option value="Contato">Contato Inicial</option>
                                <option value="Visita">Visita Técnica</option>
                                <option value="Proposta">Envio de Proposta</option>
                                <option value="Acompanhamento">Acompanhamento (Follow-up)</option>
                                <option value="Fechamento">Fechamento / Contrato</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Canal</label>
                            <select
                                value={formData.channel}
                                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                                className="w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm p-2.5 border bg-gray-50"
                            >
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Telefone">Telefone</option>
                                <option value="Presencial">Presencial / Local</option>
                                <option value="Email">Email</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">O que foi conversado?</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Resuma brevemente o contato..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm p-2.5 border bg-gray-50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-1" /> Urgência
                            </label>
                            <div className="flex gap-2 mt-1">
                                {['Baixa', 'Média', 'Alta'].map((u) => (
                                    <button
                                        key={u}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, urgency: u })}
                                        className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-md border transition-all ${formData.urgency === u
                                            ? u === 'Alta' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                                u === 'Média' ? 'bg-yellow-500 border-yellow-500 text-white shadow-md' :
                                                    'bg-green-600 border-green-600 text-white shadow-md'
                                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        {u}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Expectativa Prazo</label>
                            <input
                                type="text"
                                placeholder="Ex: Para janeiro"
                                value={formData.timeline}
                                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                                className="w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm p-2.5 border bg-gray-50"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all border border-transparent"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-50 flex items-center justify-center"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Salvando...' : 'Registrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
