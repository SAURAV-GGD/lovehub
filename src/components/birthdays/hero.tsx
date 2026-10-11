import Link from "next/link";
import { Play } from "lucide-react";
import { WishCard } from "./wish-card";

export function BirthdaysHero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Copy */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6 sm:space-y-8 z-10 text-left">
            {/* Kicker */}
            <div className="inline-block">
              <span className="text-[13px] font-bold tracking-[0.18em] uppercase text-[#0E6B5E] bg-[#0E6B5E]/10 px-3 py-1 rounded-md">
                Birthday Pages
              </span>
            </div>

            {/* H1 */}
            <h1 className="font-[family-name:var(--font-fraunces)] text-4xl sm:text-5xl md:text-6xl xl:text-[70px] font-bold text-[#14231F] leading-[1.05] tracking-tight">
              One page. Every wish, kept in one place.
            </h1>

            {/* Subtitle Paragraph */}
            <p className="text-lg sm:text-xl text-[#55655F] leading-relaxed max-w-xl font-normal">
              Set up a birthday page with your own message. Friends add their
              wishes from a single link, and it all opens as a surprise on the day.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7">
              {/* Primary Coral CTA Button */}
              <Link
                href="/signup?callbackUrl=/birthdays/new"
                className="inline-flex items-center justify-center rounded-full bg-[#E85025] hover:bg-[#C94419] text-white px-8 py-4 text-base sm:text-lg font-semibold shadow-[0_8px_20px_rgba(232,80,37,0.25)] hover:shadow-[0_10px_24px_rgba(232,80,37,0.35)] hover:-translate-y-0.5 transition-all duration-200"
              >
                Create a birthday page
              </Link>

              {/* Secondary Example Link with Play Icon */}
              <a
                href="#how-it-works"
                className="group inline-flex items-center gap-2 text-base sm:text-lg font-semibold text-[#14231F] hover:text-[#0E6B5E] transition-colors"
              >
                <span className="underline underline-offset-4 decoration-[#14231F]/30 group-hover:decoration-[#0E6B5E]">
                  See an example
                </span>
                <span className="w-7 h-7 rounded-full border border-[#14231F]/40 group-hover:border-[#0E6B5E] flex items-center justify-center transition-colors">
                  <Play className="w-3.5 h-3.5 fill-current text-[#14231F] group-hover:text-[#0E6B5E] ml-0.5" />
                </span>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Art & Live Interactive Wish Cards */}
          <div className="lg:col-span-6 xl:col-span-5 relative w-full flex flex-col items-center">
            
            {/* Surrounding Decorative Elements (Balloons, Party Hat, Confetti) */}
            <div className="absolute -top-12 -right-4 sm:-right-8 w-28 h-32 pointer-events-none select-none hidden sm:block z-20" aria-hidden="true">
              {/* Floating Balloons */}
              <svg viewBox="0 0 100 120" className="w-full h-full filter drop-shadow-md">
                {/* Teal Balloon */}
                <ellipse cx="40" cy="40" rx="22" ry="26" fill="#0E6B5E" />
                <ellipse cx="34" cy="30" rx="6" ry="12" fill="#3AAFA9" opacity="0.4" />
                <path d="M38 66 L42 66 L40 70 Z" fill="#0E6B5E" />
                <path d="M40 70 Q35 88 44 110" stroke="#14231F" strokeWidth="1.2" fill="none" opacity="0.5" />

                {/* Coral Balloon */}
                <ellipse cx="68" cy="52" rx="20" ry="24" fill="#FF6B45" />
                <ellipse cx="62" cy="42" rx="5" ry="10" fill="#FFA58E" opacity="0.4" />
                <path d="M66 76 L70 76 L68 80 Z" fill="#FF6B45" />
                <path d="M68 80 Q62 95 64 115" stroke="#14231F" strokeWidth="1.2" fill="none" opacity="0.5" />
              </svg>
            </div>

            {/* Notebook Container */}
            <div className="relative w-full max-w-[460px] sm:max-w-[490px] mx-auto">
              
              {/* Notebook Physical Book Element */}
              <div 
                className="relative bg-[#D9A441] rounded-[24px] p-6 sm:p-8 sm:pb-12 shadow-[0_20px_45px_rgba(20,35,31,0.18)] border-4 border-[#C89432] rotate-[-2deg] transition-transform duration-300 hover:rotate-0"
              >
                {/* Notebook Teal Spine Binding */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 bg-[#0E6B5E] rounded-l-[20px] flex flex-col justify-around py-6 items-center border-r-2 border-[#095248]" 
                  aria-hidden="true"
                >
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-3.5 h-1.5 rounded-full bg-[#FDF4E7]/60" />
                  ))}
                </div>

                {/* Notebook Page Cover Content */}
                <div className="pl-6 sm:pl-7 space-y-4">
                  {/* Turning 26 Banner */}
                  <div className="text-[12px] sm:text-[13px] font-bold tracking-[0.14em] text-[#14231F]/80 uppercase">
                    TURNING 26 &middot; 14 MARCH
                  </div>

                  {/* Birthday Person Name */}
                  <h2 className="font-[family-name:var(--font-fraunces)] text-4xl sm:text-5xl font-bold text-[#14231F] tracking-tight">
                    Riya
                  </h2>

                  {/* Setup Message */}
                  <p className="text-sm sm:text-base text-[#14231F]/85 leading-snug font-normal max-w-[260px]">
                    A message from the one who set this up goes here.
                  </p>

                  {/* Illustrated Mini Party Hat & Balloons inside notebook */}
                  <div className="pt-2 sm:pt-4 flex items-center gap-4 opacity-90" aria-hidden="true">
                    <svg viewBox="0 0 60 60" className="w-14 h-14">
                      {/* Party Hat */}
                      <polygon points="30,8 14,48 46,48" fill="#F2B134" stroke="#14231F" strokeWidth="2" strokeLinejoin="round" />
                      <line x1="20" y1="34" x2="40" y2="34" stroke="#0E6B5E" strokeWidth="3" />
                      <line x1="24" y1="22" x2="36" y2="22" stroke="#FF6B45" strokeWidth="3" />
                      <circle cx="30" cy="6" r="3.5" fill="#FF6B45" />
                    </svg>

                    <div className="flex gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#0E6B5E]" />
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF6B45]" />
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#F2B134]" />
                    </div>
                  </div>
                </div>

                {/* Scalloped Postage Stamp Accent */}
                <div 
                  className="absolute bottom-4 right-4 w-12 h-14 bg-[#FFF9EE] border-2 border-dashed border-[#0E6B5E]/40 rounded-sm p-1 flex flex-col items-center justify-center rotate-6 shadow-sm hidden sm:flex"
                  aria-hidden="true"
                >
                  <span className="text-[10px] font-bold text-[#0E6B5E]">LOVE</span>
                  <span className="text-[9px] text-[#55655F]">14 MAR</span>
                </div>
              </div>

              {/* Wish Card 1: Meera (White with heart doodle) */}
              <div className="lg:absolute lg:-right-10 lg:top-24 mt-6 lg:mt-0 w-full lg:w-[310px] z-20">
                <WishCard
                  message="Wish text from a friend appears here."
                  author="Meera"
                  variant="white"
                  doodle="heart"
                  rotation={2}
                />
              </div>

              {/* Wish Card 2: Aarav (Mint with cake doodle) */}
              <div className="lg:absolute lg:-left-6 lg:bottom-[-40px] mt-4 lg:mt-0 w-full lg:w-[310px] z-30">
                <WishCard
                  message="Another wish, from someone else."
                  author="Aarav"
                  variant="mint"
                  doodle="cake"
                  rotation={-1.5}
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
