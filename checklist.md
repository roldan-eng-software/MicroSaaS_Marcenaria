# 📋 Checklist de Desenvolvimento - SaaS Marcenaria
## MVP Fase 01 + Padrão Deploy Estável

---

## 🎯 Visão Geral do Projeto

| Aspecto | Descrição |
|--------|-----------|
| **Duração** | 8 semanas |
| **Stack** | React 18 + Vite (Frontend) / Supabase PostgreSQL (Backend) |
| **Arquitetura** | Docker + Docker Compose + GitHub Actions |
| **Hospedagem** | Vercel (Frontend) + Supabase Cloud (Backend) |
| **Objetivo** | Sistema completo de gerenciamento de projetos de marcenaria do primeiro contato até geração de OS/Contrato |

---

## ⚙️ FASE 0: PREPARAÇÃO E INFRAESTRUTURA (Semana 0-1)

### 0.1 Configuração Inicial do Projeto

- [x] **Setup do Repositório**
  - [x] Criar repositório no GitHub
  - [x] Clone local do projeto
  - [x] Branch strategy: `main` (produção), `develop` (testes), `feature/*` (desenvolvimento)
  - [x] Configurar `.gitignore` (node_modules, .env, __pycache__, etc.)
  - [x] Criar arquivo `.env.example` documentando todas as variáveis

- [x] **Estrutura de Pastas Esperada**
  ```
  projeto-marcenaria/
  ├── backend/
  │   ├── Dockerfile
  │   ├── requirements.txt
  │   └── app/
  ├── frontend/
  │   ├── Dockerfile
  │   ├── nginx.conf
  │   ├── package.json
  │   ├── pnpm-lock.yaml
  │   ├── vite.config.js
  │   └── src/
  ├── docker-compose.yml
  ├── .github/
  │   └── workflows/
  │       └── deploy.yml
  └── .env.example
  ```

### 0.2 Configuração de Secrets no GitHub

- [ ] **Adicionar Secrets no GitHub (Settings → Secrets and variables → Actions)**
  - [ ] `HOSTINGER_HOST` - IP ou domínio da VPS
  - [ ] `HOSTINGER_USER` - Usuário SSH
  - [ ] `HOSTINGER_SSHKEY` - Chave SSH privada
  - [ ] `HOSTINGER_PORT` - Porta SSH (geralmente 22)
  - [ ] Documentar cada secret para futuras referências

### 0.3 Configuração de Variáveis de Ambiente

- [x] **Backend - Variáveis Críticas**
  - [x] `DEBUG` = True (em desenvolvimento)
  - [x] `DATABASE_URL` = postgresql://postgres:securepassword@db:5432/appname
  - [x] `ALLOWED_HOSTS` = localhost,127.0.0.1
  - [x] `SUPABASE_URL` = URL do projeto Supabase
  - [x] `SUPABASE_KEY` = Chave anônima Supabase (ou service_role if needed)
  - [x] Criar arquivo `.env.example` no backend com todas as variáveis

- [x] **Frontend - Variáveis Críticas**
  - [x] `VITE_API_URL` = http://localhost:8000
  - [x] `VITE_SUPABASE_URL` = URL do projeto Supabase
  - [x] `VITE_SUPABASE_ANON_KEY` = Chave anônima Supabase
  - [x] Criar arquivo `.env.example` no frontend com todas as variáveis

### 0.4 Conta Supabase - Setup Gratuito

- [x] **Criar Conta e Projeto Supabase**
  - [x] Acessar https://supabase.com (gratuito)
  - [x] Criar novo projeto (PostgreSQL 16)
  - [x] Copiar `SUPABASE_URL` e `SUPABASE_ANON_KEY`
  - [x] Habilitar Auth (Email/Password)
  - [x] Habilitar RLS (Row Level Security) nas tabelas
  - [x] Configurar Storage para fotos/PDFs (Buckets 'photos' e 'documents' criados)

### 0.5 Design e Prototipagem

- [/] **Figma - Mockups das Telas Principais**
  - [x] Dashboard Principal (Layout base pronto)
  - [x] Tela de Clientes (CRUD pronto)
  - [/] Tela de Visita Técnica (próximo módulo)
  - [/] Tela de Geração de Orçamento
  - [x] Paleta de cores definida (Tailwind padrão + customização)
  - [x] Componentes reutilizáveis definidos (Layout, Sidebar)

- [x] **Documentação de Design**
  - [x] Cores definidas e documentadas (ver brain/design_system.md)
  - [x] Tipografia (Inter)
  - [x] Ícones selecionados (lucide-react)
  - [x] Componentes padrão documentados

---

## 🗄️ FASE 1: BANCO DE DADOS E AUTENTICAÇÃO (Semana 1-2)

### 1.1 Schema do Banco de Dados
- [x] **Criar migrações/scripts SQL para tabelas core (`users`, `customers`, etc)**

- [x] **Tabela: users (Profiles)**
  ```sql
  - id (UUID, PK)
  - email (auth.users)
  - company_name (TEXT)
  - logo_url (avatar_url)
  - phone (TEXT)
  - address (TEXT)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
  ```

- [x] **Tabela: customers**
  ```sql
  - id (UUID, PK)
  - user_id (UUID, FK → profiles)
  - name (TEXT)
  - phone (TEXT)
  - email (TEXT)
  - address (TEXT)
  - origin (TEXT) - WhatsApp, indicação, Instagram, etc
  - status (TEXT) - Lead, Em negociação, Cliente ativo
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
  ```

- [x] **Tabela: standard_projects**
- [x] **Tabela: technical_visits**
- [x] **Tabela: materials**
- [x] **Tabela: fixed_costs**
- [x] **Tabela: projects**

- [x] **Tabela: quotes**
- [x] **Tabela: quote_items**
- [x] **Tabela: service_orders**
- [x] **Tabela: contracts**

### 1.2 RLS (Row Level Security) - Configuração

- [x] **Habilitar RLS em todas as tabelas**
  - [x] Somente o owner (user_id) pode ver/editar seus dados
  - [x] Criar políticas para cada tabela
  - [ ] Testar acesso entre usuários diferentes

- [ ] **Exemplo de RLS para tabela 'customers'**
  ```sql
  ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Users can only see their own customers"
  ON customers
  FOR SELECT
  USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can insert their own customers"
  ON customers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  ```

### 1.3 Autenticação Frontend

