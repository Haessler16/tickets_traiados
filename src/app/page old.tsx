import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import { getEvents } from "@/lib/events";

interface HomePageProps {
  searchParams: Promise<{
    category?: string;
    city?: string;
    q?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const events = await getEvents({
    category: params.category,
    city: params.city,
    search: params.q,
  });

  return (
    <div>
      {/* Hero com um degradê suave em tons de âmbar/dourado rústico */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex items-center gap-2 text-brand-gold">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Eventos & Cultura Sertaneja em Portugal</span>
          </div>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Vive momentos
            <span className="text-brand-gold"> extraordinários</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/60">
            Grandes concertos, festivais, rodeios e a melhor gastronomia luso-brasileira.
            Encontra o teu próximo evento e garante o teu bilhete em segundos.
          </p>
        </div>
      </section>

      {/* Listagem */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <aside>
            <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-white/5" />}>
              <EventFilters />
            </Suspense>
          </aside>

          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white/90">
                {events.length} evento{events.length !== 1 ? "s" : ""} encontrado{events.length !== 1 ? "s" : ""}
              </h2>
            </div>

            {events.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
                <p className="text-white/50">
                  Nenhum evento encontrado. Tenta outros filtros ou categorias.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}