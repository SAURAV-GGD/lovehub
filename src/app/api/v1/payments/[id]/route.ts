import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/orders";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = id.replace(/^yp_/, "");
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({
      paymentId: `yp_${order.id}`,
      orderId: order.id,
      amount: (order.amountPaise / 100).toFixed(2),
      currency: order.currency,
      status: order.status === "paid" ? "SUCCESS" : "INITIATED",
      utr: order.utr || undefined,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
