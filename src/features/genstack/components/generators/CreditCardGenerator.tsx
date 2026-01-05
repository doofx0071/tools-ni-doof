"use client";

import React, { useState, useEffect } from "react";
import { RefreshCcw, Copy, Check, Plus, Minus, CreditCard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { faker } from "@faker-js/faker";

interface GeneratedCard {
    number: string;
    expiry: string;
    cvv: string;
    type: string;
}

export default function CreditCardGenerator() {
    const [cards, setCards] = useState<GeneratedCard[]>([]);
    const [prefix, setPrefix] = useState("4532");
    const [quantity, setQuantity] = useState(5);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Initial load
    useEffect(() => {
        handleGenerate();
    }, []);

    // Luhn Algorithm Implementation
    const generateLuhnNumber = (prefix: string, length: number = 16): string => {
        let ccNumber = prefix;
        // Fill up to length - 1 with random digits
        while (ccNumber.length < length - 1) {
            ccNumber += Math.floor(Math.random() * 10);
        }

        // Calculate Checksum
        const reversed = ccNumber.split('').reverse().map(Number);
        const sum = reversed.reduce((acc, digit, idx) => {
            let val = digit;
            // Double every second digit (note: we are working on the prefix+random part, effectively right-to-left from the would-be check digit)
            // But since we excluded the check digit, the "first" digit from right is actually the one at index 0 of reversed array (which is originally index 14 for a 16-digit card).
            // Actually luhn works including check digit. To find check digit:
            // 1. Double every second digit from the rightmost (which will be the check digit position).
            // So for standard generation, we double digits at odd indices from calculation perspective?
            // Simpler: Just reverse what we have. Index 0 (original last) is "odd" position from check digit perspective (1st, 3rd...). 
            // Wait, check digit is index 1. So even indices in 0-based reverse array are "odd" positions from right (excluding check).
            // Let's stick to standard implementation:

            // Standard Luhn Generation:
            // 1. Start from rightmost known digit.
            // 2. Moving left, double every second digit.
            // 3. Sum digits.
            // 4. (Sum * 9) % 10 is the check digit.

            if (idx % 2 === 0) { // Indices 0, 2, 4... (which are 1st, 3rd from right excluding check) -> Double them
                val *= 2;
                if (val > 9) val -= 9;
            }
            return acc + val;
        }, 0);

        const checkDigit = (sum * 9) % 10;
        return ccNumber + checkDigit;
    };


    const handleGenerate = () => {
        const newCards: GeneratedCard[] = [];
        const safeQty = Math.min(Math.max(1, quantity), 100);
        const safePrefix = prefix.replace(/[^0-9]/g, "") || "4"; // Default to Visa-ish if empty

        for (let i = 0; i < safeQty; i++) {
            newCards.push({
                number: generateLuhnNumber(safePrefix),
                expiry: faker.date.future({ years: 3 }).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }),
                cvv: faker.string.numeric(3),
                type: getCardType(safePrefix)
            });
        }
        setCards(newCards);
    };

    const getCardType = (p: string) => {
        if (p.startsWith("4")) return "Visa";
        if (p.startsWith("5")) return "Mastercard";
        if (p.startsWith("34") || p.startsWith("37")) return "Amex";
        if (p.startsWith("6")) return "Discover";
        return "Generic";
    };

    const copyToClipboard = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const copyAll = () => {
        const text = cards.map(c => `${c.number}|${c.expiry}|${c.cvv}`).join("\n");
        navigator.clipboard.writeText(text);
        toast.success("Copied all cards");
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-primary" />
                        Credit Card Generator
                    </h3>
                    <p className="text-muted-foreground text-sm">Generate valid Luhn-checked test numbers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={copyAll} disabled={cards.length === 0} className="gap-2">
                        <Copy className="w-4 h-4" /> Copy All
                    </Button>
                    <Button onClick={handleGenerate} className="gap-2 min-w-[120px]">
                        <RefreshCcw className="w-4 h-4" />
                        Generate
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <div className="p-5 rounded-2xl border bg-card/50 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label>BIN / Prefix</Label>
                    <Input
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                        placeholder="e.g. 4532"
                        className="font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">First 6-8 digits determine the issuer.</p>
                </div>
                <div className="space-y-2">
                    <Label>Quantity</Label>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 5))}><Minus className="w-4 h-4" /></Button>
                        <Input
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            className="text-center font-mono w-20"
                        />
                        <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.min(100, q + 5))}><Plus className="w-4 h-4" /></Button>
                    </div>
                </div>
                <div className="flex items-center justify-end">
                    <div className="text-right text-xs text-muted-foreground">
                        <p>✅ Luhn Algorithm Checked</p>
                        <p>✅ Random CVV & Expiry</p>
                        <p>❌ Not Real Transactions</p>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 gap-3">
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        onClick={() => copyToClipboard(card.number, idx)}
                        className="group flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/5 transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-12 h-8 rounded bg-gradient-to-br flex items-center justify-center text-[10px] font-bold text-white shadow-sm",
                                card.type === "Visa" ? "from-blue-600 to-blue-800" :
                                    card.type === "Mastercard" ? "from-orange-500 to-red-600" :
                                        card.type === "Amex" ? "from-cyan-600 to-teal-700" :
                                            "from-slate-600 to-slate-800"
                            )}>
                                {card.type}
                            </div>
                            <div className="font-mono text-lg tracking-wide text-foreground/90">
                                {card.number.match(/.{1,4}/g)?.join(' ')}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground font-mono">
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] uppercase tracking-wider opacity-50">EXP</span>
                                <span>{card.expiry}</span>
                            </div>
                            <div className="flex flex-col items-end w-10">
                                <span className="text-[9px] uppercase tracking-wider opacity-50">CVV</span>
                                <span>{card.cvv}</span>
                            </div>
                            <div className="w-8 flex justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
