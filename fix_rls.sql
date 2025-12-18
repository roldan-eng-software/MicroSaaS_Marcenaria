-- 1. Criar a tabela se ela não existir
CREATE TABLE IF NOT EXISTS public.standard_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    name TEXT NOT NULL,
    category TEXT CHECK (
        category IN (
            'cozinha',
            'quarto',
            'closet',
            'banheiro',
            'sala',
            'outro',
            'comercial'
        )
    ),
    description TEXT,
    base_price DECIMAL(10, 2),
    execution_time TEXT,
    images JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 2. Criar a tabela de Visitas Técnicas se ela não existir
CREATE TABLE IF NOT EXISTS public.technical_visits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'Agendada' CHECK (status IN ('Agendada', 'Realizada', 'Cancelada')),
    measurements JSONB DEFAULT '{}',
    photos JSONB DEFAULT '[]',
    color TEXT,
    hardware_type TEXT,
    led BOOLEAN DEFAULT false,
    led_color TEXT,
    hinges_type TEXT,
    slides_type TEXT,
    mdf_thickness TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 3. Criar Tabelas Financeiras (Materiais e Orçamentos)
CREATE TABLE IF NOT EXISTS public.materials (
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
    cost_price DECIMAL(10, 2),
    supplier TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TABLE IF NOT EXISTS public.quotes (
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
CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
    material_id UUID REFERENCES public.materials(id),
    description TEXT,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);
-- 4. Habilitar RLS
ALTER TABLE public.standard_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
-- 5. Corrigir Políticas das Tabelas
DROP POLICY IF EXISTS "Users can manage own standard projects" ON public.standard_projects;
CREATE POLICY "Users can manage own standard projects" ON public.standard_projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own visits" ON public.technical_visits;
CREATE POLICY "Users can manage own visits" ON public.technical_visits FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.customers
        WHERE id = technical_visits.customer_id
            AND user_id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.customers
        WHERE id = technical_visits.customer_id
            AND user_id = auth.uid()
    )
);
DROP POLICY IF EXISTS "Users can manage own materials" ON public.materials;
CREATE POLICY "Users can manage own materials" ON public.materials FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own quotes" ON public.quotes;
CREATE POLICY "Users can manage own quotes" ON public.quotes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own quote items" ON public.quote_items;
CREATE POLICY "Users can manage own quote items" ON public.quote_items FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.quotes
        WHERE id = quote_items.quote_id
            AND user_id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.quotes
        WHERE id = quote_items.quote_id
            AND user_id = auth.uid()
    )
);
-- 6. Garantir que o bucket 'photos' existe e é público
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true) ON CONFLICT (id) DO NOTHING;
-- 7. Políticas de Storage para o bucket 'photos'
-- Permitir que qualquer uno veja as fotos (público)
DROP POLICY IF EXISTS "Fotos públicas para visualização" ON storage.objects;
CREATE POLICY "Fotos públicas para visualização" ON storage.objects FOR
SELECT USING (bucket_id = 'photos');
-- Permitir que usuários autenticados façam upload
DROP POLICY IF EXISTS "Usuários autenticados podem subir fotos" ON storage.objects;
CREATE POLICY "Usuários autenticados podem subir fotos" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'photos'
        AND auth.role() = 'authenticated'
    );
-- Permitir que o dono da foto a delete ou atualize
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias fotos" ON storage.objects;
CREATE POLICY "Usuários podem gerenciar suas próprias fotos" ON storage.objects FOR ALL USING (
    bucket_id = 'photos'
    AND auth.uid() = owner
);