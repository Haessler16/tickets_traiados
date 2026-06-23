"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // 1. Importamos useRouter para la navegación
import { useForm } from "react-hook-form";
import {
  Calendar,
  MapPin,
  Clock,
  // ShieldCheck,
  Ticket,
  Users,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  Star,
  // ArrowRight,
  X,
} from "lucide-react";
import { EVENT, TICKETS } from "@/lib/mock-data";
import { useCartStore } from "@/store/useCartStore";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReservationFormData {
  phoneCode: string;
  phone: string;
  fullName: string;
  email: string;
  birthDate: string;
  marketingConsent: boolean;
}


// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number | null): string {
  if (price === null) return "Consultar";
  if (price === 0) return "Gratuito";
  return `€${price % 1 === 0 ? price : price.toFixed(2)}`;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function BadgePill({ label, color }: { label: string; color?: "gold" | "green" | "red" }) {
  const styles = {
    gold: "bg-[#f2ba13]/10 text-[#e0aa00] ring-[#f2ba13]/20",
    green: "bg-[#009c3b]/10 text-[#009c3b] ring-[#009c3b]/20",
    red: "bg-[#da251d]/10 text-[#da251d] ring-[#da251d]/20",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ring-1", color ? styles[color] : styles.gold)}>
      {label}
    </span>
  );
}

