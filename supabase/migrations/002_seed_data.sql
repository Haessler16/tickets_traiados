-- Datos de ejemplo para desarrollo (opcional)
-- Ejecutar después de 001_initial_schema.sql

INSERT INTO organizers (id, name, logo_url, verified) VALUES
    ('a0000000-0000-4000-8000-000000000001', 'Live Nation PT', NULL, true),
    ('a0000000-0000-4000-8000-000000000002', 'Everything is New', NULL, true),
    ('a0000000-0000-4000-8000-000000000003', 'MEO Arena', NULL, true);

INSERT INTO events (id, title, description, image_url, category, start_date, end_date, location, city, price_from, organizer_id) VALUES
    (
        'b0000000-0000-4000-8000-000000000001',
        'Festival NOS Alive',
        'O maior festival de música em Portugal. Três dias de artistas internacionais e nacionais.',
        'https://images.unsplash.com/photo-1459749411175-04bf3852ceef?w=800&q=80',
        'Música',
        '2026-07-09 14:00:00+00',
        '2026-07-11 23:59:00+00',
        'Passeio Marítimo de Algés',
        'Lisboa',
        89.00,
        'a0000000-0000-4000-8000-000000000001'
    ),
    (
        'b0000000-0000-4000-8000-000000000002',
        'Rock in Rio Lisboa',
        'Edição 2026 do icónico festival com headliners de renome mundial.',
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
        'Música',
        '2026-06-20 16:00:00+00',
        '2026-06-28 23:59:00+00',
        'Parque da Bela Vista',
        'Lisboa',
        75.00,
        'a0000000-0000-4000-8000-000000000002'
    ),
    (
        'b0000000-0000-4000-8000-000000000003',
        'Time Out Market Sessions',
        'Noites de gastronomia e música ao vivo no coração de Lisboa.',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
        'Comida & Bebida',
        '2026-08-15 19:00:00+00',
        '2026-08-15 23:00:00+00',
        'Time Out Market Lisboa',
        'Lisboa',
        25.00,
        'a0000000-0000-4000-8000-000000000003'
    ),
    (
        'b0000000-0000-4000-8000-000000000004',
        'Serralves em Festa',
        'Arte, performance e cultura contemporânea nos jardins do museu.',
        'https://images.unsplash.com/photo-1460661419208-fd791e0e8748?w=800&q=80',
        'Cultura',
        '2026-06-28 10:00:00+00',
        '2026-06-29 22:00:00+00',
        'Fundação de Serralves',
        'Porto',
        15.00,
        'a0000000-0000-4000-8000-000000000002'
    ),
    (
        'b0000000-0000-4000-8000-000000000005',
        'Primavera Sound Porto',
        'Festival indie e alternativo na cidade invicta.',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
        'Música',
        '2026-06-11 14:00:00+00',
        '2026-06-13 23:59:00+00',
        'Parque da Cidade',
        'Porto',
        95.00,
        'a0000000-0000-4000-8000-000000000001'
    );

INSERT INTO ticket_types (event_id, name, price, stock_total, stock_sold) VALUES
    ('b0000000-0000-4000-8000-000000000001', 'Passe 1 Dia', 89.00, 5000, 1200),
    ('b0000000-0000-4000-8000-000000000001', 'Passe 3 Dias', 189.00, 3000, 800),
    ('b0000000-0000-4000-8000-000000000001', 'VIP', 350.00, 200, 45),
    ('b0000000-0000-4000-8000-000000000002', 'General', 75.00, 8000, 2100),
    ('b0000000-0000-4000-8000-000000000002', 'Golden Circle', 120.00, 1500, 400),
    ('b0000000-0000-4000-8000-000000000003', 'Entrada', 25.00, 300, 80),
    ('b0000000-0000-4000-8000-000000000004', 'Entrada Geral', 15.00, 2000, 500),
    ('b0000000-0000-4000-8000-000000000005', 'Early Bird', 79.00, 1000, 1000),
    ('b0000000-0000-4000-8000-000000000005', 'General', 95.00, 4000, 900);
