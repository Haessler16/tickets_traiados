"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Ticket,
  Clock,
  CheckCircle2,
  Copy,
  Smartphone,
  CreditCard,
  ExternalLink,
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";

// Mock data base de billetes comprados o pendientes
const MOCK_USER_TICKETS = [
  {
    id: "order_01",
    eventTitle: "Festival NOS Alive 2026",
    city: "Lisboa",
    date: "09 Jul 2026",
    ticketName: "Passe Geral 3 Dias",
    status: "PAID",
    price: 189.0,
    code: "TR-9832-ALIVE",
  },
  {
    id: "order_02",
    eventTitle: "Grande Rodeio Sertanejo",
    city: "Porto",
    date: "14 Ago 2026",
    ticketName: "Bilhete VIP Fan Zone",
    status: "PENDING_MULTIBANCO",
    price: 75.0,
    paymentDetails: {
      entity: "24422",
      reference: "123 456 789",
      amount: "75.00",
      expiresAt: "24h",
    },
  },
  {
    id: "order_03",
    eventTitle: "Serralves em Festa",
    city: "Porto",
    date: "28 Jun 2026",
    ticketName: "Entrada Diária",
    status: "PENDING_MBWAY",
    price: 15.0,
    paymentDetails: {
      phone: "912 345 678",
    },
  },
];

