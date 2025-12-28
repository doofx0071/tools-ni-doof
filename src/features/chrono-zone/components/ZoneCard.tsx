"use client";

import React from "react";
import { formatInTimeZone } from "date-fns-tz";
import { X, Building2, Moon, Sun, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWeather } from "../hooks/useWeather";
import { mapWmoCodeToIcon } from "../utils/weather";

interface ZoneCardProps {
    zone: string;
    now: Date;
    onRemove: () => void;
}

export default function ZoneCard({ zone, now, onRemove }: ZoneCardProps) {
    // 1. Time & Date Parsing
    const timeInZone = formatInTimeZone(now, zone, "h:mm a");
    const [timeStr, period] = timeInZone.split(" ");

    // 2. Logic for Visual Status (Night: 6pm - 6am)
    const hours24 = parseInt(formatInTimeZone(now, zone, "H"));

    // Define Day/Night Cycle
    // Day = 6:00 (6am) to 17:59 (5:59pm)
    // Night = 18:00 (6pm) to 5:59 (5:59am)
    const isNight = hours24 < 6 || hours24 >= 18;
    const isDay = !isNight;

    // Business Hours specific check (usually 9-5)
    const isBusinessHours = hours24 >= 9 && hours24 < 17;

    const dateInZone = formatInTimeZone(now, zone, "EEE, MMM d");
    const city = zone.split("/")[1]?.replace(/_/g, " ") || zone;
    const region = zone.split("/")[0];

    // Weather Hook
    const { data: weather, loading: weatherLoading } = useWeather(zone);
    const WeatherIcon = weather ? mapWmoCodeToIcon(weather.weatherCode).icon : Sun;

    // 3. Offset Calculation
    const getOffsetString = () => {
        try {
            const localDateStr = now.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
            const targetDateStr = now.toLocaleString('en-US', { timeZone: zone });
            const localDate = new Date(localDateStr);
            const targetDate = new Date(targetDateStr);
            const diffMs = targetDate.getTime() - localDate.getTime();
            const diffHours = Math.round(diffMs / (1000 * 60 * 60));
            if (diffHours === 0) return "Same Time";
            return `${diffHours > 0 ? "+" : ""}${diffHours} HRS`;
        } catch (e) { return ""; }
    };
    const offset = getOffsetString();

    // 4. Dynamic Themes
    // LIGHT MODE (Day) vs DARK MODE (Night)
    const themeClasses = isDay
        ? "bg-white/90 border-white/60 shadow-xl backdrop-blur-xl" // Light Card: White frosted
        : "bg-black/40 border-white/10 shadow-2xl backdrop-blur-xl"; // Dark Card: Dark frosted

    const textColor = isDay ? "text-slate-900" : "text-white";
    const subTextColor = isDay ? "text-slate-500" : "text-white/60";

    // Status Badge Logic
    const statusBadgeClass = isBusinessHours
        ? isDay
            ? "bg-emerald-100/80 text-emerald-700 border-emerald-200" // Light mode green
            : "bg-emerald-950/50 text-emerald-300 border-emerald-500/30" // Dark mode green
        : isDay
            ? "bg-slate-100/80 text-slate-600 border-slate-200" // Light mode neutral
            : "bg-white/10 text-white/70 border-white/10"; // Dark mode neutral

    return (
        <div className={cn(
            "relative flex flex-col justify-between rounded-3xl border transition-all duration-700 group hover:scale-[1.02] overflow-hidden min-h-[200px]",
            themeClasses
        )}>

            {/* --- card header --- */}
            <div className="flex items-start justify-between p-5 pb-0 z-10">
                <div className="flex flex-col gap-1 overflow-hidden pr-2">
                    <div className={cn("flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold transition-colors", subTextColor)}>
                        {isNight ? <Moon className="w-3 h-3 text-indigo-400" /> : <Sun className="w-3 h-3 text-amber-500" />}
                        <span className="truncate">{region}</span>
                    </div>
                    <h2 className={cn("text-2xl font-bold tracking-tight truncate leading-tight transition-colors", textColor)} title={city}>
                        {city}
                    </h2>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    className={cn(
                        "h-8 w-8 -mr-1 -mt-1 rounded-full transition-colors opacity-0 group-hover:opacity-100",
                        isDay ? "text-slate-400 hover:text-red-500 hover:bg-red-50" : "text-white/40 hover:text-red-400 hover:bg-red-500/10"
                    )}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* --- card body (Time) --- */}
            <div className="flex-1 flex flex-col justify-center px-5 py-2 z-10">
                <div className="flex items-baseline gap-2 w-full">
                    <span className={cn("text-6xl font-black tracking-tighter tabular-nums leading-none drop-shadow-sm transition-colors", textColor)}>
                        {timeStr}
                    </span>
                    <span className={cn("text-xl font-bold transition-colors", isDay ? "text-slate-400" : "text-white/50")}>
                        {period}
                    </span>
                </div>
            </div>

            {/* --- card footer (Info) --- */}
            <div className="p-5 pt-0 flex items-center justify-between z-10">
                <div className="flex flex-col gap-0.5">
                    <span className={cn("text-sm font-medium transition-colors", subTextColor)}>
                        {dateInZone}
                    </span>

                    {/* Weather Display */}
                    {!weatherLoading && weather && (
                        <div className={cn("flex items-center gap-1.5 text-xs font-semibold animate-in fade-in slide-in-from-left-2 duration-500", subTextColor)}>
                            <WeatherIcon className="w-3.5 h-3.5 opacity-70" />
                            <span>{Math.round(weather.temperature)}°C</span>
                            <span className="opacity-50 text-[10px] uppercase tracking-wide hidden sm:inline-block">
                                • {mapWmoCodeToIcon(weather.weatherCode).label}
                            </span>
                        </div>
                    )}
                </div>

                {/* Status Indicator */}
                <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm text-[10px] font-bold uppercase tracking-wider transition-colors",
                    statusBadgeClass
                )}>
                    {isBusinessHours ? <Building2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span>{isBusinessHours ? "Open" : offset}</span>
                </div>
            </div>

            {/* --- backgrounds / glow based on time --- */}
            <div className={cn(
                "absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none -mr-16 -mt-16 transition-all duration-1000 opacity-30",
                isDay ? "bg-amber-400" : "bg-indigo-600"
            )} />

            {isBusinessHours && (
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500 rounded-full blur-[60px] pointer-events-none -ml-10 -mb-10 opacity-20 transition-all duration-1000" />
            )}
        </div>
    );
}
