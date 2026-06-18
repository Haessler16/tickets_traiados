import type { EventWithOrganizer } from "@/types/database";

export const MOCK_EVENTS: EventWithOrganizer[] = [
  {
    id: "b0000000-0000-4000-8000-000000000001",
    title: "Festival NOS Alive",
    description:
      "O maior festival de música em Portugal. Três dias de artistas internacionais e nacionais.",
    image_url:
      "https://mmcfkordrwspwdbgmbmn.supabase.co/storage/v1/object/sign/imgs/IMG_0120.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yYTE4N2M0Yi04M2VmLTRlNzQtOTM4OS1jMDBkMGE0NDM0MmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWdzL0lNR18wMTIwLmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODE3MjgwMjYsImV4cCI6MTgxMzI2NDAyNn0.UmbWwnG6cXePufViO6-eplvCaaVd-FaI_hFTv30zXg0",
    category: "Música",
    start_date: "2026-07-09T14:00:00.000Z",
    end_date: "2026-07-11T23:59:00.000Z",
    location: "Passeio Marítimo de Algés",
    city: "Lisboa",
    price_from: 89,
    organizer_id: "a0000000-0000-4000-8000-000000000001",
    created_at: "2026-01-01T00:00:00.000Z",
    organizers: {
      id: "a0000000-0000-4000-8000-000000000001",
      name: "Live Nation PT",
      logo_url: null,
      verified: true,
    },
  },
  {
    id: "b0000000-0000-4000-8000-000000000002",
    title: "Rock in Rio Lisboa",
    description:
      "Edição 2026 do icónico festival com headliners de renome mundial.",
    image_url:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    category: "Música",
    start_date: "2026-06-20T16:00:00.000Z",
    end_date: "2026-06-28T23:59:00.000Z",
    location: "Parque da Bela Vista",
    city: "Lisboa",
    price_from: 75,
    organizer_id: "a0000000-0000-4000-8000-000000000002",
    created_at: "2026-01-01T00:00:00.000Z",
    organizers: {
      id: "a0000000-0000-4000-8000-000000000002",
      name: "Everything is New",
      logo_url: null,
      verified: true,
    },
  },
  {
    id: "b0000000-0000-4000-8000-000000000003",
    title: "Time Out Market Sessions",
    description:
      "Noites de gastronomia e música ao vivo no coração de Lisboa.",
    image_url:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    category: "Comida & Bebida",
    start_date: "2026-08-15T19:00:00.000Z",
    end_date: "2026-08-15T23:00:00.000Z",
    location: "Time Out Market Lisboa",
    city: "Lisboa",
    price_from: 25,
    organizer_id: "a0000000-0000-4000-8000-000000000003",
    created_at: "2026-01-01T00:00:00.000Z",
    organizers: {
      id: "a0000000-0000-4000-8000-000000000003",
      name: "MEO Arena",
      logo_url: null,
      verified: true,
    },
  },
  {
    id: "b0000000-0000-4000-8000-000000000004",
    title: "Serralves em Festa",
    description:
      "Arte, performance e cultura contemporânea nos jardins do museu.",
    image_url:
      "https://mmcfkordrwspwdbgmbmn.supabase.co/storage/v1/object/sign/imgs/IMG_0002.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yYTE4N2M0Yi04M2VmLTRlNzQtOTM4OS1jMDBkMGE0NDM0MmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWdzL0lNR18wMDAyLmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODE3Mjc2MzAsImV4cCI6MTgxMzI2MzYzMH0.eJ_pGkEyf1X2BQ1XTqg9lwtSfzGyGpXnYxgtYVpVERA",
    category: "Cultura",
    start_date: "2026-06-28T10:00:00.000Z",
    end_date: "2026-06-29T22:00:00.000Z",
    location: "Fundação de Serralves",
    city: "Porto",
    price_from: 15,
    organizer_id: "a0000000-0000-4000-8000-000000000002",
    created_at: "2026-01-01T00:00:00.000Z",
    organizers: {
      id: "a0000000-0000-4000-8000-000000000002",
      name: "Everything is New",
      logo_url: null,
      verified: true,
    },
  },
  {
    id: "b0000000-0000-4000-8000-000000000005",
    title: "Primavera Sound Porto",
    description: "Festival indie e alternativo na cidade invicta.",
    image_url:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    category: "Música",
    start_date: "2026-06-11T14:00:00.000Z",
    end_date: "2026-06-13T23:59:00.000Z",
    location: "Parque da Cidade",
    city: "Porto",
    price_from: 95,
    organizer_id: "a0000000-0000-4000-8000-000000000001",
    created_at: "2026-01-01T00:00:00.000Z",
    organizers: {
      id: "a0000000-0000-4000-8000-000000000001",
      name: "Live Nation PT",
      logo_url: null,
      verified: true,
    },
  },
];
