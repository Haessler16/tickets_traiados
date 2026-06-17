import Link from "next/link";
import { Ticket, User } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0d0c0a]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          {/* Icono adaptado al rojo de la marca */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red shadow-md shadow-brand-red/20">
            <Ticket className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Traiados <span className="text-brand-gold">Portugal</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-white/70 transition hover:text-brand-gold"
          >
            Eventos
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-white/70 transition hover:text-brand-gold"
          >
            Categorias
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-brand-gold hover:text-brand-gold sm:inline-flex"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white transition hover:bg-brand-gold/20 hover:text-brand-gold"
            aria-label="Conta"
          >
            <User className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}