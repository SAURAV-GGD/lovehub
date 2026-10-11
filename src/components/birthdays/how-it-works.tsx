import React from "react";

export function BirthdaysHowItWorks() {
  const steps = [
    {
      number: "1.",
      title: "Set up the page",
      description:
        "Add their name, date and your own message. Pick a tone in English or Hinglish.",
      illustration: (
        <svg
          viewBox="0 0 160 120"
          className="w-full h-28 sm:h-32 filter drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Browser Window Frame */}
          <rect
            x="16"
            y="18"
            width="100"
            height="76"
            rx="10"
            fill="#FFFFFF"
            stroke="#14231F"
            strokeWidth="2"
          />
          {/* Browser Dots */}
          <circle cx="28" cy="28" r="2.5" fill="#FF6B45" />
          <circle cx="36" cy="28" r="2.5" fill="#F2B134" />
          <circle cx="44" cy="28" r="2.5" fill="#0E6B5E" />
          {/* Card Inside Browser */}
          <rect
            x="24"
            y="38"
            width="58"
            height="46"
            rx="6"
            fill="#FFF5E5"
            stroke="#D9A441"
            strokeWidth="1.5"
          />
          <text
            x="32"
            y="54"
            fontFamily="serif"
            fontSize="11"
            fontWeight="bold"
            fill="#14231F"
          >
            Riya
          </text>
          <rect x="32" y="60" width="40" height="3" rx="1.5" fill="#0E6B5E" opacity="0.6" />
          <rect x="32" y="68" width="24" height="6" rx="3" fill="#F2B134" />
          {/* Person Typing Illustration */}
          <path
            d="M95 94 C95 76 110 72 120 74 C130 72 145 76 145 94 Z"
            fill="#FF6B45"
            stroke="#14231F"
            strokeWidth="2"
          />
          {/* Head & Hair */}
          <circle cx="120" cy="54" r="14" fill="#14231F" />
          <ellipse cx="120" cy="57" rx="10" ry="11" fill="#FFC9A8" />
          {/* Hair Front */}
          <path d="M110 52 C114 44 126 44 130 52 C130 50 120 46 110 52 Z" fill="#14231F" />
          {/* Stylus / Pen in Hand */}
          <path d="M96 78 L80 84" stroke="#14231F" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      number: "2.",
      title: "Share one link",
      description:
        "Friends and family open it and leave a wish, a photo or a note.",
      illustration: (
        <svg
          viewBox="0 0 160 120"
          className="w-full h-28 sm:h-32 filter drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Gold Link Icon */}
          <circle cx="48" cy="62" r="22" fill="#F2B134" stroke="#14231F" strokeWidth="2" />
          <path
            d="M40 68 L46 62 M50 58 L56 52 M44 56 L50 62"
            stroke="#14231F"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M44 58 C41 55 41 50 44 47 C47 44 52 44 55 47"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M45 66 C48 69 53 69 56 66 C59 63 59 58 56 55"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Connected Lines to Friends */}
          <path d="M72 58 Q95 44 116 42" stroke="#14231F" strokeWidth="1.8" strokeDasharray="3 3" />
          <path d="M72 66 Q95 72 110 70" stroke="#14231F" strokeWidth="1.8" strokeDasharray="3 3" />
          <path d="M70 74 Q90 92 116 94" stroke="#14231F" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* Avatar 1 & Speech Bubble */}
          <circle cx="132" cy="38" r="10" fill="#FFC9A8" stroke="#14231F" strokeWidth="1.8" />
          <rect x="96" y="24" width="24" height="14" rx="4" fill="#CDEBE0" stroke="#14231F" strokeWidth="1.5" />
          <line x1="101" y1="31" x2="115" y2="31" stroke="#0E6B5E" strokeWidth="2" strokeLinecap="round" />

          {/* Message Bubble Center */}
          <rect x="110" y="58" width="30" height="18" rx="6" fill="#0E6B5E" stroke="#14231F" strokeWidth="1.8" />
          <circle cx="119" cy="67" r="1.8" fill="#FFFFFF" />
          <circle cx="125" cy="67" r="1.8" fill="#FFFFFF" />
          <circle cx="131" cy="67" r="1.8" fill="#FFFFFF" />

          {/* Avatar 2 Bottom */}
          <circle cx="130" cy="94" r="10" fill="#B3DECFA0" stroke="#14231F" strokeWidth="1.8" />
          <circle cx="130" cy="91" r="5" fill="#14231F" />
        </svg>
      ),
    },
    {
      number: "3.",
      title: "Open on the day",
      description:
        "The page unlocks on the birthday and the wishes appear one by one.",
      illustration: (
        <svg
          viewBox="0 0 160 120"
          className="w-full h-28 sm:h-32 filter drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Confetti Explosion & Stars */}
          <circle cx="36" cy="38" r="2.5" fill="#0E6B5E" />
          <circle cx="136" cy="42" r="3" fill="#F2B134" />
          <circle cx="128" cy="28" r="2" fill="#FF6B45" />
          <polygon points="40,24 43,30 50,31 45,36 46,42 40,39 34,42 35,36 30,31 37,30" fill="#F2B134" />
          <polygon points="120,68 122,72 126,73 123,76 124,80 120,78 116,80 117,76 114,73 118,72" fill="#0E6B5E" />

          {/* Open Gift Box Body */}
          <rect x="52" y="60" width="60" height="42" rx="4" fill="#FF8364" stroke="#14231F" strokeWidth="2" />
          {/* Gift Ribbon Center */}
          <rect x="76" y="60" width="12" height="42" fill="#0E6B5E" />
          {/* Gift Box Open Flaps */}
          <polygon points="44,60 52,60 52,50 40,50" fill="#FFA58E" stroke="#14231F" strokeWidth="2" />
          <polygon points="120,60 112,60 112,50 124,50" fill="#FFA58E" stroke="#14231F" strokeWidth="2" />

          {/* Wishes Cards Flying Out */}
          {/* Card Left */}
          <rect
            x="48"
            y="32"
            width="28"
            height="34"
            rx="4"
            fill="#FFFFFF"
            stroke="#14231F"
            strokeWidth="1.8"
            transform="rotate(-15 48 32)"
          />
          <rect x="53" y="38" width="16" height="3" rx="1.5" fill="#FF6B45" transform="rotate(-15 53 38)" />
          
          {/* Card Center (Main with Heart) */}
          <rect
            x="68"
            y="22"
            width="34"
            height="42"
            rx="4"
            fill="#FFF9EE"
            stroke="#14231F"
            strokeWidth="1.8"
          />
          <path
            d="M85 36 c2-2 5-2 7 0 c2 2 2 5 0 7 l-7 7 l-7-7 c-2-2-2-5 0-7 c2-2 5-2 7 0 Z"
            fill="#FF6B45"
          />

          {/* Card Right */}
          <rect
            x="96"
            y="30"
            width="28"
            height="34"
            rx="4"
            fill="#CDEBE0"
            stroke="#14231F"
            strokeWidth="1.8"
            transform="rotate(18 96 30)"
          />
          <rect x="99" y="38" width="16" height="3" rx="1.5" fill="#0E6B5E" transform="rotate(18 99 38)" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-[#FDF4E7] scroll-mt-20">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Section Heading */}
        <div className="text-left">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#14231F] tracking-tight">
            How it works
          </h2>
        </div>

        {/* 3 Step Ordered Columns */}
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 list-none m-0 p-0">
          {steps.map((step, idx) => (
            <li
              key={idx}
              className="flex flex-col space-y-5 bg-white/40 p-6 sm:p-7 rounded-2xl border border-[#E6DCC6]/60 transition-all hover:bg-white/80 hover:shadow-sm"
            >
              {/* Header with Starburst Numeral + Illustration */}
              <div className="flex items-center justify-between gap-4">
                {/* Starburst Numeral Badge */}
                <div className="relative shrink-0 flex items-center justify-center w-14 h-14" aria-hidden="true">
                  {/* Starburst SVG Backdrop */}
                  <svg
                    viewBox="0 0 54 54"
                    className="absolute inset-0 w-full h-full text-[#F2B134] filter drop-shadow-xs"
                    fill="currentColor"
                  >
                    <path d="M27 0 L32 18 L50 14 L38 27 L54 36 L36 38 L38 54 L27 42 L16 54 L18 38 L0 36 L16 27 L4 14 L22 18 Z" />
                  </svg>
                  {/* Teal Numeral */}
                  <span className="relative z-10 font-[family-name:var(--font-fraunces)] text-2xl sm:text-3xl font-extrabold text-[#0E6B5E] ml-1">
                    {step.number}
                  </span>
                </div>

                {/* Step Illustration */}
                <div className="flex-1 max-w-[180px]">
                  {step.illustration}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2.5">
                <h3 className="font-[family-name:var(--font-fraunces)] text-xl sm:text-2xl font-bold text-[#14231F]">
                  {step.title}
                </h3>
                <p className="text-[#55655F] text-base leading-relaxed font-normal">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