- [x] **Setup Supabase Auth no React**
  - [x] Instalar: `npm install @supabase/supabase-js`
  - [x] Criar arquivo `src/lib/supabaseClient.ts` (ou .js)
  - [x] Configurar cliente Supabase com URL e ANON_KEY
  - [x] Criar hook customizado `useAuth()` para autenticação

- [x] **Tela de Login**
  - [x] Campos: Email, Senha
  - [x] Botão: "Entrar"
  - [ ] Link: "Criar Conta"
  - [ ] Validação de email (Zod)
  - [x] Tratamento de erros (credenciais inválidas)
  - [x] Redirecionamento após login bem-sucedido

- [ ] **Tela de Registro**
  - [ ] Campos: Email, Senha, Confirmar Senha, Nome da Empresa
  - [ ] Validação de senhas (mínimo 8 caracteres)
  - [ ] Botão: "Criar Conta"
  - [ ] Link: "Já tem conta? Entrar"
  - [ ] Mensagem de sucesso e redirecionamento

- [x] **Protected Routes**
  - [x] Criar componente `ProtectedRoute`
  - [x] Redirecionar usuários não autenticados para login
  - [x] Manter sessão após refresh da página

### 1.4 Integração com Zustand (Estado Global)

- [ ] **Criar store de autenticação**
  - [ ] `authStore` com: user, isLoading, error
  - [ ] Ações: login, logout, register
  - [ ] Persistir sessão

---

## 🔧 FASE 2: MÓDULO 1 - GESTÃO DE CLIENTES (Semana 2-3)

### 2.1 Cadastro de Clientes (Feature M1F1)

- [x] **Tela de Cadastro**
  - [x] Campos obrigatórios:
    - [x] Nome completo (texto)
    - [x] Telefone/WhatsApp (máscarado: (XX) XXXXX-XXXX)
    - [x] Email (validado)
    - [x] Endereço completo para instalação (textarea)
    - [x] Origem do contato (select: WhatsApp, indicação, Instagram, outro)
    - [x] Status (select: Lead, Em negociação, Cliente ativo)
  - [x] Botões: Salvar, Cancelar
  - [ ] Validação com React Hook Form + Zod
  - [x] Mensagem de sucesso após salvar
  - [x] Captura automática de data/hora de criação

- [ ] **Backend - Função de Criar Cliente**
  - [ ] POST `/api/customers`
  - [ ] Validação de dados (backend)
  - [ ] Verificar autenticação
  - [ ] Salvar no Supabase
  - [ ] Retornar cliente criado com ID

### 2.2 Registro de Contato Inicial (Feature M1F2)

- [ ] **Histórico de Interações por Cliente**
  - [ ] Tabela: `interactions` (id, customer_id, type, channel, description, urgency, timeline, created_at)
  - [ ] Tipo: Contato, Visita, Proposta, Aprovação, etc
  - [ ] Canal: WhatsApp, Telefone, Presencial, Email
  - [ ] Urgência: Alta, Média, Baixa
  - [ ] Timeline: Quando precisa ficar pronto

- [ ] **UI de Registro de Contato**
  - [ ] Botão "Novo Contato" na visualização do cliente
  - [ ] Campos: Descrição, Canal, Urgência, Timeline
  - [ ] Salvar com data/hora automática
  - [ ] Timeline visual (lista de interações ordenadas)

### 2.3 Lista de Clientes (Feature M1F3)

- [x] **Tela de Listagem**
  - [x] Tabela com colunas: Nome, Telefone, Status, Origem, Último Contato
  - [x] Busca por nome ou telefone (em tempo real)
  - [ ] Filtros: Por status, origem, período (últimos 7 dias, 30 dias, etc)
  - [ ] Ordenação: Por data de cadastro, nome
  - [ ] Paginação (10, 25, 50 registros por página)

- [ ] **Ações na Lista**
  - [ ] Clicar para visualizar/editar cliente
  - [ ] Botão "Novo Cliente"
  - [ ] Indicador visual de pendências (ex: orçamentos prximos de vencer)

- [ ] **Edição de Cliente**
  - [ ] Pré-carrega dados do cliente
  - [ ] Permite editar todos os campos
  - [ ] Valida dados antes de salvar
  - [ ] Mostra aviso se houver mudanças não salvas

### 2.4 Testes do Módulo 1

- [ ] **Testes Locais**
  - [ ] Criar cliente - ✅ Salva no banco
  - [ ] Buscar cliente - ✅ Lista aparece
  - [ ] Editar cliente - ✅ Altera dados
  - [ ] Deletar cliente - ✅ Remove da lista
  - [ ] Validação - ✅ Rejeita dados inválidos
  - [ ] RLS - ✅ Usuário A não vê dados de Usuário B

- [ ] **Deployment para Homologação**
  - [ ] Fazer commit em branch `feature/modulo-1-clientes`
  - [ ] Criar PR para `develop`
  - [ ] Código review (checklist de qualidade)
  - [ ] Merge para `develop`
  - [ ] Teste em ambiente de homologação
  - [ ] Documenta issues encontradas

---

## 📋 FASE 3: MÓDULO 2 - PROJETOS PADRÃO (Semana 3-4)

### 3.1 Catálogo de Projetos Padrão (Feature M2F1)

- [ ] **Tabela: standard_projects**
  - [ ] Campos já definidos na FASE 1

- [ ] **Backend - CRUD de Projetos Padrão**
  - [ ] GET `/api/projects` - Listar projetos do usuário
  - [ ] POST `/api/projects` - Criar novo projeto
  - [ ] GET `/api/projects/{id}` - Detalhes do projeto
  - [ ] PUT `/api/projects/{id}` - Editar projeto
  - [ ] DELETE `/api/projects/{id}` - Deletar projeto

- [ ] **Tela de Gerenciamento de Projetos Padrão**
  - [ ] Listagem com cards mostrando:
    - [ ] Imagem de referência (primeira foto)
    - [ ] Nome do projeto
    - [ ] Categoria (badge com cor)
    - [ ] Preço base
    - [ ] Tempo de execução
  - [ ] Botão "Novo Projeto Padrão"
  - [ ] Ações: Editar, Deletar, Visualizar Detalhes

- [ ] **Tela de Criar/Editar Projeto**
  - [ ] Campos:
    - [ ] Nome (texto)
    - [ ] Categoria (select: Cozinha, Quarto, Closet, Banheiro)
    - [ ] Descrição (textarea longo)
    - [ ] Fotos/Imagens (upload múltiplo para Supabase Storage)
    - [ ] Preço base (decimal)
    - [ ] Tempo médio de execução (ex: 15 dias)
  - [ ] Validação
  - [ ] Preview de imagens
  - [ ] Botões: Salvar, Cancelar

