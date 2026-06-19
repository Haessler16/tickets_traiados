
/**
 * app/checkout/[ticketId]/page.tsx
 *
 * Página de checkout para compra de um bilhete específico.
 * Recebe o ticketId como param de rota e o eventId via searchParam.
 *
 * Rota: /checkout/[ticketId]?eventId=xxx
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getEventById } from "@/lib/events";
import { CheckoutClient } from "./CheckoutClient old";
import dayjs from "dayjs";

interface CheckoutPageProps {
  params: Promise<{ ticketId: string }>;
  searchParams: Promise<{ eventId?: string }>;
}

export async function generateMetadata({ params }: CheckoutPageProps) {
  return { title: "Checkout — Traiados Portugal" };
}

export default async function CheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const { ticketId } = await params;
  const { eventId } = await searchParams;

  if (!eventId) notFound();

  const event = await getEventById(eventId);
  if (!event) notFound();

  // Encontra o tipo de bilhete específico
  const ticket = event.ticket_types.find((t) => t.id === ticketId);
  if (!ticket) notFound();

  const remaining = ticket.stock_total - ticket.stock_sold;
  const soldOut = remaining <= 0;

  if (soldOut) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-lg font-bold text-white">Este bilhete está esgotado.</p>
        <Link
          href={`/eventos/${eventId}`}
          className="mt-4 inline-flex items-center gap-2 text-sm text-[#d4a017] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao evento
        </Link>
      </div>
    );
  }

  // Gera um orderId único para esta sessão de checkout
  // Em produção, isto seria criado na DB antes de iniciar o pagamento
  const orderId = `TR-${dayjs().toString()}-${ticketId.slice(-4).toUpperCase()}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-3">
        <Link
          href={`/eventos/${eventId}`}
          className="flex items-center gap-1.5 text-xs font-medium text-white/40 transition hover:text-white/70"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao evento
        </Link>
        <span className="text-white/15">/</span>
        <span className="text-xs text-white/30">Checkout</span>
      </div>

      {/* Título da página */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-4 w-1 rounded-full bg-[#c41e3a]" />
          <h1 className="text-sm font-bold uppercase tracking-widest text-white/50">
            Finalizar compra
          </h1>
        </div>
        <h2 className="text-2xl font-black uppercase text-white">{event.title}</h2>
        <p className="mt-1 text-sm text-white/40">{event.location} · {event.city}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Checkout principal */}
        <CheckoutClient
          orderId={orderId}
          eventTitle={event.title}
          ticketName={ticket.name}
          amount={ticket.price}
        />

        {/* Sidebar com garantias */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#111009] p-5 ring-1 ring-white/[0.06]">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-4 w-4 text-[#1a6b2f]" />
              <p className="text-xs font-bold uppercase tracking-widest text-white/50">
                Compra Segura
              </p>
            </div>
            <ul className="space-y-2.5 text-xs text-white/40">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#1a6b2f]">✓</span>
                Pagamento encriptado e seguro via Ifthenpay Portugal
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#1a6b2f]">✓</span>
                Bilhete enviado por email imediatamente após confirmação
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#1a6b2f]">✓</span>
                Código QR único para entrada no evento
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#1a6b2f]">✓</span>
                MB WAY: confirmação em menos de 5 minutos
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#1a6b2f]">✓</span>
                Multibanco: referência válida por 3 dias
              </li>
            </ul>
          </div>

          <div className="rounded-xl bg-[#111009] p-4 ring-1 ring-white/[0.04]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1">
              Gateway de Pagamento
            </p>
            <p className="text-xs font-bold text-[#d4a017]/60 tracking-wider">
              Ifthenpay Portugal
            </p>
            <p className="mt-1 text-[10px] text-white/20">
              Instituição de Pagamento autorizada pelo Banco de Portugal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}