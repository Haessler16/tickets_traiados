"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CreditCard,
  Smartphone,
  Copy,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Clock,
  AlertCircle,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type PaymentMethod = "multibanco" | "mbway" | null;

type CheckoutStep =
  | "select"        // escolher método
  | "mbway_phone"   // inserir telemóvel
  | "mbway_waiting" // aguardar notificação push
  | "multibanco_ref" // mostrar referência multibanco
  | "success"
  | "error";

interface MultibancoData {
  entity: string;
  reference: string;
  transactionId?: string;
  expiresAt?: string;
  amount: string;
}

interface MbwayData {
  transactionId: string;
  expiresAt: string;
  mobileNumber: string;
  amount: string;
}

interface CheckoutClientProps {
  orderId: string;
  eventTitle: string;
  ticketName: string;
  amount: number; // em euros
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const MBWAY_TIMEOUT_SECONDS = 4 * 60; // 4 minutos

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

function formatReference(ref: string) {
  // Formata "123456789" → "123 456 789"
  return ref.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function CheckoutClient({
  orderId,
  eventTitle,
  ticketName,
  amount,
}: CheckoutClientProps) {
  const [step, setStep] = useState<CheckoutStep>("select");
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MB WAY
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [mbwayData, setMbwayData] = useState<MbwayData | null>(null);
  const [countdown, setCountdown] = useState(MBWAY_TIMEOUT_SECONDS);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Multibanco
  const [multibancoData, setMultibancoData] = useState<MultibancoData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // ── Funções de pagamento ──────────────────────────────────────────────────

  async function initMultibanco() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "multibanco",
          orderId,
          amount: amount.toFixed(2),
          ticketName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar referência.");

      setMultibancoData({
        entity: data.entity,
        reference: data.reference,
        transactionId: data.transactionId,
        expiresAt: data.expiresAt,
        amount: data.amount,
      });
      setStep("multibanco_ref");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao gerar referência Multibanco.");
    } finally {
      setLoading(false);
    }
  }

  function validatePhone(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 9) return "Insere um número de telemóvel válido (9 dígitos).";
    if (!digits.startsWith("9") && digits.length === 9)
      return "Número português deve começar por 9.";
    return null;
  }

  async function initMbway() {
    const err = validatePhone(phone);
    if (err) {
      setPhoneError(err);
      return;
    }
    setPhoneError(null);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "mbway",
          orderId,
          amount: amount.toFixed(2),
          ticketName,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar pedido MB WAY.");

      setMbwayData({
        transactionId: data.transactionId,
        expiresAt: data.expiresAt,
        mobileNumber: phone,
        amount: data.amount,
      });
      setStep("mbway_waiting");
      startMbwayPolling(data.transactionId);
      startCountdown();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar pedido MB WAY.");
    } finally {
      setLoading(false);
    }
  }

  function startCountdown() {
    setCountdown(MBWAY_TIMEOUT_SECONDS);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function startMbwayPolling(transactionId: string) {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status?transactionId=${transactionId}`);
        const data = await res.json();

        if (data.isPaid) {
          clearInterval(pollingRef.current!);
          clearInterval(countdownRef.current!);
          setStep("success");
        } else if (data.isCancelled || data.isError) {
          clearInterval(pollingRef.current!);
          clearInterval(countdownRef.current!);
          setError(
            data.isCancelled
              ? "Pagamento cancelado na App MB WAY."
              : `Pagamento recusado: ${data.message}`
          );
          setStep("error");
        }
        // Se isPending, continua o polling
      } catch {
        // Erro de rede transiente — ignora e tenta novamente
      }
    }, 3000); // polling a cada 3 segundos
  }

  async function resendMbway() {
    if (!mbwayData) return;
    clearInterval(countdownRef.current!);
    clearInterval(pollingRef.current!);
    await initMbway();
  }

  function copyToClipboard(value: string, key: string) {
    navigator.clipboard.writeText(value.replace(/\s/g, ""));
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const countdownMin = Math.floor(countdown / 60);
  const countdownSec = countdown % 60;
  const isExpired = countdown === 0;

  return (
    <div className="mx-auto max-w-lg">
      {/* Cabeçalho do pedido */}
      <div className="mb-6 rounded-xl bg-[#111009] p-4 ring-1 ring-white/[0.06]">
        <p className="text-xs font-bold uppercase tracking-widest text-[#d4a017]/60">
          A comprar
        </p>
        <h2 className="mt-1 text-base font-bold text-white">{eventTitle}</h2>
        <p className="mt-0.5 text-sm text-white/50">{ticketName}</p>
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
          <span className="text-xs text-white/40">Total</span>
          <span className="text-xl font-black text-[#d4a017]">{formatPrice(amount)}</span>
        </div>
      </div>

      {/* ── STEP: Seleção de método ── */}
      {step === "select" && (
        <div className="space-y-3">
          <p className="mb-4 text-sm font-semibold text-white/60">
            Escolhe o método de pagamento
          </p>

          {/* Multibanco */}
          <button
            type="button"
            onClick={() => {
              setMethod("multibanco");
              initMultibanco();
            }}
            disabled={loading}
            className="group flex w-full items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111009] p-5 text-left transition hover:border-[#d4a017]/30 hover:bg-[#161410] disabled:opacity-50"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-950/40 ring-1 ring-amber-800/20">
              <CreditCard className="h-6 w-6 text-[#d4a017]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">Multibanco</p>
              <p className="text-xs text-white/40">
                Paga numa caixa ATM ou no teu Homebanking. Referência válida por 3 dias.
              </p>
            </div>
            {loading && method === "multibanco" ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-white/30" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-white/20 transition group-hover:text-[#d4a017]/50" />
            )}
          </button>

          {/* MB WAY */}
          <button
            type="button"
            onClick={() => {
              setMethod("mbway");
              setStep("mbway_phone");
            }}
            disabled={loading}
            className="group flex w-full items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111009] p-5 text-left transition hover:border-[#c41e3a]/30 hover:bg-[#161010] disabled:opacity-50"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-950/40 ring-1 ring-red-900/20">
              <Smartphone className="h-6 w-6 text-[#c41e3a]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">MB WAY</p>
              <p className="text-xs text-white/40">
                Autoriza o pagamento directamente na App MB WAY. Rápido e seguro.
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-white/20 transition group-hover:text-[#c41e3a]/50" />
          </button>

          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-red-950/20 p-4 ring-1 ring-red-900/30">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#c41e3a]" />
              <p className="text-sm text-white/70">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* ── STEP: Número MB WAY ── */}
      {step === "mbway_phone" && (
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => { setStep("select"); setMethod(null); setError(null); }}
            className="flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white/70"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </button>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/40">
              Número de Telemóvel
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#111009] px-4 py-3 focus-within:border-[#c41e3a]/40 transition">
              <span className="shrink-0 text-sm font-bold text-white/40">🇵🇹 +351</span>
              <div className="h-4 w-px bg-white/10" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneError(null);
                }}
                placeholder="912 345 678"
                maxLength={13}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none"
              />
            </div>
            {phoneError && (
              <p className="mt-1.5 text-xs text-[#c41e3a]">{phoneError}</p>
            )}
            <p className="mt-2 text-xs text-white/30">
              Deves ter o MB WAY instalado e associado a este número.
            </p>
          </div>

          <button
            type="button"
            onClick={initMbway}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c41e3a] py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-red-900/30 transition hover:bg-[#a01830] disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> A enviar notificação...</>
            ) : (
              <><Smartphone className="h-4 w-4" /> Pagar com MB WAY</>
            )}
          </button>

          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-red-950/20 p-4 ring-1 ring-red-900/30">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#c41e3a]" />
              <p className="text-sm text-white/70">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* ── STEP: Aguardar MB WAY ── */}
      {step === "mbway_waiting" && mbwayData && (
        <div className="space-y-5">
          {/* Anel de countdown animado */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className={cn(
              "relative flex h-20 w-20 items-center justify-center rounded-full ring-4 transition-colors",
              isExpired ? "ring-white/10" : countdown < 30 ? "ring-[#c41e3a]/50" : "ring-[#d4a017]/40"
            )}>
              <Smartphone className={cn(
                "h-8 w-8 transition-colors",
                isExpired ? "text-white/20" : "text-[#c41e3a]"
              )} />
              {!isExpired && (
                <div className="absolute -bottom-2 rounded-full bg-[#0d0c08] px-2 py-0.5 text-xs font-black tabular-nums text-[#d4a017]">
                  {countdownMin}:{countdownSec.toString().padStart(2, "0")}
                </div>
              )}
            </div>

            {isExpired ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-white/60">Tempo expirado</p>
                <p className="text-xs text-white/30">Podes reenviar a notificação.</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold text-white">
                  Abre o MB WAY no teu telemóvel
                </p>
                <p className="text-xs text-white/40">
                  Enviámos um pedido de pagamento para{" "}
                  <span className="font-bold text-white/70">{mbwayData.mobileNumber}</span>
                </p>
              </div>
            )}
          </div>

          {/* Detalhe */}
          <div className="rounded-xl bg-[#111009] p-4 ring-1 ring-white/[0.06] space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">Valor</span>
              <span className="font-black text-[#d4a017]">{formatPrice(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Número</span>
              <span className="text-white/80">{mbwayData.mobileNumber}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/30">Referência interna</span>
              <span className="font-mono text-white/40">{orderId}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resendMbway}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-[#111009] py-3 text-xs font-semibold text-white/60 transition hover:text-white disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reenviar notificação
            </button>
            <button
              type="button"
              onClick={() => { setStep("select"); setMethod(null); clearInterval(pollingRef.current!); clearInterval(countdownRef.current!); }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-[#111009] py-3 text-xs font-semibold text-white/60 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Outro método
            </button>
          </div>

          <p className="text-center text-xs text-white/20">
            A verificar o estado do pagamento automaticamente...
          </p>
        </div>
      )}

      {/* ── STEP: Referência Multibanco ── */}
      {step === "multibanco_ref" && multibancoData && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-[#d4a017]">
            <CreditCard className="h-4 w-4" />
            <span className="font-bold">Referência gerada com sucesso</span>
          </div>

          {/* Bloco de dados bancários */}
          <div className="overflow-hidden rounded-2xl ring-1 ring-[#d4a017]/20">
            {/* Linha gradiente Brasil+Portugal */}
            <div className="h-1 bg-gradient-to-r from-[#1a6b2f] via-[#d4a017] to-[#c41e3a]" />
            <div className="space-y-px bg-[#111009] p-1">
              {/* Entidade */}
              <div className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                    Entidade
                  </p>
                  <p className="mt-0.5 font-mono text-lg font-black text-white">
                    {multibancoData.entity}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(multibancoData.entity, "entity")}
                  className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/50 transition hover:bg-[#d4a017]/10 hover:text-[#d4a017]"
                >
                  {copied === "entity" ? (
                    <><CheckCircle2 className="h-3.5 w-3.5 text-[#1a6b2f]" /> Copiado</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" /> Copiar</>
                  )}
                </button>
              </div>

              {/* Referência */}
              <div className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                    Referência
                  </p>
                  <p className="mt-0.5 font-mono text-lg font-black tracking-wider text-white">
                    {formatReference(multibancoData.reference)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(multibancoData.reference, "reference")}
                  className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/50 transition hover:bg-[#d4a017]/10 hover:text-[#d4a017]"
                >
                  {copied === "reference" ? (
                    <><CheckCircle2 className="h-3.5 w-3.5 text-[#1a6b2f]" /> Copiado</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" /> Copiar</>
                  )}
                </button>
              </div>

              {/* Valor */}
              <div className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                    Valor
                  </p>
                  <p className="mt-0.5 font-mono text-lg font-black text-[#d4a017]">
                    {formatPrice(amount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instruções */}
          <div className="rounded-xl bg-amber-950/10 p-4 ring-1 ring-amber-900/20">
            <p className="text-xs font-bold uppercase tracking-wider text-[#d4a017]/70 mb-2">
              Como pagar
            </p>
            <ol className="space-y-1 text-xs text-white/50 list-decimal list-inside">
              <li>Acede ao teu Homebanking ou dirije-te a uma caixa ATM.</li>
              <li>Escolhe &quot;Pagamentos e Transferências&quot; → &quot;Referência Multibanco&quot;.</li>
              <li>Introduz a Entidade, a Referência e o Valor exacto acima.</li>
              <li>Confirma — receberás um email de confirmação em breve.</li>
            </ol>
            {multibancoData.expiresAt && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-white/30">
                <Clock className="h-3 w-3" />
                Referência válida até{" "}
                <span className="font-semibold text-white/50">{multibancoData.expiresAt}</span>
              </p>
            )}
          </div>

          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/[0.03] py-3 text-sm font-medium text-white/50 ring-1 ring-white/[0.06] transition hover:text-white"
          >
            Ver os meus bilhetes
          </Link>
        </div>
      )}

      {/* ── STEP: Sucesso ── */}
      {step === "success" && (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1a6b2f]/20 ring-2 ring-[#1a6b2f]/40">
            <CheckCircle2 className="h-8 w-8 text-[#1a6b2f]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Pagamento confirmado!</h3>
            <p className="mt-1 text-sm text-white/50">
              O teu bilhete foi emitido. Podes consultá-lo na tua área pessoal.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="mt-2 flex items-center gap-2 rounded-2xl bg-[#1a6b2f] px-8 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-green-900/30 transition hover:bg-green-700"
          >
            Ver os meus bilhetes
          </Link>
        </div>
      )}

      {/* ── STEP: Erro ── */}
      {step === "error" && (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-950/30 ring-2 ring-[#c41e3a]/40">
            <XCircle className="h-8 w-8 text-[#c41e3a]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Pagamento não concluído</h3>
            <p className="mt-1 text-sm text-white/50">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => { setStep("select"); setMethod(null); setError(null); }}
            className="mt-2 flex items-center gap-2 rounded-2xl bg-[#111009] px-8 py-3 text-sm font-bold text-white/70 ring-1 ring-white/[0.06] transition hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      )}

      {/* Nota de segurança */}
      {(step === "select" || step === "mbway_phone") && (
        <p className="mt-6 text-center text-[10px] text-white/20">
          Pagamento processado de forma segura por{" "}
          <span className="font-semibold text-[#d4a017]/40">Ifthenpay Portugal</span>
        </p>
      )}
    </div>
  );
}