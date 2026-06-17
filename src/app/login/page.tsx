"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, ArrowRight, CircleUser } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Integración con Supabase Auth
    // const supabase = createClient();
    // if (isSignUp) {
    //   await supabase.auth.signUp({ email, password })
    // } else {
    //   await supabase.auth.signInWithPassword({ email, password })
    // }

    setTimeout(() => {
      setLoading(false);
      alert("Mockup: Autenticação simulada com sucesso! Redirecionando...");
      window.location.href = "/dashboard";
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    // TODO: Supabase OAuth Google
    // await supabase.auth.signInWithOAuth({ provider: 'google' })
    alert("Mockup: Iniciando fluxo OAuth com Google via Supabase");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl">
        {/* Logo e Cabeçalho */}
        <div className="flex flex-col items-center text-center">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl shadow-lg shadow-brand-red/10">
            <Image
              src="/traidos.jpg"
              alt="Traiados Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">
            {isSignUp ? "Criar nova conta" : "Entrar na tua conta"}
          </h2>
          <p className="mt-2 text-sm text-white/50">
            {isSignUp ? "Já tens conta? " : "Novo por aqui? "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-brand-gold hover:underline"
            >
              {isSignUp ? "Inicia sessão" : "Regista-te grátis"}
            </button>
          </p>
        </div>

        {/* Formulário */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Endereço de Email
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-11 text-sm text-white placeholder-white/30 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  placeholder="O teu email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Palavra-passe
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-11 text-sm text-white placeholder-white/30 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  placeholder="A tua palavra-passe"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-white/10 bg-white/5 text-brand-gold focus:ring-brand-gold"
              />
              <label htmlFor="remember-me" className="ml-2 block text-white/60">
                Lembrar-me neste dispositivo
              </label>
            </div>

            {!isSignUp && (
              <Link href="#" className="font-medium text-white/40 hover:text-brand-gold">
                Esqueceste-te da palavra-passe?
              </Link>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-brand-red py-3 px-4 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none disabled:opacity-50 shadow-md shadow-brand-red/10"
            >
              {loading ? "A processar..." : isSignUp ? "Criar Conta" : "Entrar"}
              {!loading && <ArrowRight className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </form>

        {/* Divisor */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute w-full border-t border-white/5"></div>
          <span className="relative bg-[#0a0a0a] px-3 text-xs text-white/40 uppercase tracking-wider">
            Ou continua com
          </span>
        </div>

        {/* Botão OAuth */}
        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <CircleUser className="h-5 w-5" />
          Google
        </button>
      </div>
    </div>
  );
}