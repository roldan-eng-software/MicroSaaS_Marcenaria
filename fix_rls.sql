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
-- 3. Habilitar RLS
ALTER TABLE public.standard_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_visits ENABLE ROW LEVEL SECURITY;
-- 4. Corrigir Políticas das Tabelas
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
-- 5. Garantir que o bucket 'photos' existe e é público
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true) ON CONFLICT (id) DO NOTHING;
-- 6. Políticas de Storage para o bucket 'photos'
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