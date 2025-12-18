-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- PROFILES (Extends Supabase Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    company_name TEXT,
    phone TEXT,
    address TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- CUSTOMERS (Clientes)
CREATE TABLE public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    document TEXT,
    -- CPF/CNPJ
    address TEXT,
    origin TEXT DEFAULT 'WhatsApp',
    -- WhatsApp, indicação, Instagram, etc
    status TEXT DEFAULT 'Lead' CHECK (
        status IN ('Lead', 'Em negociação', 'Cliente ativo')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- STANDARD PROJECTS (Projetos Padrão)
CREATE TABLE public.standard_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    name TEXT NOT NULL,
    category TEXT CHECK (
        category IN ('cozinha', 'quarto', 'closet', 'banheiro')
    ),
    description TEXT,
    base_price DECIMAL(10, 2),
    execution_time TEXT,
    -- ex: 15 dias
    images JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- TECHNICAL VISITS (Visitas Técnicas)
CREATE TABLE public.technical_visits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'Agendada' CHECK (status IN ('Agendada', 'Realizada', 'Cancelada')),
    measurements JSONB DEFAULT '{}',
    -- {altura, largura, profundidade}
    photos JSONB DEFAULT '[]',
    color TEXT,
    hardware_type TEXT,
    led BOOLEAN DEFAULT false,
    led_color TEXT,
    hinges_type TEXT,
    slides_type TEXT,
    mdf_thickness TEXT,
    -- 15mm, 18mm, 25mm
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- MATERIALS (Materiais/Catálogo)
CREATE TABLE public.materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    name TEXT NOT NULL,
    category TEXT CHECK (
        category IN (
            'chapas',
            'ferragens',
            'acabamentos',
            'LED',
            'mão de obra'
        )
    ),
    unit TEXT,
    -- m, unidade, ml, kg
    cost_price DECIMAL(10, 2),
    supplier TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- FIXED COSTS (Custos Fixos)
CREATE TABLE public.fixed_costs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    monthly_rent DECIMAL(10, 2) DEFAULT 0,
    monthly_energy DECIMAL(10, 2) DEFAULT 0,
    monthly_internet DECIMAL(10, 2) DEFAULT 0,
    profit_margin_percent DECIMAL(5, 2) DEFAULT 30,
    taxes_percent DECIMAL(5, 2) DEFAULT 15,
    labor_cost_per_hour DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- PROJECTS (Projetos em andamento)
CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft' CHECK (
        status IN (
            'draft',
            'proposal',
            'approved',
            'in_progress',
            'completed',
            'cancelled'
        )
    ),
    budget_estimated DECIMAL(10, 2),
    start_date DATE,
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- QUOTES (Orçamentos)
CREATE TABLE public.quotes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    quote_number SERIAL,
    status TEXT DEFAULT 'Rascunho' CHECK (
        status IN (
            'Rascunho',
            'Enviado',
            'Visualizado',
            'Aprovado',
            'Recusado'
        )
    ),
    total DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    discount_type TEXT DEFAULT 'R$' CHECK (discount_type IN ('R$', '%')),
    valid_until TIMESTAMP WITH TIME ZONE,
    payment_conditions TEXT,
    notes TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- QUOTE ITEMS (Itens do Orçamento)
CREATE TABLE public.quote_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
    material_id UUID REFERENCES public.materials(id),
    description TEXT,
    -- Para itens manuais ou descrição do material
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);
-- SERVICE ORDERS (Ordens de Serviço)
CREATE TABLE public.service_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    quote_id UUID REFERENCES public.quotes(id) NOT NULL,
    os_number SERIAL,
    status TEXT DEFAULT 'Aguardando material' CHECK (
        status IN (
            'Aguardando material',
            'Em produção',
            'Pronto',
            'Instalado'
        )
    ),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    responsible TEXT,
    technical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- CONTRACTS (Contratos)
CREATE TABLE public.contracts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    quote_id UUID REFERENCES public.quotes(id) NOT NULL,
    contract_pdf_url TEXT,
    signed_pdf_url TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standard_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
-- Policies for Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR
UPDATE USING (auth.uid() = id);
-- Policies for Customers
CREATE POLICY "Users can view own customers" ON public.customers FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own customers" ON public.customers FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customers" ON public.customers FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own customers" ON public.customers FOR DELETE USING (auth.uid() = user_id);
-- Policies for Standard Projects
CREATE POLICY "Users can manage own standard projects" ON public.standard_projects FOR ALL USING (auth.uid() = user_id);
-- Policies for Technical Visits
CREATE POLICY "Users can manage own visits" ON public.technical_visits FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.customers
        WHERE id = technical_visits.customer_id
            AND user_id = auth.uid()
    )
);
-- Policies for Materials
CREATE POLICY "Users can manage own materials" ON public.materials FOR ALL USING (auth.uid() = user_id);
-- Policies for Fixed Costs
CREATE POLICY "Users can manage own fixed costs" ON public.fixed_costs FOR ALL USING (auth.uid() = user_id);
-- Policies for Projects (Existing)
CREATE POLICY "Users can view own projects" ON public.projects FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.customers
            WHERE id = projects.customer_id
                AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert own projects" ON public.projects FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.customers
            WHERE id = customer_id
                AND user_id = auth.uid()
        )
    );
-- Policies for Quotes
CREATE POLICY "Users can manage own quotes" ON public.quotes FOR ALL USING (auth.uid() = user_id);
-- Policies for Quote Items
CREATE POLICY "Users can manage own quote items" ON public.quote_items FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.quotes
        WHERE id = quote_items.quote_id
            AND user_id = auth.uid()
    )
);
-- Policies for Service Orders
CREATE POLICY "Users can manage own service orders" ON public.service_orders FOR ALL USING (auth.uid() = user_id);
-- Policies for Contracts
CREATE POLICY "Users can manage own contracts" ON public.contracts FOR ALL USING (auth.uid() = user_id);