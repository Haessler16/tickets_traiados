/**
 * POST /api/payment
 *
 * Inicia um pagamento via Ifthenpay (Multibanco ou MB WAY).
 * Corre no servidor para que as chaves nunca fiquem expostas no cliente.
 *
 * Body esperado:
 * {
 *   method: "multibanco" | "mbway",
 *   orderId: string,       // ex: "order_abc123"
 *   amount: string,        // ex: "75.00"
 *   ticketName: string,    // para descrição
 *   phone?: string,        // obrigatório para MB WAY, formato "351#912345678"
 *   email?: string,        // opcional para MB WAY
 * }
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Tipos de resposta Ifthenpay ──────────────────────────────────────────────

interface MultibancoResult {
  entity: string;
  reference: string;
  transactionId?: string;
  expiresAt?: string;
  amount: string;
  orderId: string;
}

interface MbwayResult {
  transactionId: string;
  expiresAt: string;
  amount: string;
  orderId: string;
  mobileNumber: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getIfthenpayClient() {
  // Usa o authToken único do backoffice Ifthenpay → Management > Integrations
  const authToken = process.env.IFTHENPAY_AUTH_TOKEN;
  if (!authToken) {
    throw new Error("IFTHENPAY_AUTH_TOKEN não configurado nas variáveis de ambiente.");
  }
  return authToken;
}

async function createMultibancoPayment(
  authToken: string,
  orderId: string,
  amount: string
): Promise<MultibancoResult> {
  // Endpoint REST da API Ifthenpay (Multibanco dinâmico)
  // Documentação: https://www.ifthenpay.com/docs/en/api/multibanco/
  const mbKey = process.env.IFTHENPAY_MB_KEY; // ex: "ABC-000000"
  if (!mbKey) throw new Error("IFTHENPAY_MB_KEY não configurado.");

  const res = await fetch("https://api.ifthenpay.com/multibanco/reference/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      mbKey,
      orderId,
      amount,
      // expiryDays: 3,  // opcional: dias de validade da referência
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ifthenpay Multibanco error ${res.status}: ${err}`);
  }

  const data = await res.json();

  // Resposta esperada: { Entity, Reference, RequestId, ExpiryDate, Status, Message }
  if (data.Status !== "0") {
    throw new Error(`Ifthenpay Multibanco falhou: ${data.Message}`);
  }

  return {
    entity: data.Entity,
    reference: data.Reference,
    transactionId: data.RequestId ?? undefined,
    expiresAt: data.ExpiryDate ?? undefined,
    amount,
    orderId,
  };
}

async function createMbwayPayment(
  authToken: string,
  orderId: string,
  amount: string,
  mobileNumber: string,
  email?: string
): Promise<MbwayResult> {
  // Endpoint REST da API Ifthenpay (MB WAY v2)
  // Documentação: https://www.ifthenpay.com/docs/en/api/mbway/
  const mbwayKey = process.env.IFTHENPAY_MBWAY_KEY; // ex: "ITP-000000"
  if (!mbwayKey) throw new Error("IFTHENPAY_MBWAY_KEY não configurado.");

  const res = await fetch("https://api.ifthenpay.com/mbway/set/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      mbWayKey: mbwayKey,
      orderId,
      amount,
      mobileNumber, // formato: "351#912345678"
      email: email ?? "",
      description: `Traiados Portugal — ${orderId}`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ifthenpay MB WAY error ${res.status}: ${err}`);
  }

  const data = await res.json();

  // Resposta esperada: { TransactionID, Amount, MobileNumber, Status, Message, ExpiryDate }
  if (data.Status !== "000") {
    throw new Error(`Ifthenpay MB WAY falhou (${data.Status}): ${data.Message}`);
  }

  return {
    transactionId: data.TransactionID,
    expiresAt: data.ExpiryDate,
    amount,
    orderId,
    mobileNumber,
  };
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { method, orderId, amount, phone, email } = body as {
      method: "multibanco" | "mbway";
      orderId: string;
      amount: string;
      ticketName?: string;
      phone?: string;
      email?: string;
    };

    // Validações básicas
    if (!method || !orderId || !amount) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios em falta: method, orderId, amount." },
        { status: 400 }
      );
    }

    if (method === "mbway" && !phone) {
      return NextResponse.json(
        { error: "O número de telemóvel é obrigatório para MB WAY." },
        { status: 400 }
      );
    }

    const authToken = getIfthenpayClient();

    if (method === "multibanco") {
      const result = await createMultibancoPayment(authToken, orderId, amount);
      return NextResponse.json({ method: "multibanco", ...result });
    }

    if (method === "mbway") {
      // Garante formato "351#XXXXXXXXX" — remove espaços e adiciona prefixo se necessário
      const normalizedPhone = phone!.includes("#")
        ? phone!.replace(/\s/g, "")
        : `351#${phone!.replace(/\s/g, "")}`;

      const result = await createMbwayPayment(
        authToken,
        orderId,
        amount,
        normalizedPhone,
        email
      );
      return NextResponse.json({ method: "mbway", ...result });
    }

    return NextResponse.json({ error: "Método de pagamento inválido." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido.";
    console.error("[/api/payment] Erro:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}