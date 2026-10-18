"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Menu, X, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SiteHeaderProps {
  active?: "proposals" | "birthdays" | "pricing";
  theme?: "default" | "birthday";
}

export function SiteHeader({
  active = "proposals",
  theme = "default",
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadCart() {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setCartCount(json.data.totalCount || 0);
          }
        }
      } catch {
        // Safe fallback
      }
    }
    loadCart();
    return () => {
      isMounted = false;
    };
  }, []);

  const isBirthday = theme === "birthday" || active === "birthdays";

  if (isBirthday) {
    return (
      <header className="sticky top-0 z-50 bg-[#FDF4E7]/90 backdrop-blur-md border-b border-[#E6DCC6]/60 transition-colors pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Heart className="h-6 w-6 text-[#0E6B5E] fill-[#0E6B5E] transition-transform group-hover:scale-110" />
            <span className="text-2xl font-bold tracking-tight text-[#14231F] font-[family-name:var(--font-fraunces)]">
              LoveHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10 text-[15px] font-medium text-[#14231F]">
            <Link
              href="/"
              className={`transition-colors hover:text-[#0E6B5E] ${
                active === "proposals"
                  ? "text-[#0E6B5E] font-semibold border-b-2 border-[#0E6B5E] pb-1"
                  : "text-[#14231F]/80"
              }`}
            >
              Proposals
            </Link>
            <Link
              href="/birthdays"
              aria-current={active === "birthdays" ? "page" : undefined}
              className={`transition-colors hover:text-[#0E6B5E] ${
                active === "birthdays"
                  ? "text-[#0E6B5E] font-semibold border-b-2 border-[#0E6B5E] pb-1"
                  : "text-[#14231F]/80"
              }`}
            >
              Birthdays
            </Link>
            <a
              href="#pricing"
              className={`transition-colors hover:text-[#0E6B5E] ${
                active === "pricing"
                  ? "text-[#0E6B5E] font-semibold border-b-2 border-[#0E6B5E] pb-1"
                  : "text-[#14231F]/80"
              }`}
            >
              Pricing
            </a>
          </nav>

          {/* Right Action */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E6DCC6] bg-[#FDF4E7] text-[#14231F] hover:bg-[#E6DCC6]/60 transition-colors text-xs font-semibold"
              title="Your Orders & Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#0E6B5E]" />
              <span>Cart</span>
              {typeof cartCount === "number" && cartCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#0E6B5E] rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href="/birthdays/new"
              className="inline-flex items-center justify-center rounded-full bg-[#0E6B5E] hover:bg-[#095248] text-white px-6 py-2.5 text-sm font-semibold shadow-sm ring-1 ring-[#D9A441]/80 hover:ring-[#D9A441] transition-all hover:shadow-md"
            >
              Create a page
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#14231F] hover:bg-[#E6DCC6]/40 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FDF4E7] border-b border-[#E6DCC6] px-4 pt-2 pb-6 space-y-4 shadow-lg">
            <nav className="flex flex-col space-y-3 font-medium">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1 text-base ${
                  active === "proposals" ? "text-[#0E6B5E] font-semibold" : "text-[#14231F]"
                }`}
              >
                Proposals
              </Link>
              <Link
                href="/birthdays"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={active === "birthdays" ? "page" : undefined}
                className={`py-1 text-base ${
                  active === "birthdays" ? "text-[#0E6B5E] font-semibold" : "text-[#14231F]"
                }`}
              >
                Birthdays
              </Link>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-base text-[#14231F]"
              >
                Pricing
              </a>
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-1 text-base text-[#14231F] hover:text-[#0E6B5E]"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#0E6B5E]" />
                  Cart & Orders
                </span>
                {typeof cartCount === "number" && cartCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-xs font-bold text-white bg-[#0E6B5E] rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            </nav>
            <div className="pt-2">
              <Link
                href="/birthdays/new"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center rounded-full bg-[#0E6B5E] text-white py-3 text-sm font-semibold ring-1 ring-[#D9A441]"
              >
                Create a page
              </Link>
            </div>
          </div>
        )}
      </header>
    );
  }

  // Default LoveHub Proposals Header
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-gray-100 pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
          <span className="text-2xl font-black tracking-tight text-gray-900">
            LoveHub
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link
            href="/"
            className={`transition-colors hover:text-rose-500 ${
              active === "proposals" ? "text-rose-500 font-semibold" : ""
            }`}
          >
            Proposals
          </Link>
          <Link
            href="/birthdays"
            className="transition-colors hover:text-rose-500 font-medium text-gray-600"
          >
            Birthdays
          </Link>
          <a href="#how-it-works" className="hover:text-rose-500 transition-colors">
            How It Works
          </a>
          <a href="#features" className="hover:text-rose-500 transition-colors">
            Features
          </a>
          <a href="#pricing" className="hover:text-rose-500 transition-colors">
            Pricing
          </a>
          <a href="#faq" className="hover:text-rose-500 transition-colors">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100 transition-colors text-xs font-semibold shadow-2xs"
            title="Your Orders & Cart"
          >
            <ShoppingBag className="w-4 h-4 text-rose-500" />
            <span>Cart</span>
            {typeof cartCount === "number" && cartCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-sm">
            <Link href="/create">
              Create Proposal <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-6 space-y-3 shadow-md">
          <nav className="flex flex-col space-y-2.5 font-medium text-sm text-gray-700">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-rose-500"
            >
              Proposals
            </Link>
            <Link
              href="/birthdays"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-teal-700 font-semibold hover:text-teal-800"
            >
              Birthdays
            </Link>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-rose-500"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-rose-500"
            >
              Pricing
            </a>
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-1 text-gray-700 hover:text-rose-600 font-medium"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-rose-500" />
                Cart & Orders
              </span>
              {typeof cartCount === "number" && cartCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-xs font-bold text-white bg-rose-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-rose-500"
            >
              Sign In
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