### 3.2 Verificação Rápida (Feature M2F2)

- [ ] **Lógica de Sugestão**
  - [ ] Ao criar novo atendimento para cliente
  - [ ] Sistema sugere projetos padrão similares
  - [ ] Cliente pode escolher um padrão
  - [ ] Se padrão escolhido → Sistema puxa materiais/custos automáticos
  - [ ] Se não padrao → Encaminha para agendamento de visita técnica

- [ ] **UI de Seleção**
  - [ ] Modal com grid de projetos padrão
  - [ ] Cada card clicável
  - [ ] Ao clicar → Carrega itens e valores do projeto
  - [ ] Opção "Projeto Personalizado" (vai para agendamento de visita)

### 3.3 Testes do Módulo 2

- [ ] **Testes Locais**
  - [ ] Criar projeto padrão - ✅ Salva com imagens
  - [ ] Listar projetos - ✅ Mostra todos
  - [ ] Sugestão rápida - ✅ Carrega materiais automáticos
  - [ ] Deletar projeto - ✅ Remove da lista

- [ ] **Deployment para Homologação**
  - [ ] Branch `feature/modulo-2-projetos-padrao`
  - [ ] PR para `develop`
  - [ ] Teste em homologação
  - [ ] Merge em `develop`

---

## 🔍 FASE 4: MÓDULO 3 - VISITAS TÉCNICAS (Semana 4-5)

### 4.1 Agendamento de Visita (Feature M3F1)

- [ ] **Tela de Agendamento**
  - [ ] Campos:
    - [ ] Data e horário (datetime picker)
    - [ ] Endereço do cliente (auto-preenchido)
    - [ ] Responsável pela visita (select com usuários)
    - [ ] Status (read-only inicialmente: Agendada)
  - [ ] Validação (data não pode ser no passado)
  - [ ] Botão: Agendar, Cancelar

- [ ] **Backend - Agendamento**
  - [ ] POST `/api/technical-visits` - Agendar visita
  - [ ] GET `/api/technical-visits?customer_id=X` - Listar visitas do cliente
  - [ ] PUT `/api/technical-visits/{id}` - Atualizar status
  - [ ] DELETE `/api/technical-visits/{id}` - Cancelar visita

- [ ] **Notificação de Lembrete**
  - [ ] Sistema envia lembrete 1 dia antes (implementar depois com backend job)
  - [ ] Pode ser email ou push notification
  - [ ] Documentar como implementar

### 4.2 Formulário de Coleta Mobile-First (Feature M3F2)

**CRÍTICO: Principais campos do formulário de visita técnica**

- [ ] **Upload de Fotos**
  - [ ] Câmera do celular (se mobile)
  - [ ] Múltiplas fotos do local
  - [ ] Salvar em Supabase Storage
  - [ ] Listar fotos no formulário

- [ ] **Medidas**
  - [ ] Campos: Altura (cm), Largura (cm), Profundidade (cm)
  - [ ] Validação numérica
  - [ ] Exemplo: Medir espaço da cozinha

- [ ] **Cor Escolhida**
  - [ ] Paleta visual de cores
  - [ ] Permitir visualizar cor no espaço (se possível)
  - [ ] Salvar cor escolhida

- [ ] **Tipo de Puxador**
  - [ ] Dropdown com imagens
  - [ ] Opções: Alça de alumínio, Aço inox, Madeira, etc
  - [ ] Cada opção mostra foto de referência

- [ ] **Iluminação LED**
  - [ ] Radio button: Sim / Não
  - [ ] Se Sim → Cor LED (branca, amarela)
  - [ ] Se Não → Oculta campo de cor

- [ ] **Tipo de Dobradiças**
  - [ ] Dropdown: Metálica, Macio, etc
  - [ ] Com ícones ou descrições

- [ ] **Tipo de Corredias**
  - [ ] Dropdown: Com rolamentos, Pesada, Suave, etc

- [ ] **Espessura do MDF**
  - [ ] Radio button: 15mm, 18mm, 25mm
  - [ ] Mostrar diferença de preço para cada uma

- [ ] **Observações Técnicas**
  - [ ] Textarea livre
  - [ ] Espaço para anotações adicionais

- [ ] **Botão Ações**
  - [ ] "Salvar e Criar Orçamento" (salva visita e vai para módulo 5)
  - [ ] "Salvar Rascunho" (salva e volta à lista)

### 4.3 Histórico de Visitas (Feature M3F3)

- [ ] **Tela de Histórico por Cliente**
  - [ ] Lista de todas as visitas
  - [ ] Colunas: Data, Status, Responsável
  - [ ] Clicar para ver detalhes:
    - [ ] Fotos tiradas
    - [ ] Medidas coletadas
    - [ ] Opções escolhidas (cor, puxador, etc)
    - [ ] Observações

- [ ] **Editar Informações**
  - [ ] Permitir editar dados coletados
  - [ ] Útil se houver mudanças

### 4.4 Testes do Módulo 3

- [ ] **Testes Locais (Mobile)**
  - [ ] Agendar visita - ✅ Salva com data/hora
  - [ ] Preencher formulário - ✅ Todos os campos funcionam
  - [ ] Upload de fotos - ✅ Salva no Supabase Storage
  - [ ] Validação - ✅ Rejeita dados inválidos
  - [ ] Histórico - ✅ Mostra todas as visitas do cliente

- [ ] **Deployment para Homologação**
  - [ ] Branch `feature/modulo-3-visitas-tecnicas`
  - [ ] PR para `develop`
  - [ ] Teste completo mobile
  - [ ] Merge em `develop`

---

## 💰 FASE 5: MÓDULO 4 - CATÁLOGO E PRECIFICAÇÃO (Semana 5-6)

### 5.1 Cadastro de Materiais (Feature M4F1)

- [ ] **Tela de Gestão de Materiais**
  - [ ] Tabela com: Nome, Categoria, Unidade, Preço de Custo, Fornecedor, Última Atualização
  - [ ] Busca por nome
  - [ ] Filtro por categoria

- [ ] **Criar/Editar Material**
  - [ ] Campos:
    - [ ] Nome (ex: Chapa MDF 15mm Branco)
    - [ ] Categoria (select: Chapas, Ferragens, Acabamentos, LED, Mão de obra)
    - [ ] Unidade (select: m, unidade, ml, kg)
    - [ ] Preço de custo (decimal)
    - [ ] Fornecedor (texto)
  - [ ] Validação
  - [ ] Auto-preenchimento de data de atualização

