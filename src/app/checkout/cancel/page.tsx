import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = {
  title: "Checkout Cancelled - LoveHub",
  description: "Your checkout was cancelled. No charges were made.",
};

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-gray-100 text-center">
        <CardHeader className="space-y-3 pb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-2">
            <XCircle className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Checkout Cancelled
          </CardTitle>
          <CardDescription className="text-gray-600">
            No worries! Your card was not charged. You can continue using your free plan or try upgrading whenever you're ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              asChild
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-medium"
            >
              <Link href="/create">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Generator
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/checkout">View Plans</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
