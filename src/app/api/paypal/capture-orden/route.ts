/**
 * app/api/paypal/capture-order/route.ts
 *
 * Captura el pago de una Order de PayPal ya aprobada por el usuario.
 * El cliente llama a este endpoint con el orderID después de que el usuario
 * aprueba el pago en el popup de PayPal.
 *
 * Variables de entorno necesarias en .env.local:
 *   PAYPAL_CLIENT_ID
 *   PAYPAL_CLIENT_SECRET
 *   PAYPAL_BASE_URL
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

// ─── POST /api/paypal/capture-order ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderID } = body as { orderID: string };

    if (!orderID) {
      return NextResponse.json({ error: "orderID requerido" }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();
    const base = process.env.PAYPAL_BASE_URL ?? "https://api-m.sandbox.paypal.com";

    const res = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`PayPal capture failed: ${err}`);
    }

    const data = await res.json();

    // Verifica que la captura fue completada
    const captureStatus = data.status; // "COMPLETED" si todo ok
    const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    const capturedAmount = data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;

    if (captureStatus !== "COMPLETED") {
      return NextResponse.json(
        { error: `Estado inesperado del pago: ${captureStatus}` },
        { status: 422 }
      );
    }

    // ── Aquí puedes añadir tu lógica de negocio: ─────────────────────────────
    // - Guardar la transacción en tu base de datos
    // - Generar los billetes / QR codes
    // - Enviar el email de confirmación al comprador
    // - Actualizar el stock de entradas disponibles
    // ─────────────────────────────────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      orderID,
      captureId,
      capturedAmount,
      status: captureStatus,
    });
  } catch (error) {
    console.error("[paypal/capture-order]", error);
    return NextResponse.json(
      { error: "Não foi possível confirmar o pagamento" },
      { status: 500 }
    );
  }
}