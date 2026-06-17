# Plataforma de Eventos

Plataforma fullstack de bilhetes para eventos em Portugal, construída com Next.js 14+ e Supabase.

## Stack

- **Next.js 16** (App Router, TypeScript, Server Components)
- **Tailwind CSS 4**
- **Supabase** (PostgreSQL + Auth)
- **Ifthenpay** (Multibanco + MB WAY) — integração pendiente
- **lucide-react**, **qrcode.react**

## Início rápido

```bash
npm install
cp .env.local.example .env.local
# Editar .env.local com credenciais Supabase
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Sem Supabase configurado, a app usa dados mock.

## Supabase

1. Cria um projeto em [supabase.com](https://supabase.com)
2. Executa as migrações no SQL Editor (por ordem):
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql` (opcional, dados de exemplo)
3. Copia URL e anon key para `.env.local`

### Tablas

| Tabla          | Descripción                           |
| -------------- | ------------------------------------- |
| `profiles`     | Perfiles sincronizados con auth.users |
| `organizers`   | Organizadores de eventos              |
| `events`       | Eventos publicados                    |
| `ticket_types` | Tipos de entrada por evento           |
| `orders`       | Órdenes de compra                     |
| `user_tickets` | Entradas emitidas con QR              |

RLS activado: lectura pública de eventos; usuarios solo ven sus órdenes y entradas.

## Estructura

```
src/
├── app/                  # Páginas y rutas
├── components/           # UI reutilizable
├── lib/
│   ├── supabase/         # Clientes browser/server
│   ├── events.ts         # Capa de datos
│   └── constants.ts
├── types/database.ts     # Tipos TypeScript
supabase/migrations/      # SQL schema + seed
```

## Próximos pasos

- [ ] Autenticación (login/registro Supabase)
- [ ] Checkout con Ifthenpay (Multibanco + MB WAY)
- [ ] Webhook de confirmación de pago
- [ ] Área "Mis entradas" con QR
- [ ] Panel de organizador