- [ ] **Backend - CRUD de Materiais**
  - [ ] GET `/api/materials` - Listar materiais do usuário
  - [ ] POST `/api/materials` - Criar material
  - [ ] PUT `/api/materials/{id}` - Editar material
  - [ ] DELETE `/api/materials/{id}` - Deletar material

- [ ] **Importação em Lote via Excel**
  - [ ] Tela de upload de arquivo Excel
  - [ ] Parser de colunas: Nome, Categoria, Unidade, Preço
  - [ ] Validação em lote
  - [ ] Mensagem de sucesso/erro
  - [ ] Implementar com `papaparse` ou `xlsx`

### 5.2 Configuração de Custos Fixos (Feature M4F2)

- [ ] **Tabela: fixed_costs**
  - [ ] Campos já definidos na FASE 1

- [ ] **Tela de Configuração**
  - [ ] Seção: Custos Fixos Mensais
    - [ ] Aluguel (decimal)
    - [ ] Energia (decimal)
    - [ ] Internet (decimal)
    - [ ] Total mensal (calculado automaticamente)

  - [ ] Seção: Percentuais
    - [ ] Margem de lucro padrão (%) - ex: 30%
    - [ ] Impostos/Taxas (%) - ex: 15%

  - [ ] Seção: Mão de Obra
    - [ ] Custo por hora (decimal)

  - [ ] Fórmula Padrão Exibida:
    ```
    Valor Final = (Materiais + Fixos Proporcionais + Mão de Obra) × (1 + Lucro%) × (1 + Impostos%)
    ```

- [ ] **Backend - Salvar Configurações**
  - [ ] PUT `/api/costs-config` - Salvar configurações
  - [ ] GET `/api/costs-config` - Recuperar configurações do usuário

### 5.3 Gestão de Preços (Feature M4F3)

- [ ] **Histórico de Alterações de Preço**
  - [ ] Tabela: `price_history` (id, material_id, old_price, new_price, changed_at)
  - [ ] Visualizar histórico na tela de material

- [ ] **Alerta de Preço Defasado**
  - [ ] Se material não foi atualizado há 30 dias → Mostrar alerta
  - [ ] Badge "Preço defasado" na listagem
  - [ ] Sugestão para atualizar

### 5.4 Testes do Módulo 4

- [ ] **Testes Locais**
  - [ ] Criar material - ✅ Salva corretamente
  - [ ] Importar Excel - ✅ Carrega múltiplos materiais
  - [ ] Editar custo - ✅ Atualiza e registra no histórico
  - [ ] Configurar custos fixos - ✅ Salva valores
  - [ ] Fórmula de cálculo - ✅ Funciona corretamente

- [ ] **Deployment para Homologação**
  - [ ] Branch `feature/modulo-4-catalogo-precificacao`
  - [ ] PR para `develop`
  - [ ] Teste completo
  - [ ] Merge em `develop`

---

## 📊 FASE 6: MÓDULO 5 - GERAÇÃO DE ORÇAMENTOS (Semana 6-7)

### 6.1 Construtor de Orçamento (Feature M5F1)

- [ ] **Fluxo de Criação**
  - [ ] 1. Selecionar cliente (select ou busca)
  - [ ] 2. Escolher tipo: Projeto Padrão OU Personalizado
  - [ ] 3. Se Padrão → Carrega materiais automáticos
  - [ ] 4. Se Personalizado → Busca dados da visita técnica
  - [ ] 5. Revisar/Adicionar itens
  - [ ] 6. Sistema calcula automaticamente

- [ ] **Tela de Construção**
  - [ ] Informações do cliente (exibição)
  - [ ] Tabela de itens:
    - [ ] Colunas: Item, Qtd, Unidade, Valor Unit, Subtotal
    - [ ] Botão "Adicionar Item" (abre modal)
    - [ ] Botão remover item (X em cada linha)
    - [ ] Input para editar quantidade (atualiza subtotal em tempo real)

- [ ] **Modal de Adicionar Item**
  - [ ] Busca por nome do material
  - [ ] Select com materials do catálogo
  - [ ] Campo quantidade
  - [ ] Mostra preço unitário
  - [ ] Botão: Adicionar, Cancelar

- [ ] **Cálculos Automáticos**
  - [ ] Subtotal por item = Quantidade × Preço Unitário
  - [ ] Subtotal Materiais = SUM(subtotais)
  - [ ] Custos Fixos Proporcionais = (Custos Fixos Mensais ÷ 20 dias) × (Dias do projeto)
  - [ ] Mão de Obra = Horas Estimadas × Custo/hora
  - [ ] Subtotal = Materiais + Fixos + Mão de Obra
  - [ ] Aplicar Margem de Lucro = Subtotal × (1 + Margem%)
  - [ ] Aplicar Impostos = Total × (1 + Impostos%)
  - [ ] **TOTAL FINAL = Valor com tudo incluído**

- [ ] **Exibição de Cálculos**
  - [ ] Breakdown visual mostrando cada componente
  - [ ] Exemplo:
    ```
    Subtotal Materiais:  R$ 1.500,00
    Custos Fixos:        R$   150,00
    Mão de Obra:         R$   800,00
    ─────────────────────────────────
    Subtotal:            R$ 2.450,00
    Margem (30%):        R$   735,00
    Impostos (15%):      R$   432,75
    ─────────────────────────────────
    TOTAL:               R$ 3.617,75
    ```

### 6.2 Ajustes Manuais (Feature M5F2)

- [ ] **Permitir Descontos**
  - [ ] Campo: Desconto em R$ ou %
  - [ ] Recalcula total automaticamente
  - [ ] Mostra valor economizado

- [ ] **Adicionar Itens Extras**
  - [ ] Itens não catalogados
  - [ ] Descrição livre + Valor manual
  - [ ] Adicionado à tabela como item extra

- [ ] **Ajustar Margem Específica**
  - [ ] Override da margem padrão apenas para este orçamento
  - [ ] Campo: Nova margem (%)

- [ ] **Condições de Pagamento**
  - [ ] Textarea: Descricao de parcelamento ou à vista
  - [ ] Exemplo: "50% no início, 50% na conclusão"

- [ ] **Prazo de Validade**
  - [ ] Padrão: 15 dias
  - [ ] Permite editar
  - [ ] Mostra data de expiração

### 6.3 Geração de PDF Profissional (Feature M5F3)

