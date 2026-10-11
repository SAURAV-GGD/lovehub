import { describe, it, expect } from "vitest";
import { generateUPIQR, buildIntentLinks } from "upipay";

describe("UPIPay Integration", () => {
  it("should generate a valid fixed-amount NPCI UPI QR code", async () => {
    const qr = await generateUPIQR({
      vpa: "lovehub@upi",
      name: "LoveHub",
      amount: 69,
      orderId: "order_test_123",
      note: "LoveHub Romantic Plan",
      mode: "fixed",
    });

    expect(qr).toBeDefined();
    expect(qr.qrImage).toMatch(/^data:image\/png;base64,/);
    expect(qr.upiUri).toContain("pa=lovehub%40upi");
    expect(qr.upiUri).toContain("am=69.00");
    expect(qr.upiUri).toContain("mode=04"); // mode=04 is fixed locked amount
  });

  it("should generate proper deep links for PhonePe, GPay, Paytm, and BHIM", async () => {
    const qr = await generateUPIQR({
      vpa: "lovehub@upi",
      name: "LoveHub",
      amount: 169,
      orderId: "order_test_456",
      mode: "fixed",
    });

    const links = buildIntentLinks(qr.upiUri);
    expect(links.phonepe).toMatch(/^phonepe:\/\/pay\?/);
    expect(links.gpay).toMatch(/^tez:\/\/upi\/pay\?/);
    expect(links.paytm).toMatch(/^paytmmp:\/\/pay\?/);
    expect(links.bhim).toMatch(/^upi:\/\/pay\?/);
  });
});
