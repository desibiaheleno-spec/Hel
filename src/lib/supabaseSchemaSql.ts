export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- TECNOGEST - SCRIPT DE CRIAÇÃO DO BANCO DE DADOS SUPABASE
-- Execute este script no "SQL Editor" do painel do seu Supabase
-- ========================================================

-- 1. Tabela: Perfil da Empresa Prestadora
CREATE TABLE IF NOT EXISTS public.company_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    corporate_name TEXT NOT NULL,
    trade_name TEXT NOT NULL,
    cnpj TEXT NOT NULL,
    state_registration TEXT,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT NOT NULL,
    website TEXT,
    address JSONB DEFAULT '{}'::jsonb,
    pix_key_type TEXT DEFAULT 'cnpj',
    pix_key TEXT,
    bank_info JSONB DEFAULT '{}'::jsonb,
    logo_url TEXT,
    default_warranty_days INT DEFAULT 90,
    default_payment_terms TEXT DEFAULT 'À vista 50% de entrada + 50% na conclusão',
    quote_notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela: Clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    trade_name TEXT,
    document TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    address JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela: Máquinas e Equipamentos dos Clientes
CREATE TABLE IF NOT EXISTS public.machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    manufacture_year TEXT,
    voltage_power TEXT,
    location_in_client TEXT,
    criticality TEXT DEFAULT 'media' CHECK (criticality IN ('baixa', 'media', 'alta', 'critica')),
    specifications TEXT,
    photo_url TEXT,
    last_maintenance_date DATE,
    next_preventive_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela: Catálogo de Serviços
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'mecanica',
    price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hh')),
    base_price NUMERIC(12, 2) DEFAULT 0.00,
    estimated_hours NUMERIC(6, 2) DEFAULT 1.0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela: Tabela de Homem-Hora (H.H.)
CREATE TABLE IF NOT EXISTS public.hh_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialty TEXT NOT NULL,
    hourly_rate NUMERIC(10, 2) NOT NULL,
    overtime_rate NUMERIC(10, 2) NOT NULL,
    weekend_rate NUMERIC(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela: Colaboradores / Técnicos
CREATE TABLE IF NOT EXISTS public.technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    specialty TEXT,
    access_code TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela: Orçamentos / Propostas Comerciais
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT NOT NULL UNIQUE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_document TEXT,
    client_phone TEXT,
    client_address TEXT,
    machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
    machine_name TEXT,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'canceled')),
    items JSONB DEFAULT '[]'::jsonb,
    subtotal_services NUMERIC(12, 2) DEFAULT 0.00,
    subtotal_hh NUMERIC(12, 2) DEFAULT 0.00,
    subtotal_parts NUMERIC(12, 2) DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) DEFAULT 0.00,
    payment_terms TEXT,
    estimated_execution_days INT DEFAULT 2,
    notes TEXT,
    closed_at TIMESTAMPTZ,
    work_order_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela: Ordens de Serviço (Serviços Fechados)
CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT NOT NULL UNIQUE,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    client_address TEXT,
    machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
    machine_name TEXT,
    machine_serial TEXT,
    technician_id UUID REFERENCES public.technicians(id) ON DELETE SET NULL,
    technician_name TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    status TEXT DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_deslocamento', 'em_andamento', 'aguardando_pecas', 'concluida', 'faturada')),
    scope_description TEXT NOT NULL,
    technical_report TEXT,
    actual_hours_worked NUMERIC(6, 2) DEFAULT 0.0,
    parts_replaced TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    total_value NUMERIC(12, 2) DEFAULT 0.00,
    payment_status TEXT DEFAULT 'pendente' CHECK (payment_status IN ('pendente', 'pago', 'parcial')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    customer_signature TEXT,
    recommendations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Índices para Otimização de Busca
CREATE INDEX IF NOT EXISTS idx_machines_client_id ON public.machines(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON public.quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_technician ON public.work_orders(technician_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_scheduled_date ON public.work_orders(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_work_orders_machine_id ON public.work_orders(machine_id);

-- 10. Habilitar RLS com Permissão de Leitura/Escrita
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hh_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso anônimo/autenticado para a chave pública (anon key)
DO $$
BEGIN
    EXECUTE 'CREATE POLICY "Anon policy company" ON public.company_profile FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Anon policy clients" ON public.clients FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Anon policy machines" ON public.machines FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Anon policy services" ON public.services FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Anon policy hh_rates" ON public.hh_rates FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Anon policy technicians" ON public.technicians FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Anon policy quotes" ON public.quotes FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Anon policy work_orders" ON public.work_orders FOR ALL USING (true) WITH CHECK (true)';
EXCEPTION WHEN OTHERS THEN
    -- Políticas já existentes são ignoradas com segurança
    NULL;
END $$;
`;
