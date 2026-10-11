"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  Heart,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  KeyRound,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("admin@lovehub.com");
  const [password, setPassword] = useState("LoveHubAdmin2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter admin email and password");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Administrator session verified! Welcome to LoveHub Console.");
        router.push(callbackUrl);
        router.refresh();
      } else {
        toast.error(data.error?.message || "Invalid administrator credentials");
      }
    } catch {
      toast.error("Network error while connecting to Admin Auth service");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    setEmail("admin@lovehub.com");
    setPassword("LoveHubAdmin2026!");
    toast.info("Default administrator credentials filled");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* Radiant Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Return to website link */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center text-xs text-slate-400">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 hover:text-rose-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to LoveHub Main Site
        </Link>
        <span className="bg-rose-950/70 text-rose-300 border border-rose-800/60 px-2.5 py-0.5 rounded-full font-medium">
          Executive Portal
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl shadow-2xl shadow-rose-950/20 text-slate-100">
          <CardHeader className="text-center pb-4 pt-8">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30 mb-3 border border-rose-400/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              Admin Gateway
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Control center for clients, database records &amp; unlimited proposal generation
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-2">
            {/* Quick Demo Credentials Info Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  Administrator Credentials
                </span>
                <button
                  type="button"
                  onClick={fillDefaultCredentials}
                  className="text-xs text-pink-400 hover:text-pink-300 underline font-medium"
                >
                  Auto Fill
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block">User:</span>
                  <span className="text-slate-200">admin@lovehub.com</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Pass:</span>
                  <span className="text-slate-200">LoveHubAdmin2026!</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-email" className="text-xs font-semibold text-slate-300">
                  Admin Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@lovehub.com"
                    required
                    className="pl-9 bg-slate-950/70 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-pass" className="text-xs font-semibold text-slate-300">
                  Security Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="admin-pass"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="pl-9 pr-10 bg-slate-950/70 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-2.5 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying Credentials...
                  </>
                ) : (
                  <>
                    Sign In to Admin Console <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 border-t border-slate-800/80 pt-4 pb-6 text-center text-xs text-slate-400">
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Access: Starter, Pro, Premium, Custom VIP Unlimited</span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-rose-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