- [ ] **Estrutura do PDF**
  - [ ] **Header:**
    - [ ] Logo da empresa
    - [ ] Nome da empresa
    - [ ] Telefone, WhatsApp, Instagram
  
  - [ ] **Informações:**
    - [ ] "Orçamento #" + número auto-incremento
    - [ ] Data de emissão
  
  - [ ] **Dados do Cliente:**
    - [ ] Nome, Telefone, Email, Endereço
  
  - [ ] **Tabela de Itens:**
    - [ ] Colunas: Item | Qtd | Unidade | Valor Unit | Subtotal
    - [ ] Uma linha por item
  
  - [ ] **Resumo Financeiro:**
    - [ ] Subtotal
    - [ ] Descontos (se houver)
    - [ ] TOTAL destacado e em negrito
  
  - [ ] **Rodapé:**
    - [ ] Condições de pagamento
    - [ ] Prazo de validade
    - [ ] Observações (se houver)
    - [ ] Telefone, WhatsApp, Instagram

- [ ] **Biblioteca: jsPDF**
  - [ ] Gerar PDF com `jsPDF` ou `react-pdf`
  - [ ] Template personalizável com cores da marca
  - [ ] Nomear arquivo: `orcamento_numero_data.pdf`

- [ ] **Botão no Construtor**
  - [ ] "Gerar PDF" ou "Visualizar PDF"
  - [ ] Download automático

### 6.4 Envio via WhatsApp (Feature M5F4)

- [ ] **Integração WhatsApp**
  - [ ] Botão: "Enviar por WhatsApp"
  - [ ] Gera PDF
  - [ ] Abre WhatsApp Web com PDF anexado
  - [ ] Mensagem pré-formatada customizável
  - [ ] Exemplo de mensagem:
    ```
    Olá [Nome Cliente]!
    
    Segue em anexo seu orçamento de projetos de marcenaria.
    
    Orçamento #12345
    Data: 17/12/2025
    Validade: 01/01/2026
    
    Total: R$ 3.617,75
    
    Qualquer dúvida, fico à disposição!
    Abraços 🙌
    ```

- [ ] **Rastreamento de Envio**
  - [ ] Campo no banco: `sent_at` (data/hora do envio)
  - [ ] Campo no banco: `status` → "Enviado"
  - [ ] Possibilitar manual: marcar como "Visualizado", "Aprovado", "Recusado"

- [ ] **Armazenar Histórico**
  - [ ] Registrar cada envio
  - [ ] Permitir reenviar PDF
  - [ ] Mostrar histórico de comunicação

### 6.5 Testes do Módulo 5

- [ ] **Testes Locais**
  - [ ] Criar orçamento com projeto padrão - ✅ Carrega materiais
  - [ ] Adicionar itens - ✅ Cálculos automáticos funcionam
  - [ ] Aplicar desconto - ✅ Valor atualizado
  - [ ] Gerar PDF - ✅ Download bem-formatado
  - [ ] Enviar WhatsApp - ✅ Abre com mensagem e PDF
  - [ ] Validação - ✅ Rejeita orçamentos sem items

- [ ] **PDF Visual**
  - [ ] Verifique formatação no PDF
  - [ ] Cores, logo, alinhamento
  - [ ] Valores bem visíveis

- [ ] **Deployment para Homologação**
  - [ ] Branch `feature/modulo-5-orcamentos`
  - [ ] PR para `develop`
  - [ ] Teste completo com envio real
  - [ ] Merge em `develop`

---

## 📝 FASE 7: MÓDULO 6 - OS E CONTRATO (Semana 7-8)

### 7.1 Geração de Ordem de Serviço (Feature M6F1)

- [ ] **Trigger Automático**
  - [ ] Quando orçamento é marcado como "Aprovado"
  - [ ] Sistema cria automaticamente a OS

- [ ] **Tela de Visualização de OS**
  - [ ] Número da OS (auto-incremento)
  - [ ] Referência ao orçamento
  - [ ] Dados do cliente
  - [ ] Lista completa de itens/serviços
  - [ ] Data prevista de início
  - [ ] Data prevista de conclusão
  - [ ] Responsável pela execução (select com usuários)
  - [ ] Observações técnicas (textarea)
  - [ ] Status (select: Aguardando material, Em produção, Pronto, Instalado)

- [ ] **Backend - OS CRUD**
  - [ ] POST `/api/service-orders` - Criar OS (disparado por aprovação)
  - [ ] GET `/api/service-orders/{id}` - Detalhes da OS
  - [ ] PUT `/api/service-orders/{id}` - Atualizar status/dados
  - [ ] GET `/api/service-orders?status=X` - Filtrar por status

- [ ] **Edição de OS**
  - [ ] Permitir editar datas, responsável, observações
  - [ ] Não permitir editar itens (vem do orçamento)

### 7.2 Contrato de Prestação de Serviço (Feature M6F2)

- [ ] **Template de Contrato**
  - [ ] Criar template editável com cláusulas padrão
  - [ ] Armazenar em string ou arquivo

- [ ] **Tela de Geração**
  - [ ] Auto-preenche:
    - [ ] Nome do cliente
    - [ ] Valor total (do orçamento)
    - [ ] Prazos de início/conclusão
  - [ ] Campos editáveis:
    - [ ] Condições de pagamento detalhadas
    - [ ] Garantias oferecidas (ex: 1 ano de garantia)
    - [ ] Cláusula de cancelamento
    - [ ] Observações especiais

- [ ] **Geração de PDF**
  - [ ] Botão: "Gerar PDF para Assinatura"
  - [ ] Nomear: `contrato_cliente_data.pdf`
  - [ ] Espaço para assinatura (X linha tracejada)

- [ ] **Upload de Contrato Assinado**
  - [ ] Depois cliente/empresa assina fisicamente ou digitalmente
  - [ ] Fazer upload no Supabase Storage
  - [ ] Armazenar URL em `contracts.signed_pdf_url`
  - [ ] Registrar data de assinatura

- [ ] **Backend**
  - [ ] POST `/api/contracts` - Criar contrato
  - [ ] GET `/api/contracts/{id}` - Recuperar contrato
  - [ ] PUT `/api/contracts/{id}` - Upload PDF assinado

### 7.3 Acompanhamento de Status (Feature M6F3)

- [ ] **Timeline Visual da OS**
  - [ ] Mostrar etapas:
    - [ ] Aguardando material (data de início)
    - [ ] Em produção
    - [ ] Pronto
    - [ ] Instalado (data de conclusão)
  - [ ] Botões para mudar status
  - [ ] Histórico de mudanças

