import { createClient } from "@/lib/supabase/server";
import { MOCK_EVENTS } from "@/lib/mock-data";
import type { EventWithOrganizer, EventWithTickets } from "@/types/database";

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
  );
}

export async function getEvents(filters?: {
  category?: string;
  city?: string;
  search?: string;
}): Promise<EventWithOrganizer[]> {
  if (!isSupabaseConfigured()) {
    return filterMockEvents(MOCK_EVENTS, filters);
  }

  const supabase = await createClient();
  let query = supabase
    .from("events")
    .select("*, organizers(*)")
    .gte("start_date", new Date().toISOString())
    .order("start_date", { ascending: true });

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }
  if (filters?.city && filters.city !== "Todas") {
    query = query.eq("city", filters.city);
  }
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,location.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error || !data) {
    return filterMockEvents(MOCK_EVENTS, filters);
  }

  return data as EventWithOrganizer[];
}

export async function getEventById(
  id: string
): Promise<EventWithTickets | null> {
  if (!isSupabaseConfigured()) {
    const event = MOCK_EVENTS.find((e) => e.id === id);
    if (!event) return null;
    return { ...event, ticket_types: getMockTicketTypes(id) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, organizers(*), ticket_types(*)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as EventWithTickets;
}

function filterMockEvents(
  events: EventWithOrganizer[],
  filters?: { category?: string; city?: string; search?: string }
): EventWithOrganizer[] {
  let result = [...events];

  if (filters?.category) {
    result = result.filter((e) => e.category === filters.category);
  }
  if (filters?.city && filters.city !== "Todas") {
    result = result.filter((e) => e.city === filters.city);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
    );
  }

  return result;
}

function getMockTicketTypes(eventId: string) {
  const tickets: Record<
    string,
    { id: string; name: string; price: number; stock_total: number; stock_sold: number }[]
  > = {
    "b0000000-0000-4000-8000-000000000001": [
      { id: "t1", name: "Passe 1 Dia", price: 89, stock_total: 5000, stock_sold: 1200 },
      { id: "t2", name: "Passe 3 Dias", price: 189, stock_total: 3000, stock_sold: 800 },
      { id: "t3", name: "VIP", price: 350, stock_total: 200, stock_sold: 45 },
    ],
    "b0000000-0000-4000-8000-000000000002": [
      { id: "t4", name: "General", price: 75, stock_total: 8000, stock_sold: 2100 },
      { id: "t5", name: "Golden Circle", price: 120, stock_total: 1500, stock_sold: 400 },
    ],
    "b0000000-0000-4000-8000-000000000003": [
      { id: "t6", name: "Entrada", price: 25, stock_total: 300, stock_sold: 80 },
    ],
    "b0000000-0000-4000-8000-000000000004": [
      { id: "t7", name: "Entrada Geral", price: 15, stock_total: 2000, stock_sold: 500 },
    ],
    "b0000000-0000-4000-8000-000000000005": [
      { id: "t8", name: "Early Bird", price: 79, stock_total: 1000, stock_sold: 1000 },
      { id: "t9", name: "General", price: 95, stock_total: 4000, stock_sold: 900 },
    ],
  };

  const types = tickets[eventId] ?? [];
  return types.map((t) => ({
    ...t,
    event_id: eventId,
    created_at: new Date().toISOString(),
  }));
}
