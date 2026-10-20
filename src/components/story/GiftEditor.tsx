"use client";

import { useState } from "react";
import { StoryPromiseCard } from "@/lib/proposal-types";
import { Plus, Trash2, Gift, Mail, Ticket, Sparkles, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface GiftEditorProps {
  giftType: "box" | "envelope" | "promise_cards" | "bouquet";
  cards: StoryPromiseCard[];
  onChange: (updated: {
    giftType: "box" | "envelope" | "promise_cards" | "bouquet";
    cards: StoryPromiseCard[];
  }) => void;
}

const PRESET_COUPONS = [
  {
    title: "Candlelight Dinner Date 🍝",
    description: "Good food, romantic playlist, and me paying 100% attention to you all evening.",
  },
  {
    title: "Unlimited Warm Hugs & Cuddles 🫂",
    description: "Redeemable anytime you feel tired, sad, or just want to feel safe in my arms.",
  },
  {
    title: "Late Night Long Drive & Ice Cream 🍦",
    description: "Windows down, cool breeze, quiet city roads, and your favorite ice cream flavor.",
  },
  {
    title: "Forgive-Any-Fight Pass 🕊️",
    description: "Instantly end any silly argument with a tight hug and zero grudges held.",
  },
  {
    title: "Full Day Pampering Pass 💆🏻‍♀️",
    description: "Breakfast in bed, shoulder massage, and you don't have to lift a finger all day.",
  },
];

export function GiftEditor({ giftType, cards, onChange }: GiftEditorProps) {
  const [activeType, setActiveType] = useState(giftType);
  const [cardList, setCardList] = useState<StoryPromiseCard[]>(cards);

  const handleTypeSelect = (type: "box" | "envelope" | "promise_cards" | "bouquet") => {
    setActiveType(type);
    onChange({ giftType: type, cards: cardList });
  };

  const handleCardUpdate = (index: number, field: "title" | "description", value: string) => {
    const updated = [...cardList];
    updated[index] = { ...updated[index], [field]: value };
    setCardList(updated);
    onChange({ giftType: activeType, cards: updated });
  };

  const handleAddPreset = (preset: { title: string; description: string }) => {
    if (cardList.length >= 8) return;
    const newCard: StoryPromiseCard = {
      id: `card_${Date.now()}`,
      title: preset.title,
      description: preset.description,
      icon: "Heart",
    };
    const updated = [...cardList, newCard];
    setCardList(updated);
    onChange({ giftType: activeType, cards: updated });
  };

  const handleAddNew = () => {
    if (cardList.length >= 8) return;
    const newCard: StoryPromiseCard = {
      id: `card_${Date.now()}`,
      title: "Special Romantic Wish ✨",
      description: "A customized love coupon made especially for you.",
      icon: "Gift",
    };
    const updated = [...cardList, newCard];
    setCardList(updated);
    onChange({ giftType: activeType, cards: updated });
  };

  const handleDelete = (index: number) => {
    if (cardList.length <= 1) return;
    const updated = cardList.filter((_, i) => i !== index);
    setCardList(updated);
    onChange({ giftType: activeType, cards: updated });
  };

  return (
    <div className="space-y-6">
      {/* Gift Style Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2.5">
          Surprise Presentation Style
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => handleTypeSelect("box")}
            className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
              activeType === "box"
                ? "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-950 dark:text-rose-100 shadow-sm ring-2 ring-rose-500/25 font-bold"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-300 hover:bg-rose-50/40 shadow-2xs"
            }`}
          >
            <Gift className="w-5 h-5 text-rose-500" />
            <span className="text-xs font-semibold">3D Gift Box</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeSelect("envelope")}
            className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
              activeType === "envelope"
                ? "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-950 dark:text-rose-100 shadow-sm ring-2 ring-rose-500/25 font-bold"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-300 hover:bg-rose-50/40 shadow-2xs"
            }`}
          >
            <Mail className="w-5 h-5 text-rose-500" />
            <span className="text-xs font-semibold">Sealed Envelope</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeSelect("promise_cards")}
            className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
              activeType === "promise_cards"
                ? "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-950 dark:text-rose-100 shadow-sm ring-2 ring-rose-500/25 font-bold"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-300 hover:bg-rose-50/40 shadow-2xs"
            }`}
          >
            <Ticket className="w-5 h-5 text-purple-500" />
            <span className="text-xs font-semibold">Love Coupons</span>
          </button>
        </div>
      </div>

      {/* Preset Quick-Add Pills */}
      <div>
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
          Quick Preset Coupons (Tap to Add)
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COUPONS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddPreset(preset)}
              className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 hover:border-rose-400 text-rose-800 dark:text-rose-200 transition-all flex items-center gap-1.5 shadow-2xs font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-rose-500" />
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editable Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Custom Love Coupons ({cardList.length}/8)
          </label>
          {cardList.length < 8 && (
            <button
              type="button"
              onClick={handleAddNew}
              className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Coupon</span>
            </button>
          )}
        </div>

        {cardList.map((card, idx) => (
          <div
            key={card.id || idx}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 relative group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Coupon #{idx + 1}
              </span>
              {cardList.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                  title="Remove coupon"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Input
              value={card.title}
              onChange={(e) => handleCardUpdate(idx, "title", e.target.value)}
              placeholder="Coupon Title (e.g. Candlelight Dinner Date)"
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs h-9 rounded-lg placeholder:text-slate-400 focus-visible:ring-rose-500/20 focus-visible:border-rose-500"
            />
            <Textarea
              value={card.description}
              onChange={(e) => handleCardUpdate(idx, "description", e.target.value)}
              placeholder="What does this coupon promise?"
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs min-h-[58px] rounded-lg placeholder:text-slate-400 focus-visible:ring-rose-500/20 focus-visible:border-rose-500 resize-none"
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