- [ ] **Galeria de Fotos**
  - [ ] Adicionar fotos do progresso em cada status
  - [ ] Upload direto do celular
  - [ ] Salvar em Supabase Storage
  - [ ] Mostrar galeria na timeline

- [ ] **Notificações ao Cliente**
  - [ ] Quando status muda → Enviar mensagem WhatsApp
  - [ ] Exemplo: "Seu projeto saiu da produção! Em breve estará pronto para instalação"

### 7.4 Testes do Módulo 6

- [ ] **Testes Locais**
  - [ ] Aprovar orçamento - ✅ Cria OS automaticamente
  - [ ] Editar OS - ✅ Atualiza dados
  - [ ] Gerar contrato - ✅ PDF gerado
  - [ ] Upload contrato assinado - ✅ Salva no Supabase
  - [ ] Mudar status - ✅ Timeline atualiza
  - [ ] Upload foto - ✅ Galeria exibe

- [ ] **Deployment para Homologação**
  - [ ] Branch `feature/modulo-6-os-contrato`
  - [ ] PR para `develop`
  - [ ] Teste completo de fluxo
  - [ ] Merge em `develop`

---

## 📊 FASE 8: MÓDULO 7 - DASHBOARD E RELATÓRIOS (Semana 8)

### 8.1 Dashboard Principal (Feature M7F1)

- [ ] **Cards KPI**
  - [ ] **Orçamentos Pendentes:** Quantidade e valor total
  - [ ] **Taxa de Conversão:** % de aprovados vs total (últimos 30 dias)
  - [ ] **Faturamento do Mês:** Total de orçamentos aprovados no mês
  - [ ] **Projetos em Andamento:** Quantidade de OS com status "Em produção"

- [ ] **Seção: Visitas Técnicas Agendadas**
  - [ ] Lista das próximas 5 visitas
  - [ ] Colunas: Cliente, Data, Endereço, Responsável
  - [ ] Botão: "Ver todos"

- [ ] **Alertas**
  - [ ] **Orçamentos próximos de vencer:** Mostrar em destaque (válidos por menos de 3 dias)
  - [ ] **Visitas hoje:** Badge com número de visitas agendadas
  - [ ] **Tarefas vencidas:** Se houver OS atrasadas

- [ ] **Gráficos (Opcional para MVP, implementar se houver tempo)**
  - [ ] Faturamento por mês (últimos 6 meses)
  - [ ] Taxa de aprovação por mês
  - [ ] Projetos por categoria

### 8.2 Relatórios Básicos (Feature M7F2)

- [ ] **Tela de Relatórios**
  - [ ] Seção: Filtros
    - [ ] Período: Data início, Data fim (date picker)
    - [ ] Tipo de relatório (select)
    - [ ] Botão: "Gerar Relatório"

- [ ] **Relatório 1: Orçamentos por Período**
  - [ ] Tabela: Número, Cliente, Data, Valor, Status
  - [ ] Total de orçamentos
  - [ ] Valor total em R$
  - [ ] Taxa de aprovação

- [ ] **Relatório 2: Taxa de Aprovação Mensal**
  - [ ] Tabela: Mês, Total, Aprovados, Recusados, Taxa %
  - [ ] Gráfico (opcional): Barras mostrando tendência

- [ ] **Relatório 3: Tempo Médio entre Orçamento e Aprovação**
  - [ ] Tabela: Projeto, Data Orçamento, Data Aprovação, Dias
  - [ ] Média de dias
  - [ ] Mín e Máx

- [ ] **Relatório 4: Projetos Concluídos no Mês**
  - [ ] Tabela: Número OS, Cliente, Categoria, Data Conclusão
  - [ ] Total de projetos
  - [ ] Valor total faturado

- [ ] **Exportação**
  - [ ] Botão: "Exportar Excel"
  - [ ] Botão: "Exportar PDF"
  - [ ] Usar: `xlsx` para Excel, `jsPDF` para PDF

### 8.3 Backend - Queries de Relatório

- [ ] **GET `/api/reports/quotes-by-period?start=X&end=Y`**
  - [ ] Retorna orçamentos no período

- [ ] **GET `/api/reports/approval-rate?month=X&year=Y`**
  - [ ] Retorna taxa de aprovação

- [ ] **GET `/api/reports/average-time`**
  - [ ] Retorna tempo médio entre orçamento e aprovação

- [ ] **GET `/api/reports/completed-projects?month=X&year=Y`**
  - [ ] Retorna projetos concluídos

### 8.4 Testes do Módulo 7

- [ ] **Testes Locais**
  - [ ] Dashboard carrega - ✅ KPIs corretos
  - [ ] Alertas aparecem - ✅ Para orçamentos vencidos
  - [ ] Relatório de orçamentos - ✅ Dados corretos
  - [ ] Exportar Excel - ✅ Arquivo baixado
  - [ ] Filtros funcionam - ✅ Período customizado

- [ ] **Deployment para Homologação**
  - [ ] Branch `feature/modulo-7-dashboard-relatorios`
  - [ ] PR para `develop`
  - [ ] Teste completo
  - [ ] Merge em `develop`

---

## 🚀 FASE 9: TESTES FINAIS E DEPLOYMENT EM PRODUÇÃO (Semana 8-Final)

### 9.1 Testes de Integração Completos

- [ ] **Fluxo Completo End-to-End**
  - [ ] ✅ Criar usuário → Login
  - [ ] ✅ Cadastrar cliente → Agendar visita → Preencher formulário
  - [ ] ✅ Projeto padrão → Criar orçamento → Enviar via WhatsApp
  - [ ] ✅ Receber aprovação → Gerar OS → Gerar Contrato
  - [ ] ✅ Atualizar status → Visualizar no Dashboard

- [ ] **Testes de Performance**
  - [ ] Listagem com 1000+ registros - Tempo < 2s
  - [ ] Upload de foto - Tempo < 3s
  - [ ] Geração de PDF - Tempo < 2s
  - [ ] Dashboard - Tempo < 1s

- [ ] **Testes de Segurança**
  - [ ] RLS funcionando - Usuário A não vê dados de B ✅
  - [ ] Autenticação exigida para todas as rotas ✅
  - [ ] Validação no backend (não apenas frontend) ✅
  - [ ] Nenhuma informação sensível no localStorage ✅

### 9.2 Configuração de Docker e Docker Compose

