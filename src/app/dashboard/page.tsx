"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Ticket,
  Clock,
  CheckCircle2,
  Copy,
  Smartphone,
  // CreditCard,
  ExternalLink,
  AlertCircle,
  Loader2,
  RefreshCw,
  QrCode,
  Download,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TicketStatus =
  | "PAID"
  | "PENDING_MULTIBANCO"
  | "PENDING_MBWAY"
  | "CANCELLED"
  | "EXPIRED";

interface PaymentDetails {
  entity?: string;
  reference?: string;
  amount?: string;
  expiresAt?: string;
  phone?: string;
  transactionId?: string;
}

interface UserTicket {
  id: string;
  eventTitle: string;
  eventId: string;
  city: string;
  date: string;
  ticketName: string;
  status: TicketStatus;
  price: number;
  code?: string;
  qrData?: string; // dados para o QR (em prod: URL ou JWT do bilhete)
  paymentDetails?: PaymentDetails;
}

// ─── Mock data (substituir por query Supabase real) ───────────────────────────

const MOCK_USER_TICKETS: UserTicket[] = [
  {
    id: "order_01",
    eventTitle: "Festival NOS Alive 2026",
    eventId: "event_alive",
    city: "Lisboa",
    date: "09 Jul 2026",
    ticketName: "Passe Geral 3 Dias",
    status: "PAID",
    price: 189.0,
    code: "TR-9832-ALIVE",
    qrData: "TR-9832-ALIVE|Festival NOS Alive 2026|Passe Geral 3 Dias|189.00",
  },
  {
    id: "order_02",
    eventTitle: "Grande Rodeio Sertanejo",
    eventId: "event_rodeio",
    city: "Porto",
    date: "14 Ago 2026",
    ticketName: "Bilhete VIP Fan Zone",
    status: "PENDING_MULTIBANCO",
    price: 75.0,
    paymentDetails: {
      entity: "24422",
      reference: "123456789",
      amount: "75.00",
      expiresAt: "17 Jun 2026 às 23:59",
    },
  },
  {
    id: "order_03",
    eventTitle: "Serralves em Festa",
    eventId: "event_serralves",
    city: "Porto",
    date: "28 Jun 2026",
    ticketName: "Entrada Diária",
    status: "PENDING_MBWAY",
    price: 15.0,
    paymentDetails: {
      phone: "912 345 678",
      transactionId: "mbw_tx_abc123",
    },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(v: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);
}

function formatReference(ref: string) {
  return ref.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
}

const STATUS_LABEL: Record<TicketStatus, string> = {
  PAID: "Confirmado",
  PENDING_MULTIBANCO: "Aguarda Pagamento",
  PENDING_MBWAY: "Aguarda MB WAY",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
};

const STATUS_COLOR: Record<TicketStatus, string> = {
  PAID: "text-[#1a6b2f] bg-[#1a6b2f]/10 ring-[#1a6b2f]/20",
  PENDING_MULTIBANCO: "text-amber-400 bg-amber-500/10 ring-amber-500/20",
  PENDING_MBWAY: "text-[#c41e3a] bg-[#c41e3a]/10 ring-[#c41e3a]/20",
  CANCELLED: "text-white/30 bg-white/5 ring-white/10",
  EXPIRED: "text-white/30 bg-white/5 ring-white/10",
};

const STATUS_ICON: Record<TicketStatus, React.ReactNode> = {
  PAID: <CheckCircle2 className="h-3 w-3" />,
  PENDING_MULTIBANCO: <Clock className="h-3 w-3 animate-pulse" />,
  PENDING_MBWAY: <Smartphone className="h-3 w-3 animate-pulse" />,
  CANCELLED: <AlertCircle className="h-3 w-3" />,
  EXPIRED: <Clock className="h-3 w-3" />,
};

// ─── Sub-componente: Bilhete expandido ───────────────────────────────────────

function TicketCard({ ticket }: { ticket: UserTicket }) {
  const [expanded, setExpanded] = useState(ticket.status !== "PAID");
  const [copied, setCopied] = useState<string | null>(null);
  const [mbwayStatus, setMbwayStatus] = useState<"pending" | "paid" | "error">("pending");
  const [checkingMbway, setCheckingMbway] = useState(false);

  function copyToClipboard(value: string, key: string) {
    navigator.clipboard.writeText(value.replace(/\s/g, ""));
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  async function checkMbwayStatus() {
    if (!ticket.paymentDetails?.transactionId) return;
    setCheckingMbway(true);
    try {
      const res = await fetch(
        `/api/payment/status?transactionId=${ticket.paymentDetails.transactionId}`
      );
      const data = await res.json();
      if (data.isPaid) setMbwayStatus("paid");
      else if (data.isError || data.isCancelled) setMbwayStatus("error");
    } catch {
      // ignora erros de rede pontuais
    } finally {
      setCheckingMbway(false);
    }
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border transition-all",
        ticket.status === "PAID"
          ? "border-[#1a6b2f]/15 bg-[#0e120e]"
          : ticket.status === "PENDING_MULTIBANCO"
            ? "border-amber-800/20 bg-[#110e08]"
            : ticket.status === "PENDING_MBWAY"
              ? "border-[#c41e3a]/15 bg-[#110a0a]"
              : "border-white/[0.04] bg-[#0d0c08]"
      )}
    >
      {/* Linha de cor no topo */}
      <div
        className={cn(
          "h-0.5 w-full",
          ticket.status === "PAID"
            ? "bg-gradient-to-r from-[#1a6b2f] to-transparent"
            : ticket.status === "PENDING_MULTIBANCO"
              ? "bg-gradient-to-r from-amber-600/60 to-transparent"
              : ticket.status === "PENDING_MBWAY"
                ? "bg-gradient-to-r from-[#c41e3a]/60 to-transparent"
                : "bg-white/[0.04]"
        )}
      />

      {/* Header do card */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start gap-4 p-5 text-left"
      >
        {/* Ícone status */}
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            ticket.status === "PAID"
              ? "bg-[#1a6b2f]/15"
              : ticket.status.startsWith("PENDING")
                ? "bg-amber-500/10"
                : "bg-white/5"
          )}
        >
          <Ticket
            className={cn(
              "h-4 w-4",
              ticket.status === "PAID"
                ? "text-[#1a6b2f]"
                : ticket.status.startsWith("PENDING")
                  ? "text-[#d4a017]"
                  : "text-white/20"
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs text-white/35">{ticket.date} · {ticket.city}</span>
            {/* Badge de status */}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1",
                STATUS_COLOR[ticket.status]
              )}
            >
              {STATUS_ICON[ticket.status]}
              {STATUS_LABEL[ticket.status]}
            </span>
          </div>
          <h3 className="text-base font-bold text-white leading-snug">{ticket.eventTitle}</h3>
          <p className="mt-0.5 text-sm text-white/50">{ticket.ticketName}</p>
        </div>

        <div className="shrink-0 text-right ml-3">
          <span className="text-base font-black text-[#d4a017]">{formatPrice(ticket.price)}</span>
          <div className="mt-1">
            {expanded ? (
              <ChevronUp className="ml-auto h-3.5 w-3.5 text-white/20" />
            ) : (
              <ChevronDown className="ml-auto h-3.5 w-3.5 text-white/20" />
            )}
          </div>
        </div>
      </button>

      {/* Conteúdo expandido */}
      {expanded && (
        <div className="border-t border-white/[0.04] px-5 pb-5 pt-4">

          {/* ── BILHETE PAGO: Código + QR ── */}
          {ticket.status === "PAID" && ticket.code && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* QR Code (placeholder visual) */}
                <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4 sm:w-32 sm:h-32">
                  <QrCode className="h-20 w-20 text-[#0d0c08]" />
                  <p className="mt-1 text-[8px] font-bold text-[#0d0c08]/50 uppercase tracking-wider">
                    Bilhete QR
                  </p>
                </div>
                {/* Detalhes */}
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                      Código de Entrada
                    </p>
                    <p className="mt-1 font-mono text-base font-black tracking-wider text-white">
                      {ticket.code}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(ticket.code!, "code")}
                      className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/50 transition hover:bg-[#d4a017]/10 hover:text-[#d4a017]"
                    >
                      {copied === "code" ? (
                        <><CheckCircle2 className="h-3 w-3 text-[#1a6b2f]" /> Copiado</>
                      ) : (
                        <><Copy className="h-3 w-3" /> Copiar código</>
                      )}
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-lg bg-[#1a6b2f]/10 px-3 py-1.5 text-xs font-medium text-[#1a6b2f] ring-1 ring-[#1a6b2f]/20 transition hover:bg-[#1a6b2f]/20"
                    >
                      <Download className="h-3 w-3" /> Descarregar PDF
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-white/25 flex items-center gap-1.5">
                <BadgeCheck className="h-3 w-3 text-[#1a6b2f]" />
                Bilhete verificado · Apresenta o QR na entrada do evento
              </p>
            </div>
          )}

          {/* ── MULTIBANCO PENDENTE ── */}
          {ticket.status === "PENDING_MULTIBANCO" && ticket.paymentDetails && (
            <div className="space-y-3">
              <p className="text-xs text-white/40">
                Efectua o pagamento na caixa ATM ou no teu Homebanking com os dados abaixo.
              </p>

              <div className="overflow-hidden rounded-xl ring-1 ring-[#d4a017]/20">
                <div className="h-0.5 bg-gradient-to-r from-[#1a6b2f] via-[#d4a017] to-[#c41e3a]" />
                <div className="space-y-px bg-[#111009] p-1">
                  {[
                    { label: "Entidade", value: ticket.paymentDetails.entity!, key: "entity" },
                    { label: "Referência", value: formatReference(ticket.paymentDetails.reference!), key: "ref" },
                    { label: "Valor", value: `${ticket.paymentDetails.amount}€`, key: "amount", noCopy: true },
                  ].map(({ label, value, key, noCopy }) => (
                    <div key={key} className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">{label}</p>
                        <p className="mt-0.5 font-mono text-sm font-black text-white">{value}</p>
                      </div>
                      {!noCopy && (
                        <button
                          type="button"
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          onClick={() => copyToClipboard((ticket.paymentDetails as any)![key === "ref" ? "reference" : (key)]!, key)}
                          className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-[10px] font-medium text-white/40 transition hover:bg-[#d4a017]/10 hover:text-[#d4a017]"
                        >
                          {copied === key ? (
                            <CheckCircle2 className="h-3 w-3 text-[#1a6b2f]" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {ticket.paymentDetails.expiresAt && (
                <p className="flex items-center gap-1.5 text-xs text-white/30">
                  <Clock className="h-3 w-3" />
                  Referência válida até{" "}
                  <span className="font-semibold text-amber-500/60">{ticket.paymentDetails.expiresAt}</span>
                </p>
              )}
            </div>
          )}

          {/* ── MB WAY PENDENTE ── */}
          {ticket.status === "PENDING_MBWAY" && ticket.paymentDetails && (
            <div className="space-y-3">
              {mbwayStatus === "paid" ? (
                <div className="flex items-center gap-3 rounded-xl bg-[#1a6b2f]/10 p-4 ring-1 ring-[#1a6b2f]/20">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1a6b2f]" />
                  <p className="text-sm font-semibold text-white/80">
                    Pagamento confirmado! Actualiza a página para ver o teu bilhete.
                  </p>
                </div>
              ) : mbwayStatus === "error" ? (
                <div className="flex items-center gap-3 rounded-xl bg-[#c41e3a]/10 p-4 ring-1 ring-[#c41e3a]/20">
                  <AlertCircle className="h-5 w-5 shrink-0 text-[#c41e3a]" />
                  <p className="text-sm text-white/60">
                    Pagamento recusado ou cancelado. Podes tentar novamente.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-[#c41e3a]/5 p-4 ring-1 ring-[#c41e3a]/15">
                  <Smartphone className="h-5 w-5 shrink-0 animate-pulse text-[#c41e3a]" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white/80">
                      Notificação enviada para{" "}
                      <span className="text-white">{ticket.paymentDetails.phone}</span>
                    </p>
                    <p className="text-xs text-white/40">
                      Abre a App MB WAY e autoriza o pagamento de{" "}
                      <span className="font-bold text-[#d4a017]">{formatPrice(ticket.price)}</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={checkMbwayStatus}
                  disabled={checkingMbway || mbwayStatus !== "pending"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.03] py-2.5 text-xs font-semibold text-white/50 ring-1 ring-white/[0.06] transition hover:text-white disabled:opacity-40"
                >
                  {checkingMbway ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Verificar estado
                </button>
              </div>
            </div>
          )}

          {/* ── Link para ver evento ── */}
          <div className="mt-4 flex items-center justify-end">
            <Link
              href={`/eventos/${ticket.eventId}`}
              className="flex items-center gap-1 text-[11px] text-white/20 transition hover:text-[#d4a017]/60"
            >
              Ver evento <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const [tickets, setTickets] = useState<UserTicket[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Declaras la función fuera con useCallback para que la use el botón y el useEffect
  const loadTickets = useCallback(async () => {
    try {
      // TODO: Integración real con Supabase
      // const { data, error } = await supabase.from('orders').select('*');
      // if (error) throw error;

      // Simulación de retraso de red
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setTickets(MOCK_USER_TICKETS);
    } catch (err) {
      setError("Não foi possível carregar os teus bilhetes. Por favor, tenta novamente.");
    } finally {
      setLoading(false);
    }
  }, []); // Array vacío porque no depende de ninguna variable externa que cambie

  // 2. El useEffect del montaje inicial
  useEffect(() => {
    // Apagamos los estados de carga/error aquí de forma segura
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    loadTickets();
  }, [loadTickets]); // loadTickets es una dependencia segura gracias a useCallback

  // 3. El botón ahora puede reutilizar la función perfectamente
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    loadTickets();
  };

  const paid = tickets?.filter((t) => t.status === "PAID") ?? [];
  const pending = tickets?.filter((t) => t.status.startsWith("PENDING")) ?? [];
  const other = tickets?.filter((t) => ["CANCELLED", "EXPIRED"].includes(t.status)) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header da área pessoal */}
      <div className="mb-8 flex flex-col gap-4 border-b border-white/[0.05] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-4 w-1 rounded-full bg-[#c41e3a]" />
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">
              Área Pessoal
            </p>
          </div>
          <h1 className="text-2xl font-black uppercase text-white">A minha conta</h1>
          <p className="mt-1 text-sm text-white/40">
            Gerencia os teus bilhetes e pagamentos pendentes.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-[#111009] p-3 ring-1 ring-white/[0.05]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4a017]/10 text-sm font-black text-[#d4a017]">
            U
          </div>
          <div>
            <p className="text-sm font-bold text-white">Utilizador Traiados</p>
            <p className="text-xs text-white/35">user@traiados.pt</p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/[0.04] bg-white/[0.01]">
          <Loader2 className="h-7 w-7 animate-spin text-[#d4a017] mb-3" />
          <p className="text-sm text-white/40">A carregar os teus bilhetes...</p>
        </div>
      )}

      {/* Erro */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-[#c41e3a]/15 bg-[#c41e3a]/[0.02]">
          <AlertCircle className="h-8 w-8 text-[#c41e3a] mb-3" />
          <h3 className="text-base font-bold text-white">Erro de conexão</h3>
          <p className="mt-1 text-sm text-white/40 max-w-sm text-center">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-5 flex items-center gap-2 rounded-xl bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-white/60 ring-1 ring-white/[0.06] transition hover:text-white"
          >
            <RefreshCw className="h-4 w-4" /> Tentar novamente
          </button>
        </div>
      )}

      {/* Conteúdo */}
      {!loading && !error && (
        <div className="space-y-10">

          {/* ── Pagamentos pendentes ── */}
          {pending.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-3">
                <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/50">
                  Aguarda Pagamento · {pending.length}
                </h2>
              </div>
              <div className="space-y-3">
                {pending.map((t) => <TicketCard key={t.id} ticket={t} />)}
              </div>
            </section>
          )}

          {/* ── Bilhetes confirmados ── */}
          {paid.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#1a6b2f]" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/50">
                  Bilhetes Confirmados · {paid.length}
                </h2>
              </div>
              <div className="space-y-3">
                {paid.map((t) => <TicketCard key={t.id} ticket={t} />)}
              </div>
            </section>
          )}

          {/* ── Sem bilhetes ── */}
          {tickets && tickets.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center rounded-2xl border border-dashed border-white/[0.06]">
              <Ticket className="h-10 w-10 text-white/10 mb-4" />
              <h3 className="text-base font-bold text-white/60">Nenhum bilhete ainda</h3>
              <p className="mt-1 text-sm text-white/30 max-w-xs">
                Ainda não compraste bilhetes. Explora os nossos eventos!
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#c41e3a] px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-red-900/30 transition hover:bg-[#a01830]"
              >
                Explorar Eventos
              </Link>
            </div>
          )}

          {/* ── Outros (cancelados/expirados) ── */}
          {other.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-white/20">
                  Histórico · {other.length}
                </h2>
              </div>
              <div className="space-y-3 opacity-50">
                {other.map((t) => <TicketCard key={t.id} ticket={t} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}