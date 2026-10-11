import { NextRequest } from "next/server";
import { generateUPIQR, buildIntentLinks } from "upipay";
import { checkoutSchema } from "@/lib/validators";
import { PLAN_PRICING } from "@/lib/payments";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const validated = checkoutSchema.parse(body);

    const planConfig = PLAN_PRICING[validated.plan as keyof typeof PLAN_PRICING];
    if (!planConfig) {
      return apiError("Invalid plan selected", "BAD_REQUEST", 400);
    }

    const vpa = process.env.UPI_VPA || "lovehub@upi";
    const merchantName = process.env.UPI_MERCHANT_NAME || "LoveHub";
    const orderId = `lh_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    // Generate NPCI-compliant fixed-amount QR code
    // mode: 'fixed' enforces locked amount in UPI apps
    const qr = await generateUPIQR({
      vpa,
      name: merchantName,
      amount: planConfig.amount,
      orderId,
      note: `Payment for LoveHub ${planConfig.name}`,
      mode: "fixed",
    });

    const links = buildIntentLinks(qr.upiUri);

    return apiSuccess({
      orderId,
      vpa,
      merchantName,
      amount: planConfig.amount,
      plan: validated.plan,
      planName: planConfig.name,
      qrImage: qr.qrImage,
      upiUri: qr.upiUri,
      links,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