- [ ] **Backend Dockerfile**
  - [ ] Multi-stage build (builder → runtime)
  - [ ] Base: `python:3.11-slim`
  - [ ] Instala dependências do sistema (gcc, postgresql-client)
  - [ ] Copia requirements.txt e instala dependências Python
  - [ ] Copia código
  - [ ] Define variáveis de ambiente (PYTHONUNBUFFERED=1)
  - [ ] EXPOSE 8000
  - [ ] CMD: Gunicorn (se Django) ou Uvicorn (se FastAPI)
  
  ```dockerfile
  # Backend/Dockerfile - Exemplo Django + Gunicorn
  FROM python:3.11-slim as builder
  WORKDIR /app
  RUN apt-get update && apt-get install -y --no-install-recommends gcc postgresql-client
  COPY backend/requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt
  
  FROM python:3.11-slim
  WORKDIR /app
  COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
  COPY backend .
  ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PORT=8000
  EXPOSE 8000
  CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
  ```

- [ ] **Frontend Dockerfile**
  - [ ] Multi-stage build (builder → nginx)
  - [ ] Build: `node:22-alpine` + pnpm
  - [ ] Runtime: `nginx:alpine`
  - [ ] Copia build para `/usr/share/nginx/html`
  - [ ] Copia nginx.conf customizado
  - [ ] EXPOSE 80
  - [ ] CMD: nginx
  
  ```dockerfile
  # Frontend/Dockerfile - React Vite
  FROM node:22-alpine as builder
  WORKDIR /app
  COPY frontend/package.json frontend/pnpm-lock.yaml .
  RUN npm install -g pnpm && pnpm install --frozen-lockfile
  COPY frontend .
  RUN pnpm run build
  
  FROM nginx:alpine
  COPY --from=builder /app/dist /usr/share/nginx/html
  COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  ```

- [ ] **Frontend nginx.conf**
  ```nginx
  server {
    listen 80;
    location / {
      root /usr/share/nginx/html;
      try_files $uri $uri/ /index.html;
    }
  }
  ```

### 9.3 Docker Compose - Orquestração

- [ ] **docker-compose.yml**
  ```yaml
  version: '3.8'
  
  services:
    backend:
      build:
        context: .
        dockerfile: backend/Dockerfile
      container_name: app-backend
      ports:
        - "8000:8000"
      environment:
        - NODE_ENV=production
        - DEBUG=False
        - DATABASE_URL=postgresql://user:password@db:5432/marcenaria
        - ALLOWED_HOSTS=localhost,yourdomain.com
      restart: unless-stopped
      depends_on:
        - db
      volumes:
        - ./backend/logs:/app/logs
  
    frontend:
      build:
        context: .
        dockerfile: frontend/Dockerfile
      container_name: app-frontend
      ports:
        - "80:80"
      environment:
        - REACT_APP_API_URL=https://yourdomain.com:8000
      restart: unless-stopped
      depends_on:
        - backend
  
    db:
      image: postgres:16-alpine
      container_name: app-db
      environment:
        - POSTGRES_DB=marcenaria
        - POSTGRES_USER=user
        - POSTGRES_PASSWORD=securepassword
      volumes:
        - postgres_data:/var/lib/postgresql/data
      restart: unless-stopped
  
  volumes:
    postgres_data:
  ```

- [ ] **Testes Locais com Docker Compose**
  - [ ] `docker-compose build` - Constrói imagens ✅
  - [ ] `docker-compose up -d` - Inicia serviços ✅
  - [ ] `docker ps` - Verifica containers rodando ✅
  - [ ] `curl http://localhost:8000` - Backend responde ✅
  - [ ] `curl http://localhost:80` - Frontend responde ✅
  - [ ] `docker-compose logs -f` - Monitora logs ✅
  - [ ] `docker-compose down` - Para serviços ✅

### 9.4 GitHub Actions - CI/CD Pipeline

- [ ] **.github/workflows/deploy.yml**
  ```yaml
  name: Deploy to Hostinger
  
  on:
    push:
      branches:
        - main
  
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - name: Checkout repository
          uses: actions/checkout@v4
  
        - name: Deploy to VPS
          uses: appleboy/ssh-action@master
          with:
            host: ${{ secrets.HOSTINGER_HOST }}
            username: ${{ secrets.HOSTINGER_USER }}
            key: ${{ secrets.HOSTINGER_SSHKEY }}
            port: ${{ secrets.HOSTINGER_PORT }}
            script: |
              cd /var/www/marcenaria
              git pull origin main
              docker-compose build
              docker-compose up -d
              docker-compose logs -f backend
  ```

- [ ] **Fluxo de Deploy Automático**
  1. Dev faz push/merge para branch `main`
  2. GitHub Actions dispara automaticamente
  3. Conecta via SSH à VPS
  4. Faz `git pull` do repositório
  5. Executa `docker-compose build` (cria imagens)
  6. Executa `docker-compose up -d` (inicia serviços)
  7. Verifica logs

### 9.5 Verificações e Debugging

- [ ] **Na VPS/Hostinger**
  - [ ] Acesso SSH funcionando:
    ```bash
    ssh -i chave_privada user@host
    ```
  - [ ] Docker instalado:
    ```bash
    docker --version
    ```
  - [ ] Pasta do projeto existe e possui git:
    ```bash
    cd /var/www/marcenaria && git status
    ```
  - [ ] SSH key configurada no GitHub Deploy Keys

- [ ] **Monitoramento de Deploy**
  - [ ] Verificar logs do GitHub Actions:
    - [ ] Acesse: Settings → Actions → Workflows → Deploy to Hostinger
    - [ ] Procure por erros
    - [ ] Copie mensagens de erro para debugging

  - [ ] Na VPS, verificar containers:
    ```bash
    docker ps               # Lista containers rodando
    docker ps -a            # Todos os containers (inclusive parados)
    docker logs app-backend  # Logs do backend
    docker logs app-frontend # Logs do frontend
    docker exec app-backend ps aux  # Processos dentro do container
    ```

  - [ ] Testar conectividade entre serviços:
    ```bash
    docker exec app-backend ping app-frontend
    docker exec app-frontend ping app-backend
    ```

- [ ] **Troubleshooting Comum**
  - [ ] **Container não inicia:**
    - [ ] Verificar logs: `docker logs nome-container`
    - [ ] Validar Dockerfile
    - [ ] Testar build localmente

  - [ ] **Backend não conecta ao banco:**
    - [ ] Verificar variável `DATABASE_URL`
    - [ ] Testar: `docker exec app-backend psql -h db -U user marcenaria`

  - [ ] **Frontend retorna 502:**
    - [ ] Verificar se backend está rodando
    - [ ] Verificar nginx.conf
    - [ ] Testar: `docker exec app-frontend curl -s http://localhost`

  - [ ] **Deploy não dispara:**
    - [ ] Verificar if secrets estão corretos no GitHub
    - [ ] Testar SSH manualmente
    - [ ] Validar workflow YAML (indentação crítica)

