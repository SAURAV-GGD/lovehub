import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validators";
import { stripe, PLAN_PRICING } from "@/lib/payments";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return apiError("Please sign in to proceed with checkout", "UNAUTHORIZED", 401);
    }

    const body = await request.json();
    const validated = checkoutSchema.parse(body);

    const planConfig = PLAN_PRICING[validated.plan as keyof typeof PLAN_PRICING];
    if (!planConfig) {
      return apiError("Invalid plan selected", "BAD_REQUEST", 400);
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: session.user.email,
      line_items: [
        {
          price_data: {
            currency: planConfig.currency,
            product_data: {
              name: planConfig.name,
              description: `Upgrade your proposal with ${planConfig.name} on LoveHub`,
            },
            unit_amount: planConfig.amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        plan: validated.plan,
        proposalId: validated.proposalId || "",
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });

    return apiSuccess({ url: checkoutSession.url });
  } catch (err) {
    return handleApiError(err);
  }
}