export default function EventLanding() {
  const router = useRouter(); // Initialize router
  // const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [expandedTickets, setExpandedTickets] = useState<Record<string, boolean>>({});
  const { items, updateQuantity, setUserInfo, getTotalItems } = useCartStore();

  // Estados para el Modal de Reserva
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    reset,
  } = useForm<ReservationFormData>({
    defaultValues: {
      phoneCode: "+351",
      phone: "",
      fullName: "",
      email: "",
      birthDate: "",
      marketingConsent: false,
    },
  });

  const handleQtyChange = (
    id: string,
    name: string,
    price: number | null,
    delta: number,
    max: number
  ) => {
    // 1. Buscamos la cantidad actual que tiene este ticket en Zustand
    const currentQty = items[id]?.quantity || 0;

    // 2. Calculamos la nueva cantidad limitándola entre 0 y el stock disponible (max)
    const nextQty = Math.min(max, Math.max(0, currentQty + delta));

    // 3. Enviamos la actualización directamente a la tienda de Zustand
    // Si el precio es null (por ejemplo si es gratuito o a consultar), enviamos 0
    updateQuantity(id, nextQty, name, price || 0);
  };

  const toggleExpand = (id: string) => {
    setExpandedTickets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // const totalTicketsSelected = Object.values(items).reduce((a, b) => a + b, 0);
  const totalTicketsSelected = getTotalItems() ?? 0;

  // Manejo de avance de paso con validación parcial preventiva
  const handleNextStep = async () => {
    const isPhoneValid = await trigger(["phone", "phoneCode"]);
    if (isPhoneValid) {
      setModalStep(2);
    }
  };

  // Envío final del Formulario y Redirección Conectada
  const onFormSubmit = (data: ReservationFormData) => {
    setUserInfo(data);

    setIsModalOpen(false);
    setModalStep(1);
    reset();

    // Redirigimos sin parámetros pesados en la URL, todo viaja seguro en Zustand
    router.push(`/checkout`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalStep(1);
  };

  return (
    <div className="min-h-screen bg-white text-[#0b0a08] font-sans antialiased pb-40">

      {/* ── Hero / Banner Principal ── */}
      <div className="relative h-72 sm:h-96 lg:h-[500px] overflow-hidden w-full bg-gray-100">
        <Image
          src={EVENT.imageUrl}
          alt={EVENT.title}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent" />
      </div>

      {/* ── Cuerpo de la Página ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid gap-6 lg:gap-10 lg:grid-cols-[1fr_450px]">

          {/* COLUMNA IZQUIERDA */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xl sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full bg-[#da251d]/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-[#da251d] ring-1 ring-[#da251d]/20">
                    Abertura de Temporada
                  </span>
                  <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#0b0a08] sm:text-4xl lg:text-5xl leading-none">
                    {EVENT.title}
                  </h1>
                  <p className="mt-1 text-base font-semibold text-[#e0aa00]">{EVENT.subtitle}</p>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border border-gray-200 bg-white shadow-inner flex items-center justify-center font-bold text-xs text-gray-400">
                    YÀ
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Organizador</p>
                    <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                      {EVENT.organizer}
                      <BadgeCheck className="h-3.5 w-3.5 text-[#009c3b] fill-[#009c3b]/10" />
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: <Calendar className="h-5 w-5 text-[#da251d]" />, label: "Data", value: EVENT.date, sub: `Abertura: ${EVENT.doors}` },
                { icon: <Clock className="h-5 w-5 text-[#da251d]" />, label: "Início", value: EVENT.time, sub: EVENT.ageRestriction },
                { icon: <MapPin className="h-5 w-5 text-[#da251d]" />, label: "Local", value: EVENT.location, sub: EVENT.city },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">{item.icon}</div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{item.label}</p>
                    <p className="mt-0.5 text-sm font-bold text-gray-800">{item.value}</p>
                    <p className="text-[11px] text-gray-500 font-medium">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/30 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-[#f2ba13] fill-[#f2ba13]" />
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Line Up / Artistas</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {EVENT.artists.map((a) => (
                  <span key={a} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm border border-gray-100">{a}</span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/30 p-5 sm:p-6">
              <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-gray-400">Sobre o evento</h2>
              <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line font-medium">{EVENT.description}</p>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <div className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-2xl ring-1 ring-black/[0.02] sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-black uppercase text-gray-800">
                    <Ticket className="h-5 w-5 text-[#da251d]" /> Bilhetes
                  </h2>
                  <p className="mt-0.5 text-[11px] text-gray-400 font-medium">Selecione as suas entradas para este evento.</p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-600">
                  <Users className="h-3 w-3" /> {TICKETS.reduce((s, t) => s + t.available, 0)} vagas
                </div>
              </div>

              <div className="space-y-4">
                {TICKETS.map((ticket) => {
                  const qty = items[ticket.id]?.quantity || 0;;
                  const isExpanded = expandedTickets[ticket.id] || false;
                  const soldOut = ticket.available <= 0;

                  return (
                    <div key={ticket.id} className={cn("rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition-all", qty > 0 && "border-gray-300 bg-gray-50 shadow-sm", soldOut && "opacity-50 grayscale select-none")}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {ticket.badge && <BadgePill label={ticket.badge} color={ticket.badgeColor} />}
                          </div>
                          <p className="font-bold text-gray-800 text-sm leading-snug">{ticket.name}</p>
                          <p className="text-[11px] text-gray-400 font-bold mt-0.5">{formatPrice(ticket.price)}</p>
                        </div>

                        <div className="flex items-center gap-3 bg-white border border-gray-200/80 rounded-xl p-1 shadow-sm shrink-0">
                          <button onClick={() => handleQtyChange(ticket.id, ticket.name, ticket.price, -1, ticket.available)} disabled={qty === 0 || soldOut} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 bg-gray-50 font-bold hover:bg-gray-100 transition disabled:opacity-20">−</button>
                          <span className="min-w-[1rem] text-center text-xs font-black text-gray-800">{qty}</span>
                          <button onClick={() => handleQtyChange(ticket.id, ticket.name, ticket.price, 1, ticket.available)} disabled={soldOut} className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0b0a08] text-white font-bold hover:bg-gray-800 transition disabled:opacity-20">+</button>
                        </div>
                      </div>

                      <button onClick={() => toggleExpand(ticket.id)} className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors">
                        {isExpanded ? <><ChevronUp className="h-3 w-3" /> Ocultar descrição</> : <><ChevronDown className="h-3 w-3" /> Ver descripción</>}
                      </button>

                      {isExpanded && <p className="mt-2 text-xs leading-relaxed text-gray-500 font-medium border-t border-gray-200/60 pt-2">{ticket.description}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── BARRA FIJA INFERIOR GLOBAL ── */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] p-4 z-40 flex justify-center">
        <div className="w-full max-w-7xl flex items-center justify-end px-2 sm:px-4">
          <button
            disabled={totalTicketsSelected === 0}
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "w-full sm:w-80 font-black text-xs uppercase tracking-widest py-4 rounded-xl text-center transition-all shadow-lg text-white",
              totalTicketsSelected > 0 ? "bg-[#0b0a08] hover:bg-gray-800 active:scale-[0.99] shadow-black/10" : "bg-gray-200 cursor-not-allowed shadow-none text-gray-400"
            )}
          >
            {totalTicketsSelected > 0 ? `Selecionar bilhetes (${totalTicketsSelected})` : "Selecionar bilhetes"}
          </button>
        </div>
      </div>

      {/* ── MODAL DE RESERVA (MULTI-STEP CONTROLLER) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">

            {/* Botón cerrar */}
            <button onClick={closeModal} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-50">
              <X className="h-5 w-5" />
            </button>

            {/* Logo de cabecera idéntico al diseño */}
            <div className="flex justify-center mb-4 mt-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0b0a08] text-white font-black text-xl tracking-tight shadow-md">
                <Image
                  src={EVENT.logoUrl}
                  alt={EVENT.title}
                  height={56}
                  width={56}
                  priority
                  className="object-cover object-center"

                />
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Reservar bilhetes</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {modalStep === 1
                  ? "Reserva os bilhetes com o número de telemóvel"
                  : "Completa a tua informação para garantir a reserva. Podes enviar os bilhetes mais tarde."}
              </p>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">

              {/* PASO 1: TELEMÓVEL */}
              {modalStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Telemóvel <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      {/* Selector de código de país */}
                      <select
                        {...register("phoneCode", { required: true })}
                        className="w-28 px-3 py-3 rounded-xl border border-gray-200 text-sm font-semibold bg-gray-50 focus:border-gray-900 focus:bg-white outline-none transition"
                      >
                        <option value="+351">🇵🇹 +351</option>
                        <option value="+55">🇧🇷 +55</option>
                        <option value="+34">🇪🇸 +34</option>
                      </select>

                      {/* Input de número */}
                      <input
                        type="tel"
                        placeholder="912 345 678"
                        {...register("phone", {
                          required: "O número de telemóvel é obrigatório",
                          pattern: {
                            value: /^[0-9\s-]{9,15}$/,
                            message: "Número de telemóvel inválido"
                          }
                        })}
                        className={cn(
                          "flex-1 px-4 py-3 rounded-xl border text-sm font-medium focus:border-gray-900 outline-none transition",
                          errors.phone ? "border-red-500 bg-red-50/30" : "border-gray-200"
                        )}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-500 font-semibold mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full bg-[#0b0a08] hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition shadow-md mt-2"
                  >
                    Continuar
                  </button>
                </div>
              )}

              {/* PASO 2: DATOS PERSONALES */}
              {modalStep === 2 && (
                <div className="space-y-4 animate-fade-in">

                  {/* Nombre Completo */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Nome e apelido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nome e apelido"
                      {...register("fullName", { required: "O nome completo é obrigatório" })}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border text-sm font-medium focus:border-gray-900 outline-none transition",
                        errors.fullName ? "border-red-500 bg-red-50/30" : "border-gray-200"
                      )}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-500 font-semibold mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      E-mail <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="E-mail"
                      {...register("email", {
                        required: "O e-mail é obrigatório",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Endereço de e-mail inválido"
                        }
                      })}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border text-sm font-medium focus:border-gray-900 outline-none transition",
                        errors.email ? "border-red-500 bg-red-50/30" : "border-gray-200"
                      )}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 font-semibold mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Fecha de Nacimiento (Validación mayor de 18 años) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Data de nascimento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register("birthDate", {
                        required: "A data de nascimento é obrigatória",
                        validate: (value) => {
                          const birth = new Date(value);
                          const today = new Date();
                          let age = today.getFullYear() - birth.getFullYear();
                          const m = today.getMonth() - birth.getMonth();
                          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                            age--;
                          }
                          return age >= 18 || "Deves ser maior de 18 anos para ir a este evento.";
                        }
                      })}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border text-sm font-medium focus:border-gray-900 outline-none transition text-gray-700",
                        errors.birthDate ? "border-red-500 bg-red-50/30" : "border-gray-200"
                      )}
                    />
                    {errors.birthDate && (
                      <p className="text-xs text-red-500 font-semibold mt-1">{errors.birthDate.message}</p>
                    )}
                  </div>

                  {/* Checkbox de consentimiento */}
                  {/* <div className="flex items-start gap-3 pt-1">
                    <input
                      type="checkbox"
                      id="marketingConsent"
                      {...register("marketingConsent")}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    <label htmlFor="marketingConsent" className="text-xs text-gray-500 font-medium leading-tight">
                      Quero receber convites e promoções da 3cket <span className="text-gray-400 hover:underline cursor-pointer">Saber mais</span>
                    </label>
                  </div> */}

                  <p className="text-[10px] text-gray-400 font-medium pt-2 leading-relaxed">
                    Ao prosseguir, são aceites os <span className="text-gray-600 underline cursor-pointer">Termos e Condições</span> e a <span className="text-gray-600 underline cursor-pointer">Política de privacidade</span> da 3cket.
                  </p>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="w-1/3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#0b0a08] hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition shadow-md shadow-black/5"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

    </div>
  );
}