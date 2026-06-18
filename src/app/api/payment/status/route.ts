/**
 * GET /api/payment/status?transactionId=xxx
 *
 * Verifica o estado de um pagamento MB WAY.
 * Chamado pelo cliente em polling (a cada ~3s) enquanto aguarda confirmação.
 *
 * Códigos de estado Ifthenpay MB WAY:
 * "000" → Pago com sucesso
 * "020" → Cancelado pelo utilizador
 * "048" → Cancelado pelo Merchant
 * "100" → Não foi possível concluir
 * "122" / "125" → Recusado ao utilizador
 * Outros → Pendente / Processamento
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const transactionId = req.nextUrl.searchParams.get("transactionId");

  if (!transactionId) {
    return NextResponse.json({ error: "transactionId é obrigatório." }, { status: 400 });
  }

  const authToken = process.env.IFTHENPAY_AUTH_TOKEN;
  const mbwayKey = process.env.IFTHENPAY_MBWAY_KEY;

  if (!authToken || !mbwayKey) {
    return NextResponse.json({ error: "Configuração do servidor em falta." }, { status: 500 });
  }

  try {
    // Endpoint de estado MB WAY v2
    // https://www.ifthenpay.com/docs/en/api/mbway/
    const res = await fetch(
      `https://api.ifthenpay.com/mbway/getStatus?mbWayKey=${mbwayKey}&transactionId=${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        // Não cachear — queremos sempre o estado mais recente
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ifthenpay status error ${res.status}: ${err}`);
    }

    const data = await res.json();

    // Normaliza para um formato simples consumível pelo frontend
    return NextResponse.json({
      transactionId,
      statusCode: data.Status,
      message: data.Message ?? "",
      isPaid: data.Status === "000",
      isCancelled: ["020", "048"].includes(data.Status),
      isError: ["100", "104", "111", "113", "122", "123", "125"].includes(data.Status),
      isPending: !["000", "020", "048", "100", "104", "111", "113", "122", "123", "125"].includes(
        data.Status
      ),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido.";
    console.error("[/api/payment/status] Erro:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}