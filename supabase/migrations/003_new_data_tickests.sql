-- 1. Add the new columns to the existing table
ALTER TABLE ticket_types
ADD COLUMN description TEXT,
ADD COLUMN time_limit TEXT,
ADD COLUMN badge TEXT,
ADD COLUMN badge_color TEXT,
ADD COLUMN includes TEXT[];

-- 2. Insert the specific event using a valid UUID format
INSERT INTO events (id, title, description, category, start_date, end_date, location, city, price_from)
VALUES (
    'b0000000-0000-4000-8000-000000000099', -- <-- Cambiado por un UUID válido
    'NOITE SERTANEJA', 
    'Uma noite inesquecível com o melhor do sertanejo...', 
    'Música', 
    '2026-06-28 23:00:00+00', 
    '2026-06-29 06:00:00+00', 
    'Club Panorâmico', 
    'Lisboa', 
    0
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert the rich ticket data using the same UUID
INSERT INTO ticket_types (event_id, name, description, price, time_limit, badge, badge_color, stock_total, stock_sold, includes) VALUES
    ('b0000000-0000-4000-8000-000000000099', 'Convite Antecipado', 'Entrada garantida até às 00:30. Após esse horário, sujeito a preço de porta.', 0, 'até às 00:30', 'GRATUITO', 'green', 40, 0, '{}'),
    ('b0000000-0000-4000-8000-000000000099', 'Entrada S/ Restrição – ELAS', 'Convite sem restrição de horário. Inclui 2 bebidas de oferta.', 15, NULL, 'ELAS', 'red', 60, 0, '{"2 bebidas incluídas", "Sem restrição de horário"}'),
    ('b0000000-0000-4000-8000-000000000099', 'Entrada S/ Restrição – ELES', 'Convite sem restrição de horário. Inclui 1 bebida de oferta.', 17.5, NULL, 'ELES', 'gold', 55, 0, '{"1 bebida incluída", "Sem restrição de horário"}'),
    ('b0000000-0000-4000-8000-000000000099', 'Convite VIP até 00:30', 'Este convite VIP tem entrada até 00:30...', 25, 'até 00:30', 'VIP', 'gold', 40, 0, '{}'),
    ('b0000000-0000-4000-8000-000000000099', 'Convite VIP S/Restrição de Horário', 'Este convite VIP não possui restrição de horário...', 30, NULL, 'VIP S/ RESTRIÇÃO', 'gold', 15, 0, '{}');