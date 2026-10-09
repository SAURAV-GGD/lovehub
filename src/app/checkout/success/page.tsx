import Link from "next/link";
import { CheckCircle, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = {
  title: "Payment Successful - LoveHub",
  description: "Your proposal plan has been upgraded successfully.",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-emerald-100 text-center">
        <CardHeader className="space-y-3 pb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
            <CheckCircle className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your account has been upgraded. All premium proposal features, themes, and music are now unlocked!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
            <div className="flex items-center justify-center space-x-2 font-medium">
              <Heart className="h-4 w-4 fill-emerald-600 text-emerald-600" />
              <span>Ready to make your proposal unforgettable</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              asChild
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-medium"
            >
              <Link href="/create">
                Create Proposal <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
