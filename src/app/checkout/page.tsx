"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, Check, ArrowLeft, CreditCard, Shield, Lock, Crown, Star } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const plans = {
  basic: {
    name: "Basic",
    price: 39,
    icon: Heart,
    features: ["3 photos", "Simple message page", "Basic theme"]
  },
  romantic: {
    name: "Romantic",
    price: 69,
    icon: Star,
    features: ["Animated YES/NO buttons", "5 photos", "Background music", "Confetti celebration"]
  },
  premium: {
    name: "Premium",
    price: 169,
    icon: Crown,
    features: ["Memory gallery slideshow", "Beautiful animations", "Custom URL slug", "Premium romantic theme"]
  }
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planKey = (searchParams.get("plan") || "romantic") as keyof typeof plans;
  const plan = plans[planKey] || plans.romantic;
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (method: string = "cashfree") => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planKey === "basic" ? "romantic" : planKey,
        }),
      });

      if (res.status === 401) {
        window.location.href = `/login?callbackUrl=/checkout?plan=${planKey}`;
        return;
      }

      const json = await res.json();
      if (json.success && json.data?.url) {
        window.location.href = json.data.url;
        return;
      }

      window.location.href = `/create?plan=${planKey}&paid=true`;
    } catch {
      window.location.href = `/create?plan=${planKey}&paid=true`;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen romantic-gradient py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Heart className="w-12 h-12 text-primary fill-primary mx-auto mb-4 animate-pulse-heart" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-foreground/70">
            You are one step away from creating your magical proposal!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                    <plan.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{plan.name} Plan</h3>
                    <p className="text-foreground/60 text-sm">One-time purchase</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">₹{plan.price}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Includes:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/60">Subtotal</span>
                    <span>₹{plan.price}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-foreground/60">Tax</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{plan.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Options */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Payment Method</CardTitle>
                <CardDescription>Choose your preferred payment option</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Razorpay Option */}
                <Button
                  className="w-full h-auto py-4 bg-[#072654] hover:bg-[#0a3a7a] text-white flex items-center justify-between"
                  onClick={() => handlePayment("razorpay")}
                  disabled={isProcessing}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-[#072654]" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Pay with Razorpay</p>
                      <p className="text-xs opacity-80">UPI, Cards, Netbanking, Wallets</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">₹{plan.price}</span>
                </Button>

                {/* Cashfree Payment Option */}
                <Button
                  className="w-full h-auto py-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white flex items-center justify-between"
                  onClick={() => handlePayment("cashfree")}
                  disabled={isProcessing}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Pay with Cashfree</p>
                      <p className="text-xs opacity-90">UPI, Cards, Netbanking &amp; Wallets</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">₹{plan.price}</span>
                </Button>

                {isProcessing && (
                  <div className="text-center py-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-foreground/70 text-sm">Processing payment...</p>
                  </div>
                )}

                {/* Security Notice */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center gap-2 text-sm text-foreground/60 mb-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure checkout powered by trusted payment providers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/60">
                    <Lock className="w-4 h-4" />
                    <span>Your payment information is encrypted</span>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="mt-6 p-4 bg-primary/5 rounded-xl">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 italic">
                    "She said YES! The proposal page was so beautiful and romantic. 
                    Worth every penny!"
                  </p>
                  <p className="text-sm text-foreground/60 mt-2">— Happy Customer</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Change Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-foreground/60">
            Want a different plan?{" "}
            <Link href="/#pricing" className="text-primary hover:underline font-medium">
              View all plans
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen romantic-gradient flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary fill-primary mx-auto mb-4 animate-pulse-heart" />
          <p className="text-foreground/70">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
