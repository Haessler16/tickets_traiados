import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  BadgeCheck,
  Ticket,
} from "lucide-react";
import { getEventById } from "@/lib/events";
import { formatEventDate, formatPrice, cn } from "@/lib/utils";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EventPageProps) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return { title: "Evento não encontrado" };
  return {
    title: event.title,
    description: event.description ?? undefined,
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) notFound();

  return (
    <div className="pb-16">
      {/* Banner */}
      <div className="relative h-64 sm:h-80 lg:h-96">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="h-full bg-amber-950/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

        <div className="absolute top-4 left-4 z-10">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-md ring-1 ring-white/10 transition hover:bg-black/80 hover:text-brand-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-32 z-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Detalhes do Evento */}
          <div className="space-y-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl sm:p-8">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-brand-gold ring-1 ring-white/10">
                {event.category}
              </span>
              <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                {event.title}
              </h1>

              {event.organizers && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span>Organizado por</span>
                  <span className="font-medium text-white">
                    {event.organizers.name}
                  </span>
                  {event.organizers.verified && (
                    <BadgeCheck className="h-4 w-4 text-brand-green" />
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-4 rounded-xl bg-white/[0.02] p-4 ring-1 ring-white/5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" />
                <div>
                  <p className="text-sm font-medium text-white">Data e Hora</p>
                  <p className="mt-0.5 text-xs text-white/60">
                    {formatEventDate(event.start_date)}
                  </p>
                  <p>ate</p>
                  <p className="mt-0.5 text-xs text-white/60">
                    {formatEventDate(event.end_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" />
                <div>
                  <p className="text-sm font-medium text-white">Localização</p>
                  <p className="mt-0.5 text-xs text-white/60">{event.location}</p>
                  <p className="text-xs text-white/40">{event.city}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Sobre o evento</h2>
              <p className="text-sm leading-relaxed text-white/70 whitespace-pre-wrap">
                {event.description || "Nenhuma descrição disponível para este evento."}
              </p>
            </div>
          </div>

          {/* Secção de Bilhetes (Sidebar) */}
          <div className="h-fit space-y-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Ticket className="h-5 w-5 text-brand-gold" />
                Bilhetes disponíveis
              </h2>
              <p className="mt-1 text-xs text-white/50">
                Garante o teu lugar com segurança antes que esgote.
              </p>
            </div>

            <div className="divide-y divide-white/5">
              {event.ticket_types?.map((ticket) => {
                const remaining = ticket.stock_total - ticket.stock_sold;
                const soldOut = remaining <= 0;

                return (
                  <div
                    key={ticket.id}
                    className={cn(
                      "flex items-center justify-between py-4 first:pt-0 last:pb-0",
                      soldOut && "opacity-50"
                    )}
                  >
                    <div>
                      <p className="font-medium text-white">{ticket.name}</p>
                      <p className="text-xs text-white/50">
                        {soldOut
                          ? "Esgotado"
                          : `${remaining} disponíve${remaining === 1 ? "l" : "is"}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-gold">
                        {formatPrice(ticket.price)}
                      </p>
                      <button
                        type="button"
                        disabled={soldOut}
                        className="mt-1 rounded-lg bg-brand-red px-3 py-1 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 shadow-sm shadow-brand-red/10"
                      >
                        {soldOut ? "Esgotado" : "Comprar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {(!event.ticket_types || event.ticket_types.length === 0) && (
              <p className="text-sm text-white/50">
                Bilhetes indisponíveis de momento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}