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
        <label className="block text-xs font-semibold text-pink-200 uppercase tracking-wider mb-2">
          Surprise Presentation Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleTypeSelect("box")}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              activeType === "box"
                ? "bg-pink-600/30 border-pink-400 text-white shadow-lg"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
          >
            <Gift className="w-5 h-5 text-pink-400" />
            <span className="text-xs font-semibold">3D Gift Box</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeSelect("envelope")}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              activeType === "envelope"
                ? "bg-pink-600/30 border-pink-400 text-white shadow-lg"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
          >
            <Mail className="w-5 h-5 text-rose-400" />
            <span className="text-xs font-semibold">Sealed Envelope</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeSelect("promise_cards")}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              activeType === "promise_cards"
                ? "bg-pink-600/30 border-pink-400 text-white shadow-lg"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
          >
            <Ticket className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-semibold">Love Coupons</span>
          </button>
        </div>
      </div>

      {/* Preset Quick-Add Pills */}
      <div>
        <label className="block text-xs font-semibold text-pink-200 uppercase tracking-wider mb-2">
          Quick Preset Coupons (Tap to Add)
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COUPONS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddPreset(preset)}
              className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-pink-600/20 border border-white/10 hover:border-pink-500/40 text-pink-100 transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-pink-400" />
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editable Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-pink-200 uppercase tracking-wider">
            Custom Love Coupons ({cardList.length}/8)
          </label>
          {cardList.length < 8 && (
            <button
              type="button"
              onClick={handleAddNew}
              className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Coupon</span>
            </button>
          )}
        </div>

        {cardList.map((card, idx) => (
          <div
            key={card.id || idx}
            className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 relative group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-pink-400 flex items-center gap-1">
                <Heart className="w-3 h-3 fill-pink-400" /> Coupon #{idx + 1}
              </span>
              {cardList.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="text-white/40 hover:text-rose-400 transition-colors p-1"
                  title="Remove coupon"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Input
              value={card.title}
              onChange={(e) => handleCardUpdate(idx, "title", e.target.value)}
              placeholder="Coupon Title (e.g. Dinner Date)"
              className="bg-black/40 border-white/15 text-white text-xs h-8 rounded-lg"
            />
            <Textarea
              value={card.description}
              onChange={(e) => handleCardUpdate(idx, "description", e.target.value)}
              placeholder="What does this coupon promise?"
              className="bg-black/40 border-white/15 text-white text-xs min-h-[50px] rounded-lg"
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