### 9.6 Migrations Django (se aplicável)

- [ ] **Antes do Deploy**
  - [ ] Adicionar comando de migrations no docker-compose ou init script
  - [ ] Opção 1: Criar entrypoint.sh que roda migrations antes de iniciar gunicorn
  - [ ] Opção 2: Executar manualmente via SSH: `docker exec app-backend python manage.py migrate`

- [ ] **Entrypoint Script (exemplo)**
  ```bash
  #!/bin/bash
  python manage.py migrate
  python manage.py collectstatic --noinput
  gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
  ```

### 9.7 Proxy Reverso (Nginx na VPS)

- [ ] **Configuração Nginx na VPS**
  - [ ] Instalar Nginx: `apt-get install nginx`
  - [ ] Criar arquivo de configuração:
    ```nginx
    server {
      listen 443 ssl;
      server_name yourdomain.com;
      
      ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
      
      location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
      }
      
      location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
      }
    }
    
    server {
      listen 80;
      server_name yourdomain.com;
      return 301 https://$server_name$request_uri;
    }
    ```

  - [ ] Habilitar: `sudo systemctl enable nginx && sudo systemctl start nginx`

- [ ] **SSL com Let's Encrypt**
  - [ ] Instalar: `apt-get install certbot python3-certbot-nginx`
  - [ ] Gerar certificado: `certbot certonly --nginx -d yourdomain.com`
  - [ ] Auto-renew: certbot configura automaticamente

### 9.8 Checklist Final de Deployment

- [ ] **Antes de Fazer Deploy em Produção**
  - [ ] ✅ Todos os testes passando em develop
  - [ ] ✅ Código review feito
  - [ ] ✅ Secrets adicionados no GitHub
  - [ ] ✅ SSH funcionando da VPS
  - [ ] ✅ Docker e Docker Compose instalados na VPS
  - [ ] ✅ Variáveis de ambiente documentadas (.env.example)
  - [ ] ✅ Migrations Django criadas e testadas localmente
  - [ ] ✅ Dockerfile backend testado localmente
  - [ ] ✅ Dockerfile frontend testado localmente
  - [ ] ✅ docker-compose.yml validado (sem erros de indentação)
  - [ ] ✅ GitHub Actions workflow yaml validado
  - [ ] ✅ Nginx proxy reverso configurado na VPS
  - [ ] ✅ SSL/HTTPS funcionando
  - [ ] ✅ Backup do banco de dados antes de primeiro deploy

- [ ] **Primeira Execução do Deploy**
  - [ ] Fazer merge `develop` → `main`
  - [ ] GitHub Actions dispara automaticamente
  - [ ] Monitorar workflow na aba Actions
  - [ ] Na VPS: `docker ps` para verificar containers
  - [ ] Testar: `https://yourdomain.com` no navegador
  - [ ] Documentar qualquer erro encontrado
  - [ ] Correção de erros em branch → novo push → redeploy automático

- [ ] **Após Deploy Bem-Sucedido**
  - [ ] ✅ Fazer backup do banco de dados
  - [ ] ✅ Documentar informações críticas:
    - [ ] URL de produção
    - [ ] Credenciais (em arquivo seguro)
    - [ ] Processo de rollback se necessário
  - [ ] ✅ Configurar monitoramento (alertas de erro, uptime)
  - [ ] ✅ Planejar manutenção e updates

---

## 📋 RESUMO POR SEMANA

| Semana | Tarefas | Objetivo |
|--------|---------|----------|
| **0-1** | Setup, Infraestrutura, DB Schema, Auth | Preparação completa |
| **1-2** | DB, Migrations, Autenticação Frontend | Usuários logam |
| **2-3** | Módulo 1: Gestão de Clientes | CRUD de clientes |
| **3-4** | Módulo 2: Projetos Padrão | Sugestões de projetos |
| **4-5** | Módulo 3: Visitas Técnicas | Agendamento + Formulário |
| **5-6** | Módulo 4: Catálogo e Precificação | Gestão de materiais + custos |
| **6-7** | Módulo 5: Geração de Orçamentos | Construtor + PDF + WhatsApp |
| **7-8** | Módulo 6: OS e Contrato | Fluxo completo até contrato |
| **8** | Módulo 7: Dashboard + Deploy | Relatórios + Produção |

---

## 🎯 Prioridades de Desenvolvimento

**CRÍTICO (NÃO PULAR):**
- ✅ Autenticação e RLS
- ✅ CRUD de Clientes
- ✅ Formulário de Visita (coleta de dados mobile-first)
- ✅ Construtor de Orçamento com cálculos automáticos
- ✅ Geração de PDF + Envio WhatsApp
- ✅ Docker + GitHub Actions

**IMPORTANTE (FAZER NA SEQUÊNCIA):**
- ✅ Projetos Padrão
- ✅ Agendamento de Visitas
- ✅ OS e Contrato
- ✅ Dashboard

**OPCIONAL (DEPOIS DE MVP ESTÁVEL):**
- ⭕ Gráficos avançados
- ⭕ Notificações em tempo real
- ⭕ Integração com WhatsApp Bot (não apenas Web)
- ⭕ Sistema de relatórios avançados
- ⭕ App mobile nativo

---

## 📚 Documentação a Ser Mantida

Manter sempre atualizado em repositório:

- [ ] **README.md** - Como clonar, instalar, rodar localmente
- [ ] **.env.example** - Template de variáveis de ambiente
- [ ] **DEPLOYMENT.md** - Passo a passo para deploy em produção
- [ ] **ARCHITECTURE.md** - Arquitetura geral do sistema
- [ ] **DATABASE.md** - Esquema do banco com relacionamentos
- [ ] **API.md** - Documentação de endpoints (se usar FastAPI, swagger automático)
- [ ] **TROUBLESHOOTING.md** - Problemas comuns e soluções

---

## ✅ FIM DO CHECKLIST

**Próximos Passos:**
1. Você vai desenvolver ou contratar um dev?
2. Tem experiência com React/JavaScript?
3. Orçamento para desenvolvimento?
4. Criar conta Supabase gratuita (começa aqui!)

**Boa sorte no desenvolvimento! 🚀**
