-- SECURITY AUDIT & MULTI-TENANCY ISOLATION FIX
-- Esse script garante que TODAS as tabelas tenham RLS habilitado e políticas restritas ao owner.
-- 1. Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standard_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
-- 2. Limpar políticas existentes para evitar conflitos (opcional, mas recomendado para auditoria)
-- Nota: Em produção, isso deve ser feito com cuidado. Aqui recriaremos as principais.
-- 3. Recriar Políticas de Isolamento Rigoroso
-- Service Orders (O ponto reportado)
DROP POLICY IF EXISTS "Users can manage own service orders" ON public.service_orders;
CREATE POLICY "Users can manage own service orders" ON public.service_orders FOR ALL USING (auth.uid() = user_id);
-- Quotes
DROP POLICY IF EXISTS "Users can manage own quotes" ON public.quotes;
CREATE POLICY "Users can manage own quotes" ON public.quotes FOR ALL USING (auth.uid() = user_id);
-- Quote Items (Ligado à Quote que tem user_id)
DROP POLICY IF EXISTS "Users can manage own quote items" ON public.quote_items;
CREATE POLICY "Users can manage own quote items" ON public.quote_items FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.quotes
        WHERE id = quote_items.quote_id
            AND user_id = auth.uid()
    )
);
-- Technical Visits (Ligado ao Customer que tem user_id)
DROP POLICY IF EXISTS "Users can manage own visits" ON public.technical_visits;
CREATE POLICY "Users can manage own visits" ON public.technical_visits FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.customers
        WHERE id = technical_visits.customer_id
            AND user_id = auth.uid()
    )
);
-- Interactions
DROP POLICY IF EXISTS "Users can manage own interactions" ON public.interactions;
CREATE POLICY "Users can manage own interactions" ON public.interactions FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.customers
        WHERE id = interactions.customer_id
            AND user_id = auth.uid()
    )
);
-- Certificando que as outras tabelas básicas também estão protegidas
DROP POLICY IF EXISTS "Users can manage own customers" ON public.customers;
CREATE POLICY "Users can manage own customers" ON public.customers FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own materials" ON public.materials;
CREATE POLICY "Users can manage own materials" ON public.materials FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own fixed costs" ON public.fixed_costs;
CREATE POLICY "Users can manage own fixed costs" ON public.fixed_costs FOR ALL USING (auth.uid() = user_id);
-- 4. Garantir colunas user_id em todas as tabelas e migrar dados baseados em customers
-- Service Orders
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'service_orders'
        AND column_name = 'user_id'
) THEN
ALTER TABLE public.service_orders
ADD COLUMN user_id UUID REFERENCES public.profiles(id);
UPDATE public.service_orders so
SET user_id = q.user_id
FROM public.quotes q
WHERE so.quote_id = q.id;
END IF;
END $$;
-- Projects
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'projects'
        AND column_name = 'user_id'
) THEN
ALTER TABLE public.projects
ADD COLUMN user_id UUID REFERENCES public.profiles(id);
UPDATE public.projects p
SET user_id = c.user_id
FROM public.customers c
WHERE p.customer_id = c.id;
END IF;
END $$;
-- Technical Visits
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'technical_visits'
        AND column_name = 'user_id'
) THEN
ALTER TABLE public.technical_visits
ADD COLUMN user_id UUID REFERENCES public.profiles(id);
UPDATE public.technical_visits tv
SET user_id = c.user_id
FROM public.customers c
WHERE tv.customer_id = c.id;
END IF;
END $$;
-- Interactions
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'interactions'
        AND column_name = 'user_id'
) THEN
ALTER TABLE public.interactions
ADD COLUMN user_id UUID REFERENCES public.profiles(id);
UPDATE public.interactions i
SET user_id = c.user_id
FROM public.customers c
WHERE i.customer_id = c.id;
END IF;
END $$;
-- 5. Atualizar Políticas RLS para usar a nova coluna user_id (mais rápido e seguro)
DROP POLICY IF EXISTS "Users can manage own visits" ON public.technical_visits;
CREATE POLICY "Users can manage own visits" ON public.technical_visits FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own interactions" ON public.interactions;
CREATE POLICY "Users can manage own interactions" ON public.interactions FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own projects" ON public.projects;
CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);