/**
 * app/checkout/page.tsx
 * * Versión integrada con Zustand para admitir la compra de múltiples tipos de billetes
 * y desplegar el resumen expandible respetando tu diseño premium.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Ticket, ChevronDown, ChevronUp } from "lucide-react";
import { CheckoutClient } from "./CheckoutClient";
import { useCartStore } from "@/store/useCartStore"; // Importa tu tienda de Zustand

// Datos estáticos del evento principal para el encabezado del checkout
const EVENT_INFO = {
  id: "b0000000-0000-4000-8000-000000000001",
  title: "NOITE SERTANEJA",
  location: "Club Panorâmico",
  city: "Lisboa",
};

export default function CheckoutPage() {
  const router = useRouter();

  // Consumimos el estado global de tu carrito en Zustand
  const { items, getTotalPrice, getTotalItems } = useCartStore();

  // Estado local para controlar el expandible de los detalles de los tickets
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  const cartList = Object.values(items);
  const totalAmount = getTotalPrice();
  const totalQuantity = getTotalItems();

  // Redirección preventiva si el usuario entra directo al checkout sin billetes
  useEffect(() => {
    if (totalQuantity === 0) {
      router.push("/");
    }
  }, [totalQuantity, router]);

  if (totalQuantity === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-gray-500 font-medium">O teu carrinho está vazio...</p>
        <Link href="/" className="mt-4 inline-block text-xs font-black uppercase tracking-widest text-[#f2ba13] hover:underline">
          Voltar à página inicial
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#0b0a08] font-sans antialiased pb-24">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Botão Voltar */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Alterar bilhetes
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* COLUMNA IZQUIERDA: Formulario e Integración Pasarela Ifthenpay */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl shadow-gray-200/50 sm:p-8">
              <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-1">
                Pagamento
              </h1>
              <p className="text-xs text-gray-400 font-medium mb-6">
                Por favor seleciona o método de pagamento pretendido.
              </p>

              {/* Pasarela inyectando los valores reactivos acumulados */}
              <CheckoutClient
                orderId="RESERVA-MULTIPLE"
                eventTitle={EVENT_INFO.title}
                ticketName={`${totalQuantity} Bilhetes Selecionados`}
                amount={totalAmount}
                quantity={totalQuantity}
              />
            </div>
          </div>

          {/* COLUMNA DERECHA: Resumen de compra estilizado con el menú expandible */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl shadow-gray-200/60 sm:p-6">

              {/* Bloque encabezado del Evento */}
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#0b0a08] p-1 text-center font-black">
                  <span className="text-2xl font-black text-white leading-none">28</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Jun</span>
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase text-gray-900 leading-tight">
                    {EVENT_INFO.title}
                  </h2>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                    {EVENT_INFO.location} · {EVENT_INFO.city}
                  </p>
                </div>
              </div>

              {/* ── SECCIÓN COMPONENTE EXPANDIBLE DE TICKETS (Igual a la imagen) ── */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                  className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors py-2 group"
                >
                  <span className="flex items-center gap-1.5">
                    <Ticket className="h-4 w-4 text-gray-400 group-hover:text-[#da251d] transition-colors" />
                    Ver detalhes dos bilhetes ({totalQuantity})
                  </span>
                  {isDetailsExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>

                {/* Lista colapsable con animación suave */}
                {isDetailsExpanded && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-2xl space-y-2 border border-gray-100/80 animate-in fade-in duration-200">
                    {cartList.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <span className="text-gray-600 font-medium">
                          <strong className="text-gray-900 font-black mr-1">x{item.quantity}</strong> {item.name}
                        </span>
                        <span className="font-bold text-gray-900 shrink-0">
                          €{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gastos de gestión estándar */}
              <div className="flex items-center justify-between text-xs font-medium text-gray-400 pb-4 border-b border-gray-100">
                <span>Gastos de gestão</span>
                <span className="font-bold text-gray-600">€0.00</span>
              </div>

              {/* Sección de Total General */}
              <div className="flex items-center justify-between pt-4 mb-4">
                <span className="text-sm font-black uppercase tracking-wider text-gray-800">Total</span>
                <span className="text-2xl font-black text-[#f2ba13]">
                  €{totalAmount.toFixed(2)}
                </span>
              </div>

              {/* Insignia de seguridad oficial */}
              <div className="flex items-start gap-2 rounded-xl bg-[#009c3b]/5 p-3 text-[11px] font-bold text-[#009c3b] ring-1 ring-[#009c3b]/10">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                Garantia de transação 100% segura através da criptografia da Paypal.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}