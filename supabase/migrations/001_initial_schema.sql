-- Plataforma de Eventos — Schema inicial
-- Ejecutar en el SQL Editor de Supabase o via CLI: supabase db push

-- ---------------------------------------------------------------------------
-- 1. Perfiles de Usuario
-- ---------------------------------------------------------------------------
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ---------------------------------------------------------------------------
-- 2. Organizadores de Eventos
-- ---------------------------------------------------------------------------
CREATE TABLE organizers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    verified BOOLEAN DEFAULT false
);

-- ---------------------------------------------------------------------------
-- 3. Eventos
-- ---------------------------------------------------------------------------
CREATE TABLE events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    price_from NUMERIC(10, 2) DEFAULT 0.00,
    organizer_id UUID REFERENCES organizers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_start_date ON events(start_date);

-- ---------------------------------------------------------------------------
-- 4. Tipos de Entradas por Evento
-- ---------------------------------------------------------------------------
CREATE TABLE ticket_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock_total INTEGER NOT NULL,
    stock_sold INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT stock_sold_lte_total CHECK (stock_sold <= stock_total)
);

CREATE INDEX idx_ticket_types_event_id ON ticket_types(event_id);

-- ---------------------------------------------------------------------------
-- 5. Órdenes de Compra
-- ---------------------------------------------------------------------------
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    payment_method TEXT NOT NULL,
    ifthenpay_id TEXT,
    payment_reference TEXT,
    payment_entity TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT orders_status_check CHECK (status IN ('pending', 'paid', 'expired')),
    CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('multibanco', 'mbway'))
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ---------------------------------------------------------------------------
-- 6. Tickets Emitidos
-- ---------------------------------------------------------------------------
CREATE TABLE user_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES ticket_types(id),
    qr_code_hash TEXT NOT NULL,
    validated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_user_tickets_user_id ON user_tickets(user_id);
CREATE INDEX idx_user_tickets_order_id ON user_tickets(order_id);

-- ---------------------------------------------------------------------------
-- Trigger: crear perfil al registrarse
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.email
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tickets ENABLE ROW LEVEL SECURITY;

-- profiles: usuarios ven/editan solo su perfil
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- organizers: lectura pública
CREATE POLICY "Organizers are publicly readable"
    ON organizers FOR SELECT
    USING (true);

-- events: lectura pública
CREATE POLICY "Events are publicly readable"
    ON events FOR SELECT
    USING (true);

-- ticket_types: lectura pública
CREATE POLICY "Ticket types are publicly readable"
    ON ticket_types FOR SELECT
    USING (true);

-- orders: usuarios ven solo sus órdenes; insertan las suyas
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- user_tickets: usuarios ven solo sus entradas
CREATE POLICY "Users can view own tickets"
    ON user_tickets FOR SELECT
    USING (auth.uid() = user_id);

-- Service role bypasses RLS for webhooks (Ifthenpay) and server-side ops
