"use client";

import React, { useState } from "react";
import "./styles/tool.css";
// import TimelineSlider from "./components/TimelineSlider"; // Removed as per request
import ZoneCard from "./components/ZoneCard";
import { Plus, Globe } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const POPULAR_ZONES = [
  "Asia/Manila",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "Asia/Dubai",
  "Asia/Kolkata"
];

export default function ChronoZone() {
  // We only need the current lively ticking date now.
  // The slider is removed.
  const [zones, setZones] = useState<string[]>(["Asia/Manila", "America/New_York", "Europe/London", "Australia/Sydney"]);
  const [open, setOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isNight, setIsNight] = useState(false);

  React.useEffect(() => {
    // Initial set
    const now = new Date();
    setCurrentTime(now);
    const hour = now.getHours();
    setIsNight(hour < 6 || hour >= 18); // Night is before 6am or after 6pm

    const timer = setInterval(() => {
      const t = new Date();
      setCurrentTime(t);
      const h = t.getHours();
      setIsNight(h < 6 || h >= 18);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addZone = (zone: string) => {
    if (!zones.includes(zone)) {
      setZones([...zones, zone]);
    }
    setOpen(false);
  };

  const removeZone = (zone: string) => {
    setZones(zones.filter(z => z !== zone));
  };

  return (
    <div className={cn(
      "tool-chrono-zone min-h-screen animate-in fade-in duration-1000 flex flex-col p-4 md:p-6 lg:p-8 transition-colors duration-1000",
      isNight
        ? "bg-[#0f172a] text-white selection:bg-indigo-500/30"
        : "bg-[#f8fafc] text-slate-900 selection:bg-amber-500/30"
    )}>
      {/* Ambient Background Gradient based on time */}
      <div className={cn(
        "fixed inset-0 pointer-events-none transition-opacity duration-1000",
        isNight ? "opacity-30" : "opacity-60"
      )} style={{
        background: isNight
          ? "radial-gradient(circle at 50% 0%, #312e81 0%, transparent 60%)" // Night: Indigo
          : "radial-gradient(circle at 50% 0%, #fbbf24 0%, transparent 60%)" // Day: Amber
      }} />

      <div className="w-full space-y-12 relative z-10">

        {/* Header */}
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent tracking-tight">
              World Clock
            </h1>
            <p className={cn("text-xl font-light transition-colors", isNight ? "text-slate-400" : "text-slate-500")}>
              Real-time global dashboard.
            </p>
          </div>

          {/* Main PHT Clock Display (Hero) */}
          {currentTime && (
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "text-7xl md:text-9xl font-mono font-bold tracking-tighter drop-shadow-2xl tabular-nums transition-colors",
                isNight ? "text-white" : "text-slate-900"
              )}>
                {currentTime.toLocaleTimeString("en-US", {
                  timeZone: "Asia/Manila",
                  hour12: true,
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit"
                })}
              </div>
              <div className="text-xl uppercase tracking-[0.3em] text-primary font-bold opacity-80">
                Manila, Philippines (PHT)
              </div>
              <div className={cn("text-lg font-mono transition-colors", isNight ? "text-slate-400" : "text-slate-500")}>
                {currentTime.toLocaleDateString("en-US", { timeZone: "Asia/Manila", weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          )}
        </div>

        {/* Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {zones.map((zone) => (
            <ZoneCard
              key={zone}
              zone={zone}
              now={currentTime || new Date()}
              onRemove={() => removeZone(zone)}
            />
          ))}

          {/* Add Zone Button */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button className={cn(
                "h-full min-h-[160px] flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-all group animate-in fade-in zoom-in duration-300",
                isNight
                  ? "border-white/5 hover:border-primary/50 hover:bg-primary/5 text-slate-400 hover:text-primary"
                  : "border-slate-300 hover:border-primary/50 hover:bg-primary/5 text-slate-500 hover:text-primary"
              )}>
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg",
                  isNight ? "bg-white/5 group-hover:bg-primary/20" : "bg-slate-100 group-hover:bg-primary/20"
                )}>
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-semibold text-lg">Add Timezone</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[300px]" align="center">
              <Command>
                <CommandInput placeholder="Search city..." />
                <CommandList>
                  <CommandEmpty>No timezone found.</CommandEmpty>
                  <CommandGroup heading="Popular Zones">
                    {POPULAR_ZONES.map((zone) => (
                      <CommandItem
                        key={zone}
                        onSelect={() => addZone(zone)}
                        disabled={zones.includes(zone)}
                        className="cursor-pointer"
                      >
                        <Globe className="mr-2 h-4 w-4 opacity-50" />
                        <span>{zone}</span>
                        {zones.includes(zone) && <span className="ml-auto text-xs text-muted-foreground">Added</span>}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}