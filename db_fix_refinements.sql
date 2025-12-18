-- 1. Criar a tabela de Custos Fixos (caso não exista)
CREATE TABLE IF NOT EXISTS public.fixed_costs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    monthly_rent DECIMAL(10, 2) DEFAULT 0,
    monthly_energy DECIMAL(10, 2) DEFAULT 0,
    monthly_internet DECIMAL(10, 2) DEFAULT 0,
    profit_margin_percent DECIMAL(5, 2) DEFAULT 30,
    taxes_percent DECIMAL(5, 2) DEFAULT 15,
    labor_cost_per_hour DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fixed_costs_user_id_key UNIQUE (user_id)
);
-- 2. Habilitar RLS e criar política de segurança
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Users can manage own fixed costs'
) THEN CREATE POLICY "Users can manage own fixed costs" ON public.fixed_costs FOR ALL USING (auth.uid() = user_id);
END IF;
END $$;
-- 3. Adicionar coluna de fotos na Ordem de Serviço (caso não exista)
ALTER TABLE public.service_orders
ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';