import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, BadgeCheck } from "lucide-react";
import type { EventWithOrganizer } from "@/types/database";
import { formatPrice, formatShortDate } from "@/lib/utils";

interface EventCardProps {
  event: EventWithOrganizer;
}

export function EventCard({ event }: EventCardProps) {
  const available =
    event.price_from === 0
      ? "Grátis"
      : `desde ${formatPrice(event.price_from)}`;

  return (
    <Link
      href={`/eventos/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white/[0.02] ring-1 ring-white/5 transition hover:bg-white/[0.05] hover:ring-brand-gold/30"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-amber-950/20">
            <span className="text-4xl font-bold text-brand-gold/20">
              {event.title.charAt(0)}
            </span>
          </div>
        )}

        <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm ring-1 ring-white/10">
          {event.category}
        </div>

        {/* Badge de data utilizando o vermelho de destaque */}
        <div className="absolute bottom-3 left-3 rounded-lg bg-brand-red px-3 py-1.5 text-sm font-bold text-white shadow-lg">
          {formatShortDate(event.start_date)}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-white group-hover:text-brand-gold transition-colors">
          {event.title}
        </h3>

        {event.organizers && (
          <p className="mt-1 flex items-center gap-1 text-xs text-white/50">
            {event.organizers.name}
            {event.organizers.verified && (
              <BadgeCheck className="h-3.5 w-3.5 text-brand-green" />
            )}
          </p>
        )}

        <div className="mt-3 space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs text-white/60">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-white/40" />
            {event.city}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-white/60">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-white/40" />
            <span className="line-clamp-1">{event.location}</span>
          </p>
        </div>


        <div className="mt-5 flex items-center justify-between pt-3 border-t border-white/5">
          <p className="text-sm font-bold text-brand-gold">
            {available}
          </p>
          <span className="rounded-xl bg-brand-red px-3 py-1.5 text-xs font-semibold text-white transition group-hover:bg-red-700">
            Comprar Tickets
          </span>
        </div>
      </div>
    </Link>
  );
}