export default function DashboardPage() {
  // Inicializamos como undefined para simular el comportamiento real antes de la petición externa
  const [tickets, setTickets] = useState<typeof MOCK_USER_TICKETS | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        setError(null);

        // TODO: Integración real con Supabase
        // const { data, error } = await supabase.from('orders').select('*');
        // if (error) throw error;

        // Simulamos un retraso de red para ver el estado de carga
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // Cambiar por data si se conecta con Supabase. De momento forzamos la carga del mock.
        setTickets(MOCK_USER_TICKETS);
      } catch (err) {
        setError("Não foi possível carregar os teus bilhetes. Por favor, tenta novamente.");
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ""));
    alert("Copiado para a área de transferência!");
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Simulación de reintento de carga
    setTimeout(() => {
      setTickets(MOCK_USER_TICKETS);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Perfil Header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">A minha Área</h1>
          <p className="mt-1 text-sm text-white/50">
            Gerencia os teus bilhetes e acompanha o estado dos teus pagamentos.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/5">
          <div className="h-10 w-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-bold">
            U
          </div>
          <div>
            <p className="text-sm font-medium text-white">Utilizador Traiados</p>
            <p className="text-xs text-white/40">user@traiados.pt</p>
          </div>
        </div>
      </div>

      {/* 1. ESTADO DE CARGA (LOADING) */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/5 bg-white/[0.01]">
          <Loader2 className="h-8 w-8 text-brand-gold animate-spin mb-4" />
          <p className="text-sm text-white/60">A carregar os teus bilhetes...</p>
        </div>
      )}

      {/* 2. ESTADO DE ERROR */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-brand-red/20 bg-brand-red/[0.02]">
          <AlertCircle className="h-10 w-10 text-brand-red mb-4" />
          <h3 className="text-lg font-semibold text-white">Erro de conexão</h3>
          <p className="mt-2 text-sm text-white/50 max-w-md">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-6 flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/10 hover:bg-white/10 transition"
          >
            <RefreshCw className="h-4 w-4" /> Tentar novamente
          </button>
        </div>
      )}

      {/* FLUJO PRINCIPAL DE CONTENIDO */}
      {!loading && !error && (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Listado de Entradas */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Ticket className="h-5 w-5 text-brand-gold" />
              Os Meus Bilhetes / Encomendas
            </h2>

            {/* 3. ESTADO DE TICKET NO ENCONTRADO O VACÍO (UNDEFINED / EMPTY ARRAY) */}
            {!tickets || tickets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 py-16 px-4 text-center">
                <Ticket className="mx-auto h-10 w-10 text-white/20 mb-4" />
                <h3 className="text-base font-semibold text-white">Nenhum bilhete encontrado</h3>
                <p className="mt-2 text-sm text-white/40 max-w-xs mx-auto">
                  Ainda não compraste bilhetes para nenhum evento. Explora a nossa página inicial!
                </p>
                <div className="mt-6">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-xl bg-brand-red py-2.5 px-5 text-sm font-semibold text-white transition hover:bg-red-700 shadow-md shadow-brand-red/10"
                  >
                    Explorar Eventos
                  </Link>
                </div>
              </div>
            ) : (
              /* Renderizado de la lista si contiene datos válidos */
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] transition hover:bg-white/[0.02]"
                >
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/40">{ticket.date} • {ticket.city}</span>
                        {ticket.status === "PAID" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-2.5 py-0.5 text-xs font-medium text-brand-green">
                            <CheckCircle2 className="h-3 w-3" /> Confirmado
                          </span>
                        )}
                        {(ticket.status === "PENDING_MULTIBANCO" || ticket.status === "PENDING_MBWAY") && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-500 animate-pulse">
                            <Clock className="h-3 w-3" /> Aguarda Pagamento
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white">{ticket.eventTitle}</h3>
                      <p className="text-sm text-white/60">{ticket.ticketName}</p>
                    </div>

                    <div className="sm:text-right flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-2">
                      <span className="text-xs text-white/40">Total pago</span>
                      <span className="text-lg font-bold text-brand-gold">
                        {ticket.price.toFixed(2)}€
                      </span>
                    </div>
                  </div>

                  {/* Detalles de Pago Multibanco */}
                  {ticket && ticket.status === "PENDING_MULTIBANCO" && ticket.paymentDetails && (
                    <div className="border-t border-white/5 bg-amber-950/10 p-5 sm:px-6">
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.02] p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-amber-500 mb-3">
                          <CreditCard className="h-4 w-4" />
                          Pagamento por Multibanco (Ifthenpay API)
                        </div>
                        <p className="text-xs text-white/60 mb-4">
                          Utiliza os dados abaixo no teu Homebanking ou numa caixa ATM dentro de {ticket.paymentDetails.expiresAt}.
                        </p>
                        <section className="grid gap-2 max-w-xs font-mono text-sm">
                          {ticket.paymentDetails.entity && (<div className="flex justify-between items-center bg-black/40 p-2 rounded-lg">
                            <span className="text-white/40 text-xs uppercase">Entidade:</span>
                            <div className="flex items-center gap-2 font-bold text-white">
                              <span>{ticket.paymentDetails.entity}</span>
                              <button onClick={() => copyToClipboard(ticket.paymentDetails!.entity!)} className="text-white/40 hover:text-brand-gold"><Copy className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>)}
                          {ticket.paymentDetails!.reference && <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg">
                            <span className="text-white/40 text-xs uppercase">Referência:</span>
                            <div className="flex items-center gap-2 font-bold text-white">
                              <span>{ticket.paymentDetails.reference}</span>
                              <button onClick={() => copyToClipboard(ticket.paymentDetails!.reference!)} className="text-white/40 hover:text-brand-gold"><Copy className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>}
                        </section>
                      </div>
                    </div>
                  )}

                  {/* Detalles de Pago MB WAY */}
                  {ticket.status === "PENDING_MBWAY" && ticket.paymentDetails && (
                    <div className="border-t border-white/5 bg-brand-red/5 p-5 sm:px-6">
                      <div className="rounded-xl border border-brand-red/20 bg-brand-red/[0.02] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-semibold text-brand-red">
                            <Smartphone className="h-4 w-4" />
                            Notificação Push MB WAY enviada
                          </div>
                          <p className="text-xs text-white/60">
                            Enviamos um pedido de autorização para o número <span className="text-white font-semibold">{ticket.paymentDetails.phone}</span>.
                          </p>
                        </div>
                        <button
                          onClick={() => alert("Mockup: Efetuando chamada para a API Ifthenpay...")}
                          className="shrink-0 rounded-xl bg-white/5 px-4 py-2 text-xs font-medium text-white ring-1 ring-white/10 hover:bg-white/10 transition"
                        >
                          Verificar Estado
                        </button>
                      </div>
                    </div>
                  )}

                  {ticket.status === "PAID" && (
                    <div className="border-t border-white/5 bg-white/[0.01] p-4 px-5 sm:px-6 flex items-center justify-between text-xs text-white/40">
                      <span>Código de Entrada: <span className="font-mono text-white/70 font-semibold">{ticket.code}</span></span>
                      <button className="text-brand-gold hover:underline flex items-center gap-1">
                        Descarregar PDF <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Sidebar Informativa */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
              <h3 className="font-semibold text-white text-sm">Informação de Suporte</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Os pagamentos via <span className="text-white font-medium">MB WAY</span> expiram em 5 minutos.
              </p>
              <p className="text-xs text-white/60 leading-relaxed">
                As referências de <span className="text-white font-medium">Multibanco</span> podem demorar até 5-10 minutos a serem processadas pelo teu banco.
              </p>
              <div className="border-t border-white/5 pt-3">
                <span className="text-[10px] text-white/30 block">Gateway de Pagamento Seguro por</span>
                <span className="text-xs text-brand-gold font-semibold tracking-wider uppercase">Ifthenpay Portugal</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}