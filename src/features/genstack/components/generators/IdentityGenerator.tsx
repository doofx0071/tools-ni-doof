"use client";

import React, { useState, useEffect } from "react";
import {
    Faker,
    en, en_US, en_GB, de, fr, es, it,
    ja, zh_CN, en_IN, pt_BR, ru, en_CA,
    en_AU, nl, pl, tr, vi, id_ID,
    ko, sv, da, fi, nb_NO, ar,
    th, uk, he, cs_CZ, ro, hr, hu, sk, zh_TW, en_IE, base
} from "@faker-js/faker";
// @ts-ignore - pinoy-faker doesn't have TypeScript definitions
import PinoyFaker from "pinoy-faker";
import { RefreshCcw, Copy, Check, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Define Country Configuration
interface CountryConfig {
    code: string;
    label: string;
    faker: Faker | null; // null for PH (uses pinoy-faker)
    regionLabel?: string;
}

// Helper to create instances
const createFaker = (locale: any) => new Faker({ locale: [locale, en, base] });

// Map of supported countries with their specific Faker instance
const COUNTRY_MAP: CountryConfig[] = [
    { code: "US", label: "United States", faker: createFaker(en_US), regionLabel: "State" },
    { code: "GB", label: "United Kingdom", faker: createFaker(en_GB), regionLabel: "County" },
    { code: "CA", label: "Canada", faker: createFaker(en_CA), regionLabel: "Province" },
    { code: "AU", label: "Australia", faker: createFaker(en_AU), regionLabel: "State" },
    { code: "IE", label: "Ireland", faker: createFaker(en_IE), regionLabel: "County" },
    // PH uses pinoy-faker for authentic Filipino data
    { code: "PH", label: "Philippines", faker: null, regionLabel: "Province" },
    { code: "DE", label: "Germany", faker: createFaker(de), regionLabel: "State" },
    { code: "FR", label: "France", faker: createFaker(fr), regionLabel: "Region" },
    { code: "ES", label: "Spain", faker: createFaker(es), regionLabel: "Province" },
    { code: "IT", label: "Italy", faker: createFaker(it), regionLabel: "Region" },
    { code: "NL", label: "Netherlands", faker: createFaker(nl), regionLabel: "Province" },
    { code: "PT", label: "Brazil", faker: createFaker(pt_BR), regionLabel: "State" },
    { code: "RU", label: "Russia", faker: createFaker(ru), regionLabel: "Region" },
    { code: "CN", label: "China", faker: createFaker(zh_CN), regionLabel: "Province" },
    { code: "JA", label: "Japan", faker: createFaker(ja), regionLabel: "Prefecture" },
    { code: "KR", label: "South Korea", faker: createFaker(ko), regionLabel: "Province" },
    { code: "IN", label: "India", faker: createFaker(en_IN), regionLabel: "State" },
    { code: "ID", label: "Indonesia", faker: createFaker(id_ID), regionLabel: "Province" },
    { code: "VN", label: "Vietnam", faker: createFaker(vi), regionLabel: "Province" },
    { code: "TH", label: "Thailand", faker: createFaker(th), regionLabel: "Province" },
    { code: "TR", label: "Turkey", faker: createFaker(tr), regionLabel: "Province" },
    { code: "PL", label: "Poland", faker: createFaker(pl), regionLabel: "Voivodeship" },
    { code: "UA", label: "Ukraine", faker: createFaker(uk), regionLabel: "Oblast" },
    { code: "SV", label: "Sweden", faker: createFaker(sv), regionLabel: "County" },
    { code: "NO", label: "Norway", faker: createFaker(nb_NO), regionLabel: "County" },
    { code: "DA", label: "Denmark", faker: createFaker(da), regionLabel: "Region" },
    { code: "FI", label: "Finland", faker: createFaker(fi), regionLabel: "Region" },
    { code: "CZ", label: "Czech Republic", faker: createFaker(cs_CZ), regionLabel: "Region" },
    { code: "GR", label: "Greece", faker: createFaker(en), regionLabel: "Region" },
    { code: "IL", label: "Israel", faker: createFaker(he), regionLabel: "District" },
    { code: "EG", label: "Egypt", faker: createFaker(ar), regionLabel: "Governorate" },
    { code: "TW", label: "Taiwan", faker: createFaker(zh_TW), regionLabel: "County" },
    { code: "RO", label: "Romania", faker: createFaker(ro), regionLabel: "County" },
    { code: "HU", label: "Hungary", faker: createFaker(hu), regionLabel: "County" },
    { code: "HR", label: "Croatia", faker: createFaker(hr), regionLabel: "County" },
    { code: "SK", label: "Slovakia", faker: createFaker(sk), regionLabel: "Region" },
].sort((a, b) => a.label.localeCompare(b.label));

export default function IdentityGenerator() {
    const [countryCode, setCountryCode] = useState<string>("US");
    const [data, setData] = useState<any>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Initial load
    useEffect(() => {
        setData(generateIdentity(countryCode));
    }, [countryCode]);

    function generateIdentity(code: string) {
        const config = COUNTRY_MAP.find(x => x.code === code) || COUNTRY_MAP[0];

        // Special handling for Philippines using pinoy-faker
        if (code === "PH") {
            const firstName = PinoyFaker.names.firstName();
            const lastName = PinoyFaker.names.lastName();
            const sex = Math.random() > 0.5 ? "Male" : "Female";

            // Filipino provinces, cities, and streets
            const provinces = ["Metro Manila", "Cebu", "Davao del Sur", "Laguna", "Cavite", "Bulacan", "Pampanga", "Batangas", "Rizal", "Pangasinan"];
            const cities = ["Manila", "Quezon City", "Davao City", "Cebu City", "Makati", "Pasig", "Taguig", "Caloocan", "Antipolo", "Zamboanga"];
            const streets = ["Rizal", "Bonifacio", "Mabini", "Luna", "Quezon", "Aguinaldo", "Del Pilar"];

            // Filipino phone format (09XX-XXX-XXXX)
            const phoneNumber = `09${Math.floor(Math.random() * 90 + 10)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;

            return {
                fullName: `${firstName} ${lastName}`,
                firstName,
                lastName,
                sex,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${["gmail.com", "yahoo.com", "outlook.com"][Math.floor(Math.random() * 3)]}`,
                username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}`,
                phoneNumber,
                address: `${Math.floor(Math.random() * 999 + 1)} ${streets[Math.floor(Math.random() * streets.length)]} Street`,
                city: cities[Math.floor(Math.random() * cities.length)],
                state: provinces[Math.floor(Math.random() * provinces.length)],
                stateLabel: config.regionLabel || "Province",
                country: config.label,
                code: config.code,
                zipCode: `${Math.floor(Math.random() * 9000 + 1000)}`,
                birthdate: new Date(1950 + Math.floor(Math.random() * 50), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
                bio: `${firstName} is from ${cities[Math.floor(Math.random() * cities.length)]}, Philippines.`,
            };
        }

        // Standard faker for other countries
        const f = config.faker!;
        const sex = f.person.sexType();
        const firstName = f.person.firstName(sex);
        const lastName = f.person.lastName();
        const genderLabel = sex.charAt(0).toUpperCase() + sex.slice(1);

        return {
            fullName: `${firstName} ${lastName}`,
            firstName,
            lastName,
            sex: genderLabel,
            email: f.internet.email({ firstName, lastName }),
            username: f.internet.username({ firstName, lastName }),
            phoneNumber: f.phone.number(),
            address: f.location.streetAddress({ useFullAddress: true }),
            city: f.location.city(),
            state: f.location.state(),
            stateLabel: config.regionLabel || "State/Region",
            country: config.label,
            code: config.code,
            zipCode: f.location.zipCode(),
            birthdate: f.date.birthdate().toLocaleDateString(),
            bio: f.person.bio(),
        };
    }

    const handleRegenerate = () => {
        setData(generateIdentity(countryCode));
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success(`Copied ${field} `);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const Field = ({ label, value, id }: { label: string, value: string, id: string }) => (
        <div
            onClick={() => copyToClipboard(value, label)}
            className="group relative flex flex-col gap-1 p-3 rounded-xl border bg-card/50 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer overflow-hidden"
        >
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground group-hover:text-primary/80 transition-colors truncate">
                {label}
            </span>
            <div className="font-mono text-sm truncate pr-6 text-foreground/90 font-medium">
                {value}
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-primary bg-card/80 backdrop-blur-sm p-1 rounded-full shadow-sm">
                {copiedField === label ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </div>
        </div>
    );

    if (!data) return <div className="p-12 text-center text-muted-foreground animate-pulse">Initializing Identity...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <User className="w-6 h-6 text-primary" />
                        Identity Generator
                    </h3>
                    <p className="text-muted-foreground text-sm">Real names and addresses for {COUNTRY_MAP.length} countries.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleRegenerate} className="gap-2 min-w-[120px]">
                        <RefreshCcw className="w-4 h-4" />
                        Regenerate
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Controls */}
                <div className="lg:col-span-1 space-y-4 p-5 rounded-2xl border bg-card/50 h-fit sticky top-4">
                    <div className="space-y-2">
                        <Label>Target Country (Locale)</Label>
                        <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[400px]">
                                {COUNTRY_MAP.map(c => (
                                    <SelectItem key={c.code} value={c.code} className="cursor-pointer">
                                        <span className="flex items-center gap-2">
                                            <span className="font-mono text-xs opacity-50 w-5">{c.code}</span>
                                            {c.label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                    </div>
                </div>

                {/* Profile Display */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Hero Card */}
                    <div className="relative p-6 rounded-2xl border bg-gradient-to-br from-card to-background overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative space-y-3">
                            <h4 className="text-3xl font-bold tracking-tight">{data.fullName}</h4>
                            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                                    {data.sex}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border uppercase">
                                    {data.country}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border font-mono">
                                    {data.code}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name" value={data.fullName} id="fullname" />
                        <Field label="Email Address" value={data.email} id="email" />
                        <Field label="Username" value={data.username} id="username" />
                        <Field label="Phone Number" value={data.phoneNumber} id="phone" />
                        <Field label="Birthdate" value={data.birthdate} id="birthdate" />
                        <Field label="User Agent" value="Mozilla/5.0..." id="ua" />
                    </div>

                    <div className="mt-8">
                        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <h4 className="font-semibold text-sm uppercase tracking-wider">Location Details</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border bg-muted/20">
                            <div className="sm:col-span-2">
                                <Field label="Full Address" value={`${data.address}, ${data.city} `} id="full_address" />
                            </div>
                            <Field label="Street" value={data.address} id="address" />
                            <Field label="City" value={data.city} id="city" />
                            <Field label={data.stateLabel} value={data.state} id="state" />
                            <Field label="Zip / Postal Code" value={data.zipCode} id="zip" />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
