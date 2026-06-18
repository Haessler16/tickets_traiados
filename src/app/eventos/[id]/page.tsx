import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  BadgeCheck,
  Ticket,
  ShieldCheck,
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
      {/* Banner de Topo */}
      <div className="relative h-64 sm:h-80 lg:h-[450px]">
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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-bold text-white backdrop-blur-md ring-1 ring-white/10 transition hover:bg-black/80 hover:text-brand-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-32 z-10 grid gap-8 lg:grid-cols-[1fr_400px]">

          {/* Informação do Evento */}
          <div className="space-y-8 rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl sm:p-10">
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-brand-gold/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-brand-gold ring-1 ring-brand-gold/20">
                {event.category}
              </span>
              <h1 className="text-3xl font-black uppercase text-white sm:text-4xl lg:text-5xl leading-tight">
                {event.title}
              </h1>

              {event.organizers && (
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <span>Organizado por</span>
                  <span className="font-bold text-white">{event.organizers.name}</span>
                  {event.organizers.verified && (
                    <BadgeCheck className="h-4 w-4 text-brand-green" />
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-6 rounded-2xl bg-white/[0.02] p-6 ring-1 ring-white/5 sm:grid-cols-2">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10">
                  <Calendar className="h-5 w-5 text-brand-gold" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Data e Hora</p>
                  <p className="mt-1 text-sm font-medium text-white/80">
                    {formatEventDate(event.start_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10">
                  <MapPin className="h-5 w-5 text-brand-gold" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Localização</p>
                  <p className="mt-1 text-sm font-medium text-white/80">{event.location}</p>
                  <p className="text-xs text-white/40">{event.city}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold uppercase tracking-tight text-white">Sobre o evento</h2>
              <p className="text-base leading-relaxed text-white/60 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          </div>

          {/* Seleção de Bilhetes */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div className="rounded-3xl border border-white/5 bg-[#111009] p-6 shadow-2xl ring-1 ring-white/5 sm:p-8">
              <div className="mb-6">
                <h2 className="flex items-center gap-2 text-lg font-black uppercase text-white">
                  <Ticket className="h-5 w-5 text-brand-gold" />
                  Bilhetes
                </h2>
                <p className="mt-1 text-xs text-white/40 font-medium">Escolhe a tua entrada para este evento.</p>
              </div>

              <div className="space-y-4">
                {event.ticket_types?.map((ticket) => {
                  const remaining = ticket.stock_total - ticket.stock_sold;
                  const soldOut = remaining <= 0;

                  return (
                    <div
                      key={ticket.id}
                      className={cn(
                        "group flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-brand-gold/20",
                        soldOut && "opacity-50 grayscale"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-white text-base">{ticket.name}</p>
                          <p className="text-xs font-medium text-white/40">
                            {soldOut
                              ? "Esgotado"
                              : `${remaining} disponíveis`}
                          </p>
                        </div>
                        <p className="text-lg font-black text-brand-gold">
                          {formatPrice(ticket.price)}
                        </p>
                      </div>

                      <Link
                        href={soldOut ? "#" : `/checkout/${ticket.id}?eventId=${event.id}`}
                        className={cn(
                          "flex w-full items-center justify-center rounded-xl py-3 text-xs font-black uppercase tracking-widest transition shadow-lg",
                          soldOut
                            ? "cursor-not-allowed bg-white/10 text-white/30"
                            : "bg-brand-red text-white hover:bg-red-700 shadow-brand-red/20"
                        )}
                      >
                        {soldOut ? "Esgotado" : "Comprar"}
                      </Link>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center gap-2 rounded-xl bg-brand-green/5 p-3 text-[10px] font-medium text-brand-green/60 ring-1 ring-brand-green/10">
                <ShieldCheck className="h-3.5 w-3.5" />
                Pagamento seguro e bilhete digital imediato.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}