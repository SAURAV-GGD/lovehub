import Link from "next/link";

export function BirthdaysClosingCta() {
  return (
    <section className="relative overflow-hidden bg-[#14231F] text-[#FDF4E7] py-24 sm:py-32 w-full">
      {/* Decorative Stars and Confetti Background */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-80" aria-hidden="true">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 400"
        >
          {/* Gold & Cream Stars */}
          <polygon points="120,60 123,68 132,69 125,75 127,84 120,79 113,84 115,75 108,69 117,68" fill="#F2B134" />
          <polygon points="250,110 252,116 259,117 254,122 255,129 250,125 245,129 246,122 241,117 248,116" fill="#FDF4E7" opacity="0.7" />
          <polygon points="380,50 382,55 388,56 383,60 384,66 380,63 376,66 377,60 372,56 378,55" fill="#F2B134" />
          <polygon points="850,70 853,77 861,78 855,84 857,92 850,88 843,92 845,84 839,78 847,77" fill="#F2B134" />
          <polygon points="980,120 982,126 989,127 984,132 985,139 980,135 975,139 976,132 971,127 978,126" fill="#FDF4E7" opacity="0.6" />
          <polygon points="1080,55 1082,60 1088,61 1084,65 1085,71 1080,68 1075,71 1076,65 1072,61 1078,60" fill="#F2B134" />
          <polygon points="190,320 192,326 199,327 194,332 195,339 190,335 185,339 186,332 181,327 188,326" fill="#F2B134" opacity="0.8" />
          <polygon points="760,330 762,336 769,337 764,342 765,349 760,345 755,349 756,342 751,337 758,336" fill="#FDF4E7" opacity="0.7" />
          <polygon points="940,310 943,317 951,318 945,324 947,332 940,328 933,332 935,324 929,318 937,317" fill="#F2B134" />

          {/* Floating Confetti Ribbon Flakes */}
          <path d="M170 140 Q180 155 175 170" stroke="#FF6B45" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M300 240 Q315 250 310 265" stroke="#0E6B5E" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M1010 160 Q1025 175 1020 190" stroke="#FF6B45" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M1030 310 Q1045 325 1035 340" stroke="#0E6B5E" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M305 340 Q320 350 315 365" stroke="#F2B134" strokeWidth="3.5" fill="none" strokeLinecap="round" />

          {/* Scattered Shimmer Dots */}
          <circle cx="80" cy="180" r="3" fill="#F2B134" />
          <circle cx="140" cy="260" r="2.5" fill="#FDF4E7" />
          <circle cx="450" cy="90" r="3.5" fill="#FF6B45" />
          <circle cx="520" cy="340" r="2.5" fill="#F2B134" />
          <circle cx="680" cy="80" r="3" fill="#FDF4E7" />
          <circle cx="780" cy="220" r="3.5" fill="#F2B134" />
          <circle cx="1120" cy="240" r="3" fill="#FDF4E7" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <h2 className="font-[family-name:var(--font-fraunces)] text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-[#FDF4E7] tracking-tight max-w-3xl mx-auto leading-tight">
          Start a page before the day gets here.
        </h2>

        <div className="pt-2 flex justify-center">
          <Link
            href="/birthdays/new"
            className="inline-flex items-center justify-center rounded-full bg-[#F2B134] hover:bg-[#E5A323] text-[#14231F] px-8 sm:px-10 py-4 sm:py-4.5 text-base sm:text-lg font-bold shadow-[0_8px_25px_rgba(242,177,52,0.3)] hover:shadow-[0_12px_30px_rgba(242,177,52,0.4)] hover:-translate-y-0.5 transition-all duration-200"
          >
            Create a birthday page
          </Link>
        </div>
      </div>
    </section>
  );
}
