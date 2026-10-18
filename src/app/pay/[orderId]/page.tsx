import { notFound, redirect } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { getPlanConfig } from "@/lib/plans";
import { generateUPIQR, buildIntentLinks } from "upipay";
import { UpiCheckoutPortal } from "@/components/checkout/upi-portal";

interface PageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function PayPage({ params }: PageProps) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  if (order.status === "paid") {
    redirect(`/checkout/callback?orderId=${encodeURIComponent(orderId)}`);
  }

  const plan = getPlanConfig(order.planId);
  const vpa = process.env.UPI_VPA || "paytm.s1kx5cu@pty";
  const merchantName = process.env.UPI_MERCHANT_NAME || "Lovehub By Saurav";

  // Generate NPCI fixed-amount QR code using upipay
  const qr = await generateUPIQR({
    vpa,
    name: merchantName,
    amount: plan.priceInRupees,
    orderId: order.id,
    note: `Payment for LoveHub ${plan.name}`,
    mode: "fixed",
  });

  const links = buildIntentLinks(qr.upiUri);

  return (
    <UpiCheckoutPortal
      orderId={order.id}
      proposalId={order.proposalId}
      planId={plan.id}
      planName={plan.name}
      amountRupees={plan.priceInRupees}
      vpa={vpa}
      merchantName={merchantName}
      qrImage={qr.qrImage}
      upiUri={qr.upiUri}
      links={links}
    />
  );
}
