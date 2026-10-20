"use client";

import React, { useState, useRef, useEffect } from "react";
import { HelpCircle, X, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface InfoTooltipProps {
  title: string;
  description: string;
  tip?: string;
  className?: string;
}

export function InfoTooltip({
  title,
  description,
  tip,
  className = "",
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer ${
          isOpen
            ? "bg-rose-500 text-white shadow-xs scale-110"
            : "text-muted-foreground/80 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
        }`}
        aria-label={`Learn about ${title}`}
        title={`What is ${title}?`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 sm:w-72 p-3 rounded-xl bg-stone-900/95 dark:bg-stone-900 text-stone-100 shadow-xl border border-stone-800 backdrop-blur-md text-left text-xs pointer-events-auto"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5 pb-1 border-b border-stone-800">
              <span className="font-bold text-rose-300 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3 h-3 text-rose-400 shrink-0" />
                <span className="truncate">{title}</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="text-stone-400 hover:text-white cursor-pointer p-0.5"
                title="Close info"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed font-normal">
              {description}
            </p>
            {tip && (
              <div className="mt-2 pt-1.5 border-t border-stone-800 text-[10px] text-rose-200/90 font-medium flex items-center gap-1">
                <span>💡 Tip:</span>
                <span>{tip}</span>
              </div>
            )}
            {/* Downward triangle arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900/95" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
