"use client";

import React, { useState, useEffect } from "react";
import { RefreshCcw, Copy, Check, Globe, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { faker } from "@faker-js/faker";

// Supported Countries Configuration
interface CountryRule {
    code: string;
    name: string;
    length: number;
    bbanFormat: string; // Informational description
}

const SUPPORTED_COUNTRIES: CountryRule[] = [
    { code: "AT", name: "Austria", length: 20, bbanFormat: "5n (Bank) + 11n (Account)" },
    { code: "BE", name: "Belgium", length: 16, bbanFormat: "3n (Bank) + 7n (Account) + 2n (Check)" },
    { code: "BG", name: "Bulgaria", length: 22, bbanFormat: "4a (Bank) + 4n (Branch) + 2n (Type) + 8c (Account)" },
    { code: "CH", name: "Switzerland", length: 21, bbanFormat: "5n (Bank) + 12c (Account)" },
    { code: "CY", name: "Cyprus", length: 28, bbanFormat: "3n (Bank) + 5n (Branch) + 16c (Account)" },
    { code: "CZ", name: "Czech Republic", length: 24, bbanFormat: "4n (Bank) + 6n (Prefix) + 10n (Account)" },
    { code: "DE", name: "Germany", length: 22, bbanFormat: "8n (Bank) + 10n (Account)" },
    { code: "DK", name: "Denmark", length: 18, bbanFormat: "4n (Bank) + 10n (Account)" },
    { code: "EE", name: "Estonia", length: 20, bbanFormat: "2n (Bank) + 2n (Branch) + 11n (Account) + 1n (Check)" },
    { code: "ES", name: "Spain", length: 24, bbanFormat: "4n (Bank) + 4n (Branch) + 2n (Check) + 10n (Account)" },
    { code: "FI", name: "Finland", length: 18, bbanFormat: "6n (Bank) + 7n (Account) + 1n (Check)" },
    { code: "FR", name: "France", length: 27, bbanFormat: "5n (Bank) + 5n (Branch) + 11c (Account) + 2n (Key)" },
    { code: "GB", name: "United Kingdom", length: 22, bbanFormat: "4a (Bank) + 6n (Sort) + 8n (Account)" },
    { code: "GR", name: "Greece", length: 27, bbanFormat: "3n (Bank) + 4n (Branch) + 16c (Account)" },
    { code: "HU", name: "Hungary", length: 28, bbanFormat: "3n (Bank) + 4n (Branch) + 1n (Check) + 15n (Account) + 1n (Check)" },
    { code: "IE", name: "Ireland", length: 22, bbanFormat: "4a (Bank) + 6n (Sort) + 8n (Account)" },
    { code: "IS", name: "Iceland", length: 26, bbanFormat: "4n (Bank) + 2n (Branch) + 6n (Account) + 10n (ID)" },
    { code: "IT", name: "Italy", length: 27, bbanFormat: "1a (Check) + 5n (Bank) + 5n (Branch) + 12c (Account)" },
    { code: "LU", name: "Luxembourg", length: 20, bbanFormat: "3n (Bank) + 13c (Account)" },
    { code: "LV", name: "Latvia", length: 21, bbanFormat: "4a (Bank) + 13c (Account)" },
    { code: "NL", name: "Netherlands", length: 18, bbanFormat: "4a (Bank) + 10n (Account)" },
    { code: "NO", name: "Norway", length: 15, bbanFormat: "4n (Bank) + 6n (Account) + 1n (Check)" },
    { code: "PL", name: "Poland", length: 28, bbanFormat: "8n (Bank) + 16n (Account)" },
    { code: "PT", name: "Portugal", length: 25, bbanFormat: "4n (Bank) + 4n (Branch) + 11n (Account) + 2n (Check)" },
    { code: "RO", name: "Romania", length: 24, bbanFormat: "4a (Bank) + 16c (Account)" },
    { code: "SE", name: "Sweden", length: 24, bbanFormat: "3n (Bank) + 17n (Account)" },
    { code: "SI", name: "Slovenia", length: 19, bbanFormat: "5n (Bank) + 8n (Account) + 2n (Check)" },
    { code: "SK", name: "Slovakia", length: 24, bbanFormat: "4n (Bank) + 6n (Prefix) + 10n (Account)" }
];

/* BigInt Mod97 Logic */
function mod97(string: string) {
    // 1. Check if string is only alphanumeric
    // 2. Convert chars A=10, B=11...
    let digits = "";
    for (let i = 0; i < string.length; i++) {
        const port = string.charCodeAt(i);
        if (port >= 48 && port <= 57) digits += string[i]; // 0-9
        else if (port >= 65 && port <= 90) digits += (port - 55).toString(); // A-Z
        else if (port >= 97 && port <= 122) digits += (port - 87).toString(); // a-z
    }
    // 3. Compute mod 97 using BigInt
    return Number(BigInt(digits) % BigInt(97));
}

export default function IbanGenerator() {
    const [countryCode, setCountryCode] = useState("DE");
    const [iban, setIban] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        generateIban(countryCode);
    }, [countryCode]);

    const generateIban = (code: string) => {
        const rules = SUPPORTED_COUNTRIES.find(c => c.code === code);
        if (!rules) return;

        // 1. Generate random BBAN based on length requirement
        // (Length - 4) because IBAN = CC + KK + BBAN(len-4)
        const bbanLength = rules.length - 4;

        let bban = "";
        // Simple alphanumeric filler for now, respecting length.
        // In a real app we'd parse bbanFormat to know exact digit/char expected.
        // For "Test Only" mostly random is fine as long as length matches.
        // We will default to mostly numeric for safety unless it's a known alpha country like GB/IE.
        const isAlphaBank = ["GB", "IE", "NL", "LV", "RO"].includes(code);

        if (isAlphaBank) {
            // First 4 chars often Bank Code (Alpha)
            bban += faker.string.alpha({ length: 4, casing: 'upper' });
            bban += faker.string.numeric(bbanLength - 4);
        } else {
            bban += faker.string.numeric(bbanLength);
        }

        // 2. Build Checksum Input: BBAN + CC + 00
        const checksumInput = bban + code + "00";

        // 3. Calc Mod97
        const remainder = mod97(checksumInput);

        // 4. Check Digits = 98 - remainder
        const checkDigitsVal = 98 - remainder;
        const checkDigits = checkDigitsVal < 10 ? `0${checkDigitsVal}` : `${checkDigitsVal}`;

        setIban(code + checkDigits + bban);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(iban);
        setCopied(true);
        toast.success("IBAN copied");
        setTimeout(() => setCopied(false), 2000);
    };

    const currentRule = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <Globe className="w-6 h-6 text-primary" />
                        IBAN Generator
                    </h3>
                    <p className="text-muted-foreground text-sm">Valid Mod97 checksums for {SUPPORTED_COUNTRIES.length} countries.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => generateIban(countryCode)} className="gap-2 min-w-[120px]">
                        <RefreshCcw className="w-4 h-4" />
                        Generate
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* Controls */}
                <div className="md:col-span-1 space-y-4 p-5 rounded-2xl border bg-card/50 h-fit">
                    <div className="space-y-2">
                        <Label>Country</Label>
                        <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {SUPPORTED_COUNTRIES.map(c => (
                                    <SelectItem key={c.code} value={c.code}>
                                        <span className="flex items-center gap-2">
                                            <span className="font-mono text-xs opacity-50">{c.code}</span>
                                            {c.name}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {currentRule && (
                        <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
                            <p className="font-semibold">Format Rules:</p>
                            <p>Length: {currentRule.length} chars</p>
                            <p className="opacity-80 break-words">{currentRule.bbanFormat}</p>
                        </div>
                    )}
                </div>

                {/* Result Display */}
                <div className="md:col-span-3 space-y-4">
                    <div
                        onClick={copyToClipboard}
                        className="group relative p-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card to-background flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 transition-all min-h-[200px]"
                    >
                        <div className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">Generated IBAN</div>
                        <div className="font-mono text-3xl md:text-4xl font-bold tracking-wider text-center break-all">
                            {/* Format groups of 4 for readability */}
                            {iban.match(/.{1,4}/g)?.join(' ')}
                        </div>
                        <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-4">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span className="text-xs font-bold">{copied ? "COPIED" : "CLICK TO COPY"}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border bg-card/30">
                            <div className="text-xs text-muted-foreground uppercase mb-1">Country</div>
                            <div className="font-mono font-bold">{countryCode}</div>
                        </div>
                        <div className="p-4 rounded-xl border bg-card/30">
                            <div className="text-xs text-muted-foreground uppercase mb-1">Check Digits</div>
                            <div className="font-mono font-bold text-primary">{iban.slice(2, 4)}</div>
                        </div>
                        <div className="p-4 rounded-xl border bg-card/30">
                            <div className="text-xs text-muted-foreground uppercase mb-1">BBAN</div>
                            <div className="font-mono font-bold text-muted-foreground truncate" title={iban.slice(4)}>
                                {iban.slice(4)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-amber-500/80 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                        <Info className="w-4 h-4 flex-shrink-0" />
                        Testing only. Do not use for real transactions.
                    </div>
                </div>

            </div>
        </div>
    );
}
