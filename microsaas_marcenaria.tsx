import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Users, FileText, Wrench, ClipboardCheck, Database, Rocket, Calendar } from 'lucide-react';

const MVPFase1 = () => {
  const [expandedSections, setExpandedSections] = useState({ module1: true });
  const [completedItems, setCompletedItems] = useState({});

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleComplete = (id) => {
    setCompletedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const modules = [
    {
      id: 'module1',
      title: 'MÓDULO 1: Gestão de Clientes & Lead',
      icon: Users,
      color: 'bg-blue-600',
      priority: 'FASE 1',
      weeks: 'Semanas 1-3',
      features: [
        {
          id: 'm1f1',
          name: 'Cadastro de Clientes',
          tasks: [
            'Nome completo, telefone (WhatsApp), email',
            'Endereço completo (para instalação)',
            'Origem do contato (WhatsApp, indicação, Instagram)',
            'Status: Lead, Em negociação, Cliente ativo',
            'Histórico completo de interações'
          ]
        },
        {
          id: 'm1f2',
          name: 'Registro de Contato Inicial',
          tasks: [
            'Data/hora do primeiro contato',
            'Canal (WhatsApp, telefone, presencial)',
            'Descrição breve do que o cliente quer',
            'Urgência (alta, média, baixa)',
            'Timeline: quando precisa ficar pronto'
          ]
        },
        {
          id: 'm1f3',
          name: 'Lista de Clientes',
          tasks: [
            'Busca por nome, telefone',
            'Filtros: status, origem, período',
            'Ordenação por data de cadastro',
            'Visualização rápida de pendências'
          ]
        }
      ]
    },
    {
      id: 'module2',
      title: 'MÓDULO 2: Projetos Padrão',
      icon: FileText,
      color: 'bg-purple-600',
      priority: 'FASE 1',
      weeks: 'Semanas 2-4',
      features: [
        {
          id: 'm2f1',
          name: 'Catálogo de Projetos Padrão',
          tasks: [
            'Nome do projeto (ex: "Cozinha Completa 3m")',
            'Categoria (cozinha, quarto, closet, banheiro)',
            'Descrição detalhada',
            'Fotos/imagens de referência',
            'Lista pré-definida de materiais',
            'Tempo médio de execução',
            'Preço base padrão'
          ]
        },
        {
          id: 'm2f2',
          name: 'Verificação Rápida',
          tasks: [
            'Ao criar novo atendimento, mostrar projetos padrão',
            'Cliente pode escolher um padrão',
            'Sistema já puxa os materiais/custos',
            'Permite pequenos ajustes (cor, puxador)',
            'Se não for padrão → encaminha para visita técnica'
          ]
        }
      ]
    },
    {
      id: 'module3',
      title: 'MÓDULO 3: Visitas Técnicas',
      icon: Wrench,
      color: 'bg-orange-600',
      priority: 'FASE 1',
      weeks: 'Semanas 3-5',
      features: [
        {
          id: 'm3f1',
          name: 'Agendamento de Visita',
          tasks: [
            'Data e horário da visita',
            'Endereço do cliente (auto-preenchido)',
            'Responsável pela visita',
            'Status: Agendada, Realizada, Cancelada',
            'Notificação/lembrete 1 dia antes'
          ]
        },
        {
          id: 'm3f2',
          name: 'Formulário de Coleta (Mobile First)',
          tasks: [
            'Medidas: Altura, Largura, Profundidade',
            'Upload de fotos do local (múltiplas)',
            'Cor escolhida (com paleta visual)',
            'Tipo de puxador (dropdown com imagens)',
            'Iluminação LED: Sim/Não + Cor (branca/amarela)',
            'Tipo de dobradiças (dropdown)',
            'Tipo de corrediças (dropdown)',
            'Espessura do MDF (15mm, 18mm, 25mm)',
            'Campo de observações (texto livre)',
            'Botão: "Salvar e Criar Orçamento"'
          ]
        },
        {
          id: 'm3f3',
          name: 'Histórico de Visitas',
          tasks: [
            'Lista de todas as visitas por cliente',
            'Ver fotos e dados coletados',
            'Editar informações se necessário'
          ]
        }
      ]
    },
    {
      id: 'module4',
      title: 'MÓDULO 4: Catálogo & Precificação',
      icon: Database,
      color: 'bg-green-600',
      priority: 'FASE 1',
      weeks: 'Semanas 4-6',
      features: [
        {
          id: 'm4f1',
          name: 'Cadastro de Materiais',
          tasks: [
            'Nome (ex: "Chapa MDF 15mm Branco")',
            'Categoria (chapas, ferragens, acabamentos, LED, mão de obra)',
            'Unidade (m², unidade, ml, kg)',
            'Preço de custo (atualizado)',
            'Fornecedor principal',
            'Última atualização de preço'
          ]
        },
        {
          id: 'm4f2',
          name: 'Configuração de Custos',
          tasks: [
            'Custos Fixos Mensais: Aluguel, energia, internet',
            'Percentual de custos fixos por projeto',
            'Margem de lucro padrão (%)',
            'Impostos/taxas (%)',
            'Custo de mão de obra por hora',
            'Fórmula: (Material + Fixos + Mão de obra) × (1 + Lucro%) × (1 + Impostos%)'
          ]
        },
        {
          id: 'm4f3',
          name: 'Gestão de Preços',
          tasks: [
            'Histórico de alterações de preço',
            'Alerta quando preço está defasado (>30 dias)',
            'Importação em lote via Excel'
          ]
        }
      ]
    },
    {
      id: 'module5',
      title: 'MÓDULO 5: Geração de Orçamentos',
      icon: FileText,
      color: 'bg-indigo-600',
      priority: 'FASE 1',
      weeks: 'Semanas 5-7',
      features: [
        {
          id: 'm5f1',
          name: 'Construtor de Orçamento',
          tasks: [
            'Selecionar cliente (ou criar novo)',
            'Escolher projeto padrão OU criar personalizado',
            'Se padrão: materiais já vêm pré-carregados',
            'Se personalizado: puxar dados da visita técnica',
            'Adicionar itens do catálogo com quantidade',
            'Cálculo automático por item',
            'Subtotais por categoria',
            'Aplicar custos fixos proporcionais',
            'Aplicar margem de lucro',
            'Aplicar impostos',
            'TOTAL FINAL destacado'
          ]
        },
        {
          id: 'm5f2',
          name: 'Ajustes Manuais',
          tasks: [
            'Permitir descontos (% ou R$)',
            'Adicionar itens extras não catalogados',
            'Ajustar margem de lucro específica',
            'Campo para condições de pagamento',
            'Prazo de validade do orçamento (padrão 15 dias)'
          ]
        },
        {
          id: 'm5f3',
          name: 'Geração de PDF Profissional',
          tasks: [
            'Header: Logo + dados da empresa',
            'Dados do cliente',
            'Número do orçamento (auto-incremento)',
            'Data de emissão',
            'Tabela detalhada: Item, Qtd, Unidade, Valor Unit, Subtotal',
            'Resumo: Subtotal, Descontos, Total',
            'Condições de pagamento',
            'Validade',
            'Observações',
            'Footer: Telefone, WhatsApp, Instagram',
            'Template personalizável (cores da marca)'
          ]
        },
        {
          id: 'm5f4',
          name: 'Envio via WhatsApp',
          tasks: [
            'Botão "Enviar por WhatsApp"',
            'Abre WhatsApp Web com PDF anexado',
            'Mensagem pré-formatada personalizável',
            'Registra data/hora do envio',
            'Status: Enviado, Visualizado (manual), Aprovado/Recusado'
          ]
        }
      ]
    },
    {
      id: 'module6',
      title: 'MÓDULO 6: OS & Contrato',
      icon: ClipboardCheck,
      color: 'bg-red-600',
      priority: 'FASE 1',
      weeks: 'Semanas 6-8',
      features: [
        {
          id: 'm6f1',
          name: 'Geração de Ordem de Serviço',
          tasks: [
            'Disparada automaticamente quando orçamento aprovado',
            'Número da OS (auto-incremento)',
            'Referência ao orçamento aprovado',
            'Dados do cliente',
            'Lista completa de itens/serviços',
            'Data prevista de início',
            'Data prevista de conclusão',
            'Responsável pela execução',
            'Observações técnicas',
            'Status: Aguardando material, Em produção, Pronto, Instalado'
          ]
        },
        {
          id: 'm6f2',
          name: 'Contrato de Prestação de Serviço',
          tasks: [
            'Template editável com cláusulas padrão',
            'Auto-preenche: dados do cliente, valor, prazo',
            'Condições de pagamento detalhadas',
            'Garantias oferecidas',
            'Responsabilidades de cada parte',
            'Cláusula de cancelamento',
            'Geração em PDF para assinatura',
            'Upload do contrato assinado'
          ]
        },
        {
          id: 'm6f3',
          name: 'Acompanhamento de Status',
          tasks: [
            'Timeline visual do projeto',
            'Atualizar status manualmente',
            'Adicionar fotos do progresso',
            'Notificar cliente de atualizações importantes'
          ]
        }
      ]
    },
    {
      id: 'module7',
      title: 'MÓDULO 7: Dashboard & Relatórios',
      icon: Calendar,
      color: 'bg-cyan-600',
      priority: 'FASE 1',
      weeks: 'Semanas 7-8',
      features: [
        {
          id: 'm7f1',
          name: 'Dashboard Principal',
          tasks: [
            'Orçamentos pendentes de resposta',
            'Taxa de conversão (aprovados/total)',
            'Faturamento do mês (aprovados)',
            'Projetos em andamento',
            'Visitas técnicas agendadas',
            'Alertas: orçamentos próximos de vencer, visitas hoje'
          ]
        },
        {
          id: 'm7f2',
          name: 'Relatórios Básicos',
          tasks: [
            'Orçamentos por período (quantidade e valor)',
            'Taxa de aprovação mensal',
            'Tempo médio entre orçamento e aprovação',
            'Projetos concluídos no mês',
            'Exportação para Excel/PDF'
          ]
        }
      ]
    }
  ];

  const tecnicalStack = {
    frontend: [
      'React 18 + Vite',
      'Tailwind CSS + shadcn/ui',
      'React Router DOM',
      'Zustand (estado global)',
      'React Hook Form + Zod (validação)',
      'jsPDF (geração de PDF)',
      'Axios (requisições)',
      'Date-fns (datas)'
    ],
    backend: [
      'Supabase (PostgreSQL + Auth + Storage)',
      'Row Level Security (RLS)',
      'Realtime subscriptions',
      'Storage para fotos/PDFs'
    ],
    deploy: [
      'Vercel (frontend)',
      'Supabase Cloud (backend)',
      'Domínio personalizado'
    ]
  };

  const database = [
    {
      table: 'users',
      fields: 'id, email, company_name, logo_url, phone, address, created_at'
    },
    {
      table: 'customers',
      fields: 'id, user_id, name, phone, email, address, origin, status, created_at'
    },
    {
      table: 'standard_projects',
      fields: 'id, user_id, name, category, description, base_price, execution_time, images'
    },
    {
      table: 'technical_visits',
      fields: 'id, customer_id, scheduled_date, status, measurements, photos, color, hardware_type, led, hinges, slides, mdf_thickness, notes'
    },
    {
      table: 'materials',
      fields: 'id, user_id, name, category, unit, cost_price, supplier, updated_at'
    },
    {
      table: 'quotes',
      fields: 'id, user_id, customer_id, quote_number, status, total, discount, valid_until, sent_at, approved_at, notes'
    },
    {
      table: 'quote_items',
      fields: 'id, quote_id, material_id, quantity, unit_price, subtotal'
    },
    {
      table: 'service_orders',
      fields: 'id, quote_id, os_number, status, start_date, end_date, responsible, technical_notes'
    },
    {
      table: 'contracts',
      fields: 'id, quote_id, contract_pdf_url, signed_pdf_url, signed_at'
    }
  ];

  const timeline = [
    { phase: 'Semana 1-2', tasks: ['Setup completo', 'Auth + Perfil', 'Design Figma', 'Estrutura DB'] },
    { phase: 'Semana 3', tasks: ['Módulo Clientes', 'Registro de contatos'] },
    { phase: 'Semana 4', tasks: ['Projetos Padrão', 'Visitas: Agendamento'] },
    { phase: 'Semana 5', tasks: ['Visitas: Formulário', 'Catálogo materiais'] },
    { phase: 'Semana 6', tasks: ['Orçamentos: Construtor', 'Cálculos'] },
    { phase: 'Semana 7', tasks: ['PDF + WhatsApp', 'OS + Contrato'] },
    { phase: 'Semana 8', tasks: ['Dashboard', 'Testes finais', 'Deploy'] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">
                🪚 MVP Fase 1 - Sistema Completo Marcenaria
              </h1>
              <p className="text-orange-100 text-lg mb-2">
                Do primeiro contato até a geração de OS/Contrato
              </p>
              <div className="flex gap-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full text-white">⏱️ 8 semanas</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-white">💰 ~R$ 50/mês</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-white">📱 Mobile First</span>
              </div>
            </div>
            <Rocket className="text-white" size={80} />
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8 shadow-xl border border-slate-700">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Calendar className="text-orange-500" />
            Cronograma de Desenvolvimento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {timeline.map((item, idx) => (
              <div key={idx} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="font-bold text-orange-400 mb-2 text-sm">{item.phase}</div>
                <ul className="space-y-1">
                  {item.tasks.map((task, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">▸</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Modules */}
        <div className="space-y-5">
          {modules.map((module) => {
            const Icon = module.icon;
            const isExpanded = expandedSections[module.id];
            const moduleProgress = module.features.filter(f => completedItems[f.id]).length;
            const moduleTotal = module.features.length;
            const progressPercent = (moduleProgress / moduleTotal) * 100;

            return (
              <div key={module.id} className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
                <div
                  className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-750 transition-colors"
                  onClick={() => toggleSection(module.id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${module.color}`}>
                      <Icon className="text-white" size={28} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">{module.title}</h2>
                      <div className="flex gap-3 text-sm">
                        <span className="text-orange-400 font-semibold">{module.weeks}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400">{moduleProgress}/{moduleTotal} features</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-slate-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${module.color} transition-all duration-300`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="text-slate-400" />
                    ) : (
                      <ChevronRight className="text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 space-y-4 bg-slate-850">
                    {module.features.map((feature) => {
                      const isCompleted = completedItems[feature.id];
                      return (
                        <div key={feature.id} className="bg-slate-700 rounded-lg p-5 border border-slate-600">
                          <div
                            className="flex items-start gap-3 cursor-pointer mb-3"
                            onClick={() => toggleComplete(feature.id)}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={24} />
                            ) : (
                              <Circle className="text-slate-500 flex-shrink-0 mt-0.5" size={24} />
                            )}
                            <span className={`font-bold text-lg ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                              {feature.name}
                            </span>
                          </div>
                          <ul className="ml-9 space-y-2">
                            {feature.tasks.map((task, idx) => (
                              <li key={idx} className={`text-sm flex items-start gap-2 ${isCompleted ? 'text-slate-500' : 'text-slate-300'}`}>
                                <span className="text-orange-500 font-bold">→</span>
                                <span>{task}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tech Stack */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">🎨 Frontend</h3>
            <ul className="space-y-2">
              {tecnicalStack.frontend.map((tech, idx) => (
                <li key={idx} className="text-slate-300 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  {tech}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">⚙️ Backend</h3>
            <ul className="space-y-2">
              {tecnicalStack.backend.map((tech, idx) => (
                <li key={idx} className="text-slate-300 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {tech}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">🚀 Deploy</h3>
            <ul className="space-y-2">
              {tecnicalStack.deploy.map((tech, idx) => (
                <li key={idx} className="text-slate-300 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Database Schema */}
        <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <Database className="text-purple-500" />
            Estrutura do Banco de Dados
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {database.map((table, idx) => (
              <div key={idx} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="font-mono font-bold text-purple-400 mb-2">{table.table}</div>
                <div className="text-xs text-slate-400 font-mono">{table.fields}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-6">🎯 Próximos Passos IMEDIATOS</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-5">
              <h4 className="font-bold text-white mb-3 text-lg">1️⃣ Esta Semana</h4>
              <ul className="text-green-50 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">▸</span>
                  <span>Você vai desenvolver ou contratar dev?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">▸</span>
                  <span>Tem experiência com React/JavaScript?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">▸</span>
                  <span>Orçamento disponível para desenvolvimento?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">▸</span>
                  <span>Criar conta Supabase (grátis)</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-5">
              <h4 className="font-bold text-white mb-3 text-lg">2️⃣ Semana 1-2</h4>
              <ul className="text-green-50 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">▸</span>
                  <span>Criar mockups no Figma (3-5 telas principais)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">▸</span>
                  <span>Definir paleta de cores da sua marca</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">▸</span>
                  <span>Listar todos os materiais que você usa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">▸</span>
                  <span>Setup inicial do projeto React</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-slate-500 text-sm">
          💡 Clique nos módulos para expandir • Clique nas features para marcar como concluído
        </div>
      </div>
    </div>
  );
};

export default MVPFase1;