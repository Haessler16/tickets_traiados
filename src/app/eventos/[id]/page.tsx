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
          <div className="h-full bg-violet-900/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/70 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <span className="mb-2 inline-block rounded-full bg-violet-600 px-3 py-1 text-xs font-medium">
              {event.category}
            </span>
            <h1 className="text-3xl font-bold sm:text-4xl">{event.title}</h1>
            {event.organizers && (
              <p className="mt-2 flex items-center gap-1 text-sm text-white/60">
                {event.organizers.name}
                {event.organizers.verified && (
                  <BadgeCheck className="h-4 w-4 text-violet-400" />
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Info */}
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                <Calendar className="h-5 w-5 text-violet-400" />
                <p className="mt-2 text-sm font-medium">Data</p>
                <p className="mt-1 text-sm text-white/60">
                  {formatEventDate(event.start_date)}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                <MapPin className="h-5 w-5 text-violet-400" />
                <p className="mt-2 text-sm font-medium">Local</p>
                <p className="mt-1 text-sm text-white/60">{event.location}</p>
                <p className="text-sm text-white/40">{event.city}</p>
              </div>
            </div>

            {event.description && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold">Sobre o evento</h2>
                <p className="mt-3 leading-relaxed text-white/70">
                  {event.description}
                </p>
              </div>
            )}
          </div>

          {/* Bilhetes */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-violet-400" />
                <h2 className="text-lg font-semibold">Bilhetes</h2>
              </div>

              <div className="mt-4 space-y-3">
                {event.ticket_types.map((ticket) => {
                  const remaining = ticket.stock_total - ticket.stock_sold;
                  const soldOut = remaining <= 0;

                  return (
                    <div
                      key={ticket.id}
                      className={cn(
                        "flex items-center justify-between rounded-xl border border-white/10 p-4",
                        soldOut && "opacity-50"
                      )}
                    >
                      <div>
                        <p className="font-medium">{ticket.name}</p>
                        <p className="text-xs text-white/50">
                          {soldOut
                            ? "Esgotado"
                            : `${remaining} disponíve${remaining === 1 ? "l" : "is"}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-violet-400">
                          {formatPrice(ticket.price)}
                        </p>
                        <button
                          type="button"
                          disabled={soldOut}
                          className="mt-1 rounded-lg bg-violet-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                        >
                          {soldOut ? "Esgotado" : "Comprar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {event.ticket_types.length === 0 && (
                <p className="mt-4 text-sm text-white/50">
                  Bilhetes indisponíveis de momento.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
