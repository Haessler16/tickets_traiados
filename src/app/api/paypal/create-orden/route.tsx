/**
 * app/api/paypal/create-order/route.ts
 *
 * Crea una Order de PayPal en el servidor y devuelve el orderID al cliente.
 * El cliente luego abre el popup/redirección de PayPal con ese ID.
 *
 * Variables de entorno necesarias en .env.local:
 *   PAYPAL_CLIENT_ID      → App Client ID de tu app en developer.paypal.com
 *   PAYPAL_CLIENT_SECRET  → Secret de tu app de PayPal
 *   PAYPAL_BASE_URL       → https://api-m.sandbox.paypal.com  (sandbox)
 *                           https://api-m.paypal.com          (producción)
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Helper: obtener access token de PayPal ───────────────────────────────────
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const base = process.env.PAYPAL_BASE_URL ?? "https://api-m.sandbox.paypal.com";

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

// ─── POST /api/paypal/create-order ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "EUR", orderId, eventTitle, ticketName } = body as {
      amount: number;
      currency?: string;
      orderId: string;
      eventTitle: string;
      ticketName: string;
    };

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();
    const base = process.env.PAYPAL_BASE_URL ?? "https://api-m.sandbox.paypal.com";

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: orderId,
          description: `${eventTitle} — ${ticketName}`,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
      // Puedes añadir application_context para personalizar la experiencia
      application_context: {
        brand_name: eventTitle,
        locale: "pt-PT",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
      },
    };

    const res = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `${orderId}-${Date.now()}`, // idempotency key
      },
      body: JSON.stringify(orderPayload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`PayPal create-order failed: ${err}`);
    }

    const data = await res.json();

    return NextResponse.json({ orderID: data.id });
  } catch (error) {
    console.error("[paypal/create-order]", error);
    return NextResponse.json(
      { error: "Não foi possível criar a ordem de pagamento" },
      { status: 500 }
    );
  }
}