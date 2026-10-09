import Link from "next/link";
import { HeartCrack, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Page Not Found (404) - LoveHub",
  description: "The page or proposal you are looking for does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-500 shadow-inner">
          <HeartCrack className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            404
          </h1>
          <h2 className="text-xl font-semibold text-gray-800">
            Page Not Found
          </h2>
          <p className="text-sm text-gray-500">
            We couldn&apos;t find the proposal or page you were looking for. It may have expired or the link might be misspelled.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild className="bg-rose-500 hover:bg-rose-600 text-white font-medium">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Go Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/create">
              <ArrowLeft className="mr-2 h-4 w-4" /> Create a Proposal
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
