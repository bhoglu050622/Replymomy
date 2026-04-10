"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";

const VIRTUAL_GIFTS = [
  { id: "1", name: "Single Rose", price: 5, tokens: 5, emoji: "🌹" },
  { id: "2", name: "Champagne Toast", price: 15, tokens: 15, emoji: "🥂" },
  { id: "3", name: "Diamonds", price: 25, tokens: 25, emoji: "💎" },
];

const LUXURY_GIFTS = [
  { id: "4", name: "Bouquet of Peonies", price: 75, emoji: "💐" },
  { id: "5", name: "Vintage Champagne", price: 250, emoji: "🍾" },
  { id: "6", name: "Cartier Trinity", price: 500, emoji: "💍" },
];

// Placeholder recipient — in a real flow this would come from a match selection
const PLACEHOLDER_RECIPIENT = "recipient-placeholder-id";

export default function GiftsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const tokenBalance = useUserStore((s) => s.tokenBalance);

  const allGifts = [...VIRTUAL_GIFTS, ...LUXURY_GIFTS];
  const selectedGift = allGifts.find((g) => g.id === selected);

  async function handleSend() {
    if (!selected || !selectedGift) return;
    setLoading(true);

    const isVirtual = VIRTUAL_GIFTS.some((g) => g.id === selected);

    try {
      if (isVirtual) {
        // Try tokens first
        const res = await fetch("/api/gifts/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            giftId: selected,
            recipientId: PLACEHOLDER_RECIPIENT,
            message,
            useTokens: true,
          }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          if ("tokens" in selectedGift && selectedGift.tokens) {
            useUserStore.getState().decrementTokens(selectedGift.tokens as number);
          }
          toast.success("Sent.");
          setSelected(null);
          setMessage("");
          return;
        }

        // Insufficient tokens — fall through to Stripe
      }

      // Route to Stripe for IRL gifts or when tokens are insufficient
      const res = await fetch("/api/stripe/purchase-gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftId: selected,
          recipientId: PLACEHOLDER_RECIPIENT,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Try again.");
        return;
      }
      // For a full implementation, use Stripe.js to confirm the PaymentIntent
      // For now, acknowledge the intent was created
      toast.success("Sent.");
      setSelected(null);
      setMessage("");
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="text-label text-champagne mb-3">Send</div>
          <h1 className="text-display-lg text-ivory">
            Send <span className="italic text-champagne">something.</span>
          </h1>
        </div>
        <div className="hidden md:block text-right">
          <div className="text-label text-ivory/40">Token Balance</div>
          <div className="font-headline text-2xl text-champagne">
            {tokenBalance ?? "—"}
          </div>
        </div>
      </div>

      <Tabs defaultValue="virtual" className="w-full">
        <TabsList className="grid w-full max-w-sm grid-cols-2 bg-smoke border border-champagne/20 mb-8">
          <TabsTrigger value="virtual" className="data-[state=active]:bg-champagne data-[state=active]:text-obsidian">
            Virtual
          </TabsTrigger>
          <TabsTrigger value="luxury" className="data-[state=active]:bg-champagne data-[state=active]:text-obsidian">
            IRL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="virtual" className="space-y-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VIRTUAL_GIFTS.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelected(g.id === selected ? null : g.id)}
                className={`p-6 rounded-2xl bg-smoke border transition-all text-left ${
                  selected === g.id
                    ? "border-champagne shadow-gold-glow"
                    : "border-champagne/10 hover:border-champagne/30"
                }`}
              >
                <div className="text-5xl mb-4">{g.emoji}</div>
                <div className="font-headline text-xl text-ivory mb-2">
                  {g.name}
                </div>
                <div className="text-label text-champagne">
                  ${g.price} or {g.tokens} tokens
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="luxury">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LUXURY_GIFTS.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelected(g.id === selected ? null : g.id)}
                className={`p-6 rounded-2xl bg-gradient-to-b from-burgundy/20 to-smoke border transition-all text-left ${
                  selected === g.id
                    ? "border-champagne shadow-gold-glow"
                    : "border-champagne/20 hover:border-champagne/40"
                }`}
              >
                <div className="text-5xl mb-4">{g.emoji}</div>
                <div className="font-headline text-xl text-ivory mb-2">
                  {g.name}
                </div>
                <div className="text-label text-champagne">${g.price}</div>
                <div className="text-label text-ivory/40 mt-2">
                  Hand-delivered
                </div>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selected && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 z-30">
          <Button
            variant="gold"
            className="h-14 rounded-full px-10 shadow-gold-glow"
            onClick={handleSend}
            disabled={loading}
          >
            <Gift className="size-4 mr-2" />
            {loading ? "Sending..." : `Send ${selectedGift?.name}`}
          </Button>
        </div>
      )}
    </div>
  );
}
