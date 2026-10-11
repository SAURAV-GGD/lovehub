import React from "react";

export interface WishCardProps {
  message: string;
  author: string;
  variant?: "white" | "mint";
  doodle?: "heart" | "cake";
  rotation?: number;
  className?: string;
}

export function WishCard({
  message,
  author,
  variant = "white",
  doodle = "heart",
  rotation = 0,
  className = "",
}: WishCardProps) {
  const isWhite = variant === "white";

  return (
    <article
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
      className={`rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:z-20 cursor-default select-none ${
        isWhite
          ? "bg-white text-[#14231F] border border-[#E6DCC6] shadow-[0_12px_32px_rgba(20,35,31,0.12)]"
          : "bg-[#CDEBE0] text-[#14231F] border border-[#B3DECFA0] shadow-[0_14px_34px_rgba(20,35,31,0.14)]"
      } ${className}`}
      aria-label={`Birthday wish from ${author}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <p className="font-[family-name:var(--font-fraunces)] text-[16px] sm:text-[18px] text-[#14231F] leading-snug font-normal">
            &ldquo;{message}&rdquo;
          </p>
          <div className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-[#0E6B5E]">
            <span>&mdash;</span>
            <span>{author}</span>
          </div>
        </div>

        {/* Doodle Ornament */}
        <div className="shrink-0 pt-1" aria-hidden="true">
          {doodle === "heart" && (
            <svg
              className="w-7 h-7 text-[#FF6B45] transform rotate-6 transition-transform hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          )}

          {doodle === "cake" && (
            <svg
              className="w-8 h-8 text-[#0E6B5E] transition-transform hover:scale-110"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Cake Stand / Base */}
              <ellipse cx="16" cy="27" rx="13" ry="2.5" fill="#B2D8CD" />
              {/* Bottom Tier */}
              <rect x="5" y="18" width="22" height="7" rx="2.5" fill="#FF8364" />
              {/* Middle Frosting */}
              <path d="M5 21C7 22.5 9 19.5 11 21C13 22.5 15 19.5 17 21C19 22.5 21 19.5 23 21C25 22.5 27 19.5 27 21" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
              {/* Top Tier */}
              <rect x="8" y="12" width="16" height="6" rx="2" fill="#F2B134" />
              {/* Top Frosting */}
              <path d="M8 14C10 15.5 12 13 14 14.5C16 13 18 15.5 20 14C22 15.5 24 13.5 24 14" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              {/* Candles */}
              <rect x="11" y="7" width="2" height="5" rx="0.5" fill="#0E6B5E" />
              <rect x="15" y="7" width="2" height="5" rx="0.5" fill="#FF6B45" />
              <rect x="19" y="7" width="2" height="5" rx="0.5" fill="#0E6B5E" />
              {/* Flames */}
              <circle cx="12" cy="5" r="1.4" fill="#FF6B45" />
              <circle cx="16" cy="5" r="1.4" fill="#FF6B45" />
              <circle cx="20" cy="5" r="1.4" fill="#FF6B45" />
            </svg>
          )}
        </div>
      </div>
    </article>
  );
}
