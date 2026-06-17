import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-white">{APP_NAME}</p>
            <p className="mt-2 text-sm text-white/50">
              A tua plataforma de bilhetes para os melhores eventos em Portugal.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Explorar</p>
            <ul className="mt-3 space-y-2 text-sm text-white/50">
              <li>Eventos</li>
              <li>Música</li>
              <li>Cultura</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Suporte</p>
            <ul className="mt-3 space-y-2 text-sm text-white/50">
              <li>Centro de Ajuda</li>
              <li>Termos e Condições</li>
              <li>Privacidade</li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/30">
          © {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
