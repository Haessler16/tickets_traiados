"use client";

/**
 * CheckoutClient.tsx — Integración real con PayPal JS SDK
 *
 * Dependencias a instalar:
 *   npm install @paypal/react-paypal-js
 *
 * Variables de entorno necesarias en .env.local:
 *   NEXT_PUBLIC_PAYPAL_CLIENT_ID  → Client ID público (va al navegador)
 *   PAYPAL_CLIENT_SECRET          → Solo en servidor
 *   PAYPAL_BASE_URL               → https://api-m.sandbox.paypal.com (sandbox)
 */

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Lock, AlertCircle } from "lucide-react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
  // DISPATCH_ACTION,
} from "@paypal/react-paypal-js";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

type CheckoutStep = "select" | "processing" | "success" | "error";

export interface CheckoutClientProps {
  orderId: string;
  eventTitle: string;
  ticketName: string;
  amount: number;   // en euros, ej: 45.00
  quantity: number;
}

// ─── Sub-componente interno: botones de PayPal con estado de carga ─────────────

interface PayPalButtonsWrapperProps {
  amount: number;
  orderId: string;
  eventTitle: string;
  ticketName: string;
  onProcessing: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

function PayPalButtonsWrapper({
  amount,
  orderId,
  eventTitle,
  ticketName,
  onProcessing,
  onSuccess,
  onError,
}: PayPalButtonsWrapperProps) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isRejected) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 ring-1 ring-red-100">
        <AlertCircle className="h-4 w-4 shrink-0" />
        Não foi possível carregar o PayPal. Verifica a tua ligação e recarrega a página.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Skeleton mientras carga el SDK */}
      {isPending && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-[#ffc439]/10 py-4 text-xs font-bold text-[#003087]/60">
          <Loader2 className="h-4 w-4 animate-spin" />
          A carregar PayPal...
        </div>
      )}

      {/* Botones oficiales de PayPal — renderizados por el SDK */}
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "gold",      // botón amarillo oficial
          shape: "rect",
          label: "pay",
          height: 48,
          tagline: false,
        }}
        disabled={isPending}
        fundingSource={undefined} // muestra todos los métodos disponibles (PayPal + tarjeta)
        // ── 1. Crear la Order en el servidor ────────────────────────────────
        createOrder={async () => {
          const res = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount,
              currency: "EUR",
              orderId,
              eventTitle,
              ticketName,
            }),
          });

          if (!res.ok) {
            throw new Error("Falha ao criar a ordem PayPal");
          }

          const data = await res.json();
          return data.orderID as string; // PayPal SDK espera el ID como string
        }}
        // ── 2. El usuario aprueba en el popup → capturamos en el servidor ──
        onApprove={async (data) => {
          onProcessing(); // muestra spinner

          const res = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: data.orderID }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            onError(errData.error ?? "Erro ao confirmar o pagamento");
            return;
          }

          const result = await res.json();
          if (result.success) {
            onSuccess();
          } else {
            onError("O pagamento não pôde ser confirmado. Contacta o suporte.");
          }
        }}
        // ── 3. El usuario cancela el popup de PayPal ─────────────────────
        onCancel={() => {
          // No cambiamos de step, el usuario simplemente cerró el popup.
          // Los botones vuelven a ser visibles automáticamente.
          console.info("PayPal: usuário cancelou o pagamento");
        }}
        // ── 4. Error en el SDK (red, config incorrecta, etc.) ────────────
        onError={(err) => {
          console.error("PayPal SDK error:", err);
          onError(
            "Ocorreu um problema com o PayPal. Verifica os teus dados e tenta novamente."
          );
        }}
      />
    </div>
  );
}

// ─── Componente principal exportado ────────────────────────────────────────────

export function CheckoutClient({
  orderId,
  eventTitle,
  ticketName,
  amount,
  quantity,
}: CheckoutClientProps) {
  const [step, setStep] = useState<CheckoutStep>("select");
  const [error, setError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

  const handleError = (msg: string) => {
    setError(msg);
    setStep("error");
  };

  return (
    <div className="space-y-6">

      {/* ── STEP: Selección / Botones PayPal ── */}
      {step === "select" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
            <p className="text-xs text-gray-500 font-medium mb-4 text-center">
              Ao clicar em <strong>PayPal</strong>, serás redirecionado com segurança para concluir a tua transação.
            </p>

            {/* El SDK de PayPal necesita el Provider con el clientId */}
            {!clientId ? (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-700 ring-1 ring-amber-100">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Chave PayPal não configurada. Adiciona <code className="font-mono">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> no .env.local
              </div>
            ) : (
              <PayPalScriptProvider
                options={{
                  clientId,
                  currency: "EUR",
                  locale: "pt_PT",
                  intent: "capture",
                  components: "buttons",
                }}
              >
                <PayPalButtonsWrapper
                  amount={amount}
                  orderId={orderId}
                  eventTitle={eventTitle}
                  ticketName={ticketName}
                  onProcessing={() => setStep("processing")}
                  onSuccess={() => setStep("success")}
                  onError={handleError}
                />
              </PayPalScriptProvider>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-gray-400">
            <Lock className="h-3 w-3" /> Transação encriptada com proteção ao comprador PayPal
          </div>
        </div>
      )}

      {/* ── STEP: Procesando (capturando en servidor) ── */}
      {step === "processing" && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#f2ba13]" />
          <div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
              A confirmar o teu pagamento
            </h3>
            <p className="mt-1 text-xs text-gray-400 font-medium">
              Estamos a validar a transação com o PayPal. Não feches esta janela.
            </p>
          </div>
        </div>
      )}

      {/* ── STEP: Éxito ── */}
      {step === "success" && (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#009c3b]/10 ring-4 ring-[#009c3b]/5">
            <CheckCircle2 className="h-7 w-7 text-[#009c3b]" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">
              Compra concluída com sucesso!
            </h3>
            <p className="mt-1 text-xs text-gray-500 font-medium px-4">
              Obrigado pela tua compra. Os teus <strong>{quantity}</strong> bilhetes para{" "}
              <strong>{eventTitle}</strong> foram gerados e enviados para o teu e-mail.
            </p>
          </div>
          <div className="w-full pt-4">
            <Link
              href="/"
              className="inline-flex w-full justify-center rounded-xl bg-[#0b0a08] hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-widest py-3.5 transition shadow-lg"
            >
              Ver os meus bilhetes
            </Link>
          </div>
        </div>
      )}

      {/* ── STEP: Error ── */}
      {step === "error" && (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#da251d]/10 ring-4 ring-[#da251d]/5">
            <XCircle className="h-7 w-7 text-[#da251d]" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">
              Pagamento não concluído
            </h3>
            <p className="mt-1 text-xs text-gray-500 font-medium px-4">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => { setStep("select"); setError(null); }}
            className="mt-2 inline-flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 transition"
          >
            Tentar novamente
          </button>
        </div>
      )}

    </div>
  );
}