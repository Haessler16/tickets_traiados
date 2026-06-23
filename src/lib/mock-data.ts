import type { EventWithOrganizer, } from "@/types/database";

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

// NEWS LANDING

export const EVENT = {
  id: "b0000000-0000-4000-8000-000000000099", // Añadimos un ID al evento para pasarlo por URL si es necesario
  title: "NOITE SERTANEJA",
  subtitle: "Grande Festa Brasileira",
  date: "Sábado, 28 de Junho de 2025",
  time: "23:00",
  doors: "22:00",
  location: "Club Panorâmico",
  city: "Lisboa",
  address: "Av. das Nações, Lisboa",
  ageRestriction: "Maiores de 18 anos",
  organizer: "Traiados Portugal",
  organizerVerified: true,
  description: `Uma noite inesquecível com o melhor do sertanejo universitário e raiz.
  
Junta o teu grupo e vem viver a energia contagiante que só a música brasileira consegue criar. Artistas ao vivo, ambiente premium e uma pista de dança que nunca para.

Garante já o teu bilhete e sê parte desta noite épica.`,
  imageUrl: "https://mmcfkordrwspwdbgmbmn.supabase.co/storage/v1/object/sign/imgs/IMG_0002.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yYTE4N2M0Yi04M2VmLTRlNzQtOTM4OS1jMDBkMGE0NDM0MmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWdzL0lNR18wMDAyLmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODE3Mjc2MzAsImV4cCI6MTgxMzI2MzYzMH0.eJ_pGkEyf1X2BQ1XTqg9lwtSfzGyGpXnYxgtYVpVERA",
  logoUrl: "/traidos.jpg",
  artists: ["Banda Sertaneja", "DJ Caipira", "Convidados Especiais"],
};

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number | null;
  timeLimit?: string;
  badge?: string;
  badgeColor?: "gold" | "green" | "red";
  available: number;
  includes?: string[];
}

export const TICKETS: TicketType[] = [
  {
    id: "convite-early",
    name: "Convite Antecipado",
    description:
      "Entrada garantida até às 00:30. Após esse horário, sujeito a preço de porta com consumo mínimo de €10.",
    price: 0,
    timeLimit: "até às 00:30",
    badge: "GRATUITO",
    badgeColor: "green",
    available: 40,
    includes: [],
  },
  {
    id: "entrada-elas",
    name: "Entrada S/ Restrição – ELAS",
    description: "Convite sem restrição de horário. Inclui 2 bebidas de oferta.",
    price: 15,
    badge: "ELAS",
    badgeColor: "red",
    available: 60,
    includes: ["2 bebidas incluídas", "Sem restrição de horário"],
  },
  {
    id: "entrada-eles",
    name: "Entrada S/ Restrição – ELES",
    description: "Convite sem restrição de horário. Inclui 1 bebida de oferta.",
    price: 17.5,
    badge: "ELES",
    badgeColor: "gold",
    available: 55,
    includes: ["1 bebida incluída", "Sem restrição de horário"],
  },
  {
    id: "vip-early",
    name: "Convite VIP até 00:30",
    description:
      "Este convite VIP tem entrada até 00:30, caso não cumpra o horário de entrada será sujeito a pagar a diferença para o preço de porta. Esta entrada tem 2 bebidas de oferta para ELAS ou tem 1 bebida de oferta para ELES.",
    price: 25,
    timeLimit: "até 00:30",
    badge: "VIP",
    badgeColor: "gold",
    available: 40,
  },
  {
    id: "vip-full",
    name: "Convite VIP S/Restrição de Horário",
    description:
      "Este convite VIP não possui restrição de horário. Esta entrada tem 2 bebidas de oferta para ELAS ou tem 1 bebida de oferta para ELES.",
    price: 30,
    badge: "VIP S/ RESTRIÇÃO",
    badgeColor: "gold",
    available: 15,
  },
];
