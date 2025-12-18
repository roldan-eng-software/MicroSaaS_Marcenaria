-- Ordens de Serviço (OS)
CREATE TABLE IF NOT EXISTS public.service_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
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
-- Contratos
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
    contract_pdf_url TEXT,
    signed_pdf_url TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Habilitar RLS
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
-- Políticas de Segurança
DROP POLICY IF EXISTS "Users can manage own service orders" ON public.service_orders;
CREATE POLICY "Users can manage own service orders" ON public.service_orders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own contracts" ON public.contracts;
CREATE POLICY "Users can manage own contracts" ON public.contracts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);