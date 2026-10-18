import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";

export default function PayNotFound() {
  return (
    <div className="min-h-screen romantic-gradient flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/95 rounded-2xl p-8 border border-rose-200 shadow-xl text-center space-y-5">
        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
          <Heart className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Checkout Session Not Found</h1>
          <p className="text-sm text-muted-foreground">
            This checkout session has either expired or already completed. Please restart checkout from your proposal page.
          </p>
        </div>
        <Link href="/create" className="block w-full">
          <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Proposal Editor</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
