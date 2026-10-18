import { NextRequest, NextResponse } from "next/server";
import { createOrderRecord } from "@/lib/orders";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const orderId = body.orderId || `lh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const amountNum = parseFloat(body.amount || "31.00");
    const amountPaise = Math.round(amountNum * 100);

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://www.lovehub.in";

    const checkoutUrl = `${origin}/pay/${encodeURIComponent(orderId)}`;

    const order = await createOrderRecord({
      id: orderId,
      planId: body.metadata?.planId || "starter",
      amountPaise,
      currency: body.currency || "INR",
      status: "pending",
      checkoutUrl,
      paymentId: `yp_${orderId}`,
    });

    return NextResponse.json({
      paymentId: `yp_${order.id}`,
      orderId: order.id,
      amount: (amountPaise / 100).toFixed(2),
      currency: "INR",
      status: "INITIATED",
      checkoutUrl,
      metadata: body.metadata || {},
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
