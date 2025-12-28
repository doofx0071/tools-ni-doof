"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Options } from "qr-code-styling";
import { PRESETS, generateRandomOptions } from "../utils/presets";
import { Copy, RefreshCw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ContentType = "url" | "wifi" | "vcard" | "email";

interface DebouncedColorPickerProps {
    value?: string;
    onChange: (value: string) => void;
}

function DebouncedColorPicker({ value = "#000000", onChange }: DebouncedColorPickerProps) {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue);
            }
        }, 50); // Fast debounce for responsiveness
        return () => clearTimeout(handler);
    }, [localValue, onChange, value]);

    return (
        <div className="flex gap-2">
            <input
                type="color"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                className="h-10 w-10 rounded cursor-pointer border-0 bg-transparent p-0"
            />
            <Input
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                className="font-mono uppercase"
            />
        </div>
    );
}

interface QRControlsProps {
    options: Options;
    onChange: (newOptions: Options) => void;
}

export default function QRControls({ options, onChange }: QRControlsProps) {
    const handleChange = (key: string, value: any) => {
        onChange({ ...options, [key]: value });
    };

    const handleDeepChange = (parent: string, key: string, value: any) => {
        onChange({
            ...options,
            [parent]: {
                //@ts-ignore
                ...options[parent],
                [key]: value,
            },
        });
    };

    return (
        <Card className="h-full glass border-white/10">
            <CardHeader>
                <CardTitle>Customize QR</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="content" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                        <TabsTrigger value="style">Style</TabsTrigger>
                        <TabsTrigger value="logo">Logo</TabsTrigger>
                    </TabsList>

                    <TabsContent value="templates" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <Button
                                variant="outline"
                                className="w-full h-auto py-4 flex flex-col gap-2 border-dashed"
                                onClick={() => {
                                    const randomOpts = generateRandomOptions();
                                    onChange({ ...options, ...randomOpts });
                                }}
                            >
                                <Wand2 className="w-6 h-6 text-primary" />
                                <span className="font-semibold">Surprise Me (Random)</span>
                                <span className="text-xs text-muted-foreground font-normal">Generate unique style</span>
                            </Button>

                            {PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => onChange({ ...options, ...preset.options })}
                                    className="flex flex-col items-start gap-1 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-all text-left group"
                                >
                                    <span className="font-semibold group-hover:text-primary transition-colors">{preset.name}</span>
                                    <span className="text-xs text-muted-foreground">{preset.description}</span>
                                </button>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="content" className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Content Type</Label>
                                <Select defaultValue="url" onValueChange={(val) => {
                                    // Reset data when type changes to avoid confusion
                                    if (val === 'wifi') handleChange("data", "WIFI:T:WPA;S:MyNetwork;P:password;;");
                                    else if (val === 'vcard') handleChange("data", "BEGIN:VCARD\nVERSION:3.0\nN:Doe;John;;;\nTEL:1234567890\nEND:VCARD");
                                    else handleChange("data", "https://example.com");
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="url">URL / Text</SelectItem>
                                        <SelectItem value="wifi">WiFi Network</SelectItem>
                                        <SelectItem value="vcard">Search Contact (VCard)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Data</Label>
                                <Input
                                    value={options.data}
                                    onChange={(e) => handleChange("data", e.target.value)}
                                    placeholder="Enter content..."
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Edit the raw data string above or use a generator (Simple implementation for now).
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="style" className="space-y-4">
                        {/* Dots Style */}
                        <div className="space-y-2">
                            <Label>Dots Style</Label>
                            <Select
                                value={options.dotsOptions?.type}
                                onValueChange={(val: any) => handleDeepChange("dotsOptions", "type", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="square">Square</SelectItem>
                                    <SelectItem value="dots">Dots</SelectItem>
                                    <SelectItem value="rounded">Rounded</SelectItem>
                                    <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                                    <SelectItem value="classy">Classy</SelectItem>
                                    <SelectItem value="classy-rounded">Classy Rounded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Colors */}
                        <Tabs defaultValue="solid" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="solid">Solid</TabsTrigger>
                                <TabsTrigger value="gradient">Gradient</TabsTrigger>
                            </TabsList>

                            <TabsContent value="solid" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label>Primary Color</Label>
                                    <DebouncedColorPicker
                                        value={typeof options.dotsOptions?.color === 'string' ? options.dotsOptions?.color : "#000000"}
                                        onChange={(newColor) => {
                                            onChange({
                                                ...options,
                                                dotsOptions: { ...options.dotsOptions, color: newColor },
                                                cornersSquareOptions: { ...options.cornersSquareOptions, color: newColor },
                                                cornersDotOptions: { ...options.cornersDotOptions, color: newColor }
                                            });
                                        }}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="gradient" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label>Gradient Type</Label>
                                    <Select
                                        onValueChange={(val: string) => {
                                            handleDeepChange("dotsOptions", "gradient", {
                                                ...options.dotsOptions?.gradient,
                                                type: val,
                                                colorStops: options.dotsOptions?.gradient?.colorStops || [{ offset: 0, color: "#000000" }, { offset: 1, color: "#ffffff" }]
                                            });
                                        }}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="linear">Linear</SelectItem>
                                            <SelectItem value="radial">Radial</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Color</Label>
                                        <DebouncedColorPicker
                                            value={options.dotsOptions?.gradient?.colorStops?.[0]?.color || "#000000"}
                                            onChange={(val) => {
                                                const currentStops = options.dotsOptions?.gradient?.colorStops || [{ offset: 0, color: "#000000" }, { offset: 1, color: "#ffffff" }];
                                                const newStops = [...currentStops];
                                                newStops[0] = { ...newStops[0], color: val, offset: 0 };
                                                handleDeepChange("dotsOptions", "gradient", {
                                                    ...options.dotsOptions?.gradient,
                                                    type: options.dotsOptions?.gradient?.type || "linear",
                                                    colorStops: newStops
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Color</Label>
                                        <DebouncedColorPicker
                                            value={options.dotsOptions?.gradient?.colorStops?.[1]?.color || "#ffffff"}
                                            onChange={(val) => {
                                                const currentStops = options.dotsOptions?.gradient?.colorStops || [{ offset: 0, color: "#000000" }, { offset: 1, color: "#ffffff" }];
                                                const newStops = [...currentStops];
                                                newStops[1] = { ...newStops[1], color: val, offset: 1 };
                                                handleDeepChange("dotsOptions", "gradient", {
                                                    ...options.dotsOptions?.gradient,
                                                    type: options.dotsOptions?.gradient?.type || "linear",
                                                    colorStops: newStops
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="space-y-2">
                            <Label>Background Color</Label>
                            <DebouncedColorPicker
                                value={options.backgroundOptions?.color}
                                onChange={(val) => handleDeepChange("backgroundOptions", "color", val)}
                            />
                        </div>

                        {/* Corner Square Style */}
                        <div className="space-y-2">
                            <Label>Corners Square Style</Label>
                            <Select
                                value={options.cornersSquareOptions?.type || "default"}
                                onValueChange={(val: string) => handleDeepChange("cornersSquareOptions", "type", val === "default" ? undefined : val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Same as dots" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Same as dots</SelectItem>
                                    <SelectItem value="square">Square</SelectItem>
                                    <SelectItem value="dot">Dot</SelectItem>
                                    <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>

                    <TabsContent value="logo" className="space-y-4">
                        <div className="space-y-2">
                            <Label>Upload Logo</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            handleChange("image", reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <p className="text-xs text-muted-foreground">Or paste a URL</p>
                            <Input
                                value={options.image}
                                onChange={(e) => handleChange("image", e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
