"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { generateInvoicePDF } from "./InvoicePDF";
import {
    Plus, Trash2, Download, Save, RefreshCcw,
    Building2, User, FileText, Palette,
    GripVertical, Loader2, ImagePlus, X, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface LineItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    taxable: boolean;
    amount: number;
}

interface InvoiceData {
    status: "draft" | "finalized";
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    logo?: string;
    sender: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    client: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    items: LineItem[];
    currency: string;
    subtotal: number;
    discountType: "fixed" | "percentage";
    discountValue: number;
    taxLabel: string;
    taxRate: number;
    taxAmount: number;
    total: number;
    notes?: string;
    terms?: string;
    template: "corporate" | "modern" | "classic";
    primaryColor: string;
}

// Default empty invoice
const createEmptyInvoice = (): InvoiceData => ({
    status: "draft",
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    sender: { name: "", email: "", phone: "", address: "" },
    client: { name: "", email: "", phone: "", address: "" },
    items: [{ id: crypto.randomUUID(), description: "", quantity: 1, rate: 0, taxable: true, amount: 0 }],
    currency: "USD",
    subtotal: 0,
    discountType: "percentage",
    discountValue: 0,
    taxLabel: "Tax",
    taxRate: 0,
    taxAmount: 0,
    total: 0,
    template: "corporate",
    primaryColor: "#3b82f6",
});

// Currency formatter
const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
    }).format(amount);
};

export default function InvoiceGenerator() {
    const draft = useQuery(api.genstack.queries.getDraft);
    const createInvoice = useMutation(api.genstack.mutations.create);
    const updateInvoice = useMutation(api.genstack.mutations.update);

    const [invoice, setInvoice] = useState<InvoiceData>(createEmptyInvoice());
    const [invoiceId, setInvoiceId] = useState<Id<"invoices"> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<"sender" | "client" | "items" | "settings">("sender");
    const invoicePreviewRef = useRef<HTMLDivElement>(null);

    // Load draft on mount
    useEffect(() => {
        if (draft) {
            setInvoice(draft as unknown as InvoiceData);
            setInvoiceId(draft._id);
        }
    }, [draft]);

    // Recalculate totals when items or pricing changes
    useEffect(() => {
        const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

        let discountAmount = 0;
        if (invoice.discountType === "percentage") {
            discountAmount = subtotal * (invoice.discountValue / 100);
        } else {
            discountAmount = invoice.discountValue;
        }

        const afterDiscount = subtotal - discountAmount;
        const taxableAmount = invoice.items
            .filter(item => item.taxable)
            .reduce((sum, item) => sum + (item.quantity * item.rate), 0);
        const taxAmount = (taxableAmount - (taxableAmount / subtotal * discountAmount || 0)) * (invoice.taxRate / 100);
        const total = afterDiscount + taxAmount;

        setInvoice(prev => ({
            ...prev,
            subtotal,
            taxAmount: isNaN(taxAmount) ? 0 : taxAmount,
            total: isNaN(total) ? subtotal - discountAmount : total,
            items: prev.items.map(item => ({ ...item, amount: item.quantity * item.rate }))
        }));
    }, [invoice.items.length, invoice.discountType, invoice.discountValue, invoice.taxRate]);

    // Save invoice
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Strip Convex internal fields before saving
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _id, _creationTime, ...cleanInvoice } = invoice as typeof invoice & { _id?: string; _creationTime?: number };

            if (invoiceId) {
                await updateInvoice({ id: invoiceId, invoice: cleanInvoice });
            } else {
                const id = await createInvoice({ invoice: cleanInvoice });
                setInvoiceId(id);
            }
            toast.success("Invoice saved!");
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save invoice");
        }
        setIsSaving(false);
    };

    // Export PDF - Show preview first
    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            // Generate PDF using @react-pdf/renderer
            const blob = await generateInvoicePDF(invoice);

            // Create preview URL
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            setShowPreview(true);
        } catch (error) {
            console.error("PDF export error:", error);
            toast.error("Failed to generate PDF");
        }
        setIsExporting(false);
    };

    // Download the PDF
    const handleDownloadPDF = () => {
        if (!previewUrl) return;

        const link = document.createElement("a");
        link.href = previewUrl;
        link.download = `${invoice.invoiceNumber.toLowerCase().replace(/\s+/g, "-")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("PDF downloaded!");
    };

    // Close preview and cleanup
    const handleClosePreview = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setShowPreview(false);
    };

    // Add item
    const addItem = () => {
        setInvoice(prev => ({
            ...prev,
            items: [...prev.items, { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0, taxable: true, amount: 0 }]
        }));
    };

    // Remove item
    const removeItem = (id: string) => {
        if (invoice.items.length === 1) return;
        setInvoice(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    // Update item
    const updateItem = (id: string, field: keyof LineItem, value: any) => {
        setInvoice(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    // Section buttons
    const sections = [
        { id: "sender", label: "Your Business", icon: Building2 },
        { id: "client", label: "Client", icon: User },
        { id: "items", label: "Line Items", icon: FileText },
        { id: "settings", label: "Settings", icon: Palette },
    ] as const;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Invoice Generator</h2>
                    <p className="text-muted-foreground text-sm">Create professional invoices with real-time preview</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setInvoice(createEmptyInvoice())} className="gap-2">
                        <RefreshCcw className="w-4 h-4" />
                        New
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Draft
                    </Button>
                    <Button variant="outline" onClick={handleExportPDF} disabled={isExporting} className="gap-2">
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Split Screen Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Panel - Editor */}
                <div className="space-y-4">
                    {/* Section Tabs */}
                    <div className="flex gap-1 p-1 bg-muted rounded-lg">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer",
                                    activeSection === section.id
                                        ? "bg-background shadow-sm text-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <section.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{section.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Section Content */}
                    <div className="p-5 rounded-2xl border bg-card/50 min-h-[400px]">
                        {activeSection === "sender" && (
                            <div className="space-y-5">
                                <h3 className="font-semibold flex items-center gap-2 mb-4">
                                    <Building2 className="w-4 h-4" /> Your Business Details
                                </h3>

                                {/* Logo Upload */}
                                <div className="space-y-2">
                                    <Label>Logo (optional)</Label>
                                    <div
                                        className={cn(
                                            "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5",
                                            invoice.logo ? "border-primary/30 bg-primary/5" : "border-muted-foreground/25"
                                        )}
                                        onClick={() => document.getElementById('logo-upload')?.click()}
                                    >
                                        {invoice.logo ? (
                                            <div className="relative inline-block">
                                                <img src={invoice.logo} alt="Logo" className="h-16 object-contain" />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setInvoice(prev => ({ ...prev, logo: undefined }));
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:scale-110 transition-transform cursor-pointer"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 py-2">
                                                <ImagePlus className="w-8 h-8 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">Click to upload logo</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        id="logo-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setInvoice(prev => ({ ...prev, logo: event.target?.result as string }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </div>

                                <div className="grid gap-5">
                                    <div className="space-y-1.5">
                                        <Label>Business Name</Label>
                                        <Input
                                            value={invoice.sender.name}
                                            onChange={(e) => setInvoice(prev => ({ ...prev, sender: { ...prev.sender, name: e.target.value } }))}
                                            placeholder="Your Company Name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                value={invoice.sender.email}
                                                onChange={(e) => setInvoice(prev => ({ ...prev, sender: { ...prev.sender, email: e.target.value } }))}
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Phone</Label>
                                            <Input
                                                value={invoice.sender.phone}
                                                onChange={(e) => setInvoice(prev => ({ ...prev, sender: { ...prev.sender, phone: e.target.value } }))}
                                                placeholder="+1 234 567 8900"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Address</Label>
                                        <Textarea
                                            value={invoice.sender.address}
                                            onChange={(e) => setInvoice(prev => ({ ...prev, sender: { ...prev.sender, address: e.target.value } }))}
                                            placeholder="123 Business St, City, State 12345"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === "client" && (
                            <div className="space-y-5">
                                <h3 className="font-semibold flex items-center gap-2 mb-4">
                                    <User className="w-4 h-4" /> Bill To
                                </h3>
                                <div className="grid gap-5">
                                    <div className="space-y-1.5">
                                        <Label>Client Name</Label>
                                        <Input
                                            value={invoice.client.name}
                                            onChange={(e) => setInvoice(prev => ({ ...prev, client: { ...prev.client, name: e.target.value } }))}
                                            placeholder="Client Company Name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                value={invoice.client.email}
                                                onChange={(e) => setInvoice(prev => ({ ...prev, client: { ...prev.client, email: e.target.value } }))}
                                                placeholder="client@example.com"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Phone</Label>
                                            <Input
                                                value={invoice.client.phone}
                                                onChange={(e) => setInvoice(prev => ({ ...prev, client: { ...prev.client, phone: e.target.value } }))}
                                                placeholder="+1 234 567 8900"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Address</Label>
                                        <Textarea
                                            value={invoice.client.address}
                                            onChange={(e) => setInvoice(prev => ({ ...prev, client: { ...prev.client, address: e.target.value } }))}
                                            placeholder="456 Client Ave, City, State 67890"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === "items" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Line Items
                                    </h3>
                                    <Button size="sm" variant="outline" onClick={addItem} className="gap-1">
                                        <Plus className="w-4 h-4" /> Add Item
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {invoice.items.map((item, index) => (
                                        <div key={item.id} className="p-3 rounded-lg border bg-background/50 space-y-3">
                                            <div className="flex items-start gap-2">
                                                <GripVertical className="w-4 h-4 mt-2 text-muted-foreground cursor-grab" />
                                                <div className="flex-1 space-y-2">
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                                        placeholder="Item description"
                                                    />
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Qty</Label>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Rate</Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.rate}
                                                                onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Amount</Label>
                                                            <div className="h-9 px-3 flex items-center rounded-md border bg-muted text-sm font-medium">
                                                                {formatCurrency(item.quantity * item.rate, invoice.currency)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => removeItem(item.id)}
                                                    disabled={invoice.items.length === 1}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === "settings" && (
                            <div className="space-y-5">
                                <h3 className="font-semibold flex items-center gap-2 mb-4">
                                    <Palette className="w-4 h-4" /> Invoice Settings
                                </h3>
                                <div className="grid gap-5">
                                    {/* Invoice Number & Currency */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label>Invoice Number</Label>
                                            <Input
                                                value={invoice.invoiceNumber}
                                                onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Currency</Label>
                                            <Select value={invoice.currency} onValueChange={(v) => setInvoice(prev => ({ ...prev, currency: v }))}>
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD ($)</SelectItem>
                                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                                    <SelectItem value="PHP">PHP (₱)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label>Issue Date</Label>
                                            <Input
                                                type="date"
                                                value={invoice.issueDate}
                                                onChange={(e) => setInvoice(prev => ({ ...prev, issueDate: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Due Date</Label>
                                            <Input
                                                type="date"
                                                value={invoice.dueDate}
                                                onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Tax */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label>Tax Label</Label>
                                            <Input
                                                value={invoice.taxLabel}
                                                onChange={(e) => setInvoice(prev => ({ ...prev, taxLabel: e.target.value }))}
                                                placeholder="Tax"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Tax Rate (%)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={invoice.taxRate}
                                                onChange={(e) => setInvoice(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Discount */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label>Discount Type</Label>
                                            <Select value={invoice.discountType} onValueChange={(v: "fixed" | "percentage") => setInvoice(prev => ({ ...prev, discountType: v }))}>
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Discount Value</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={invoice.discountValue}
                                                onChange={(e) => setInvoice(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Template Selection */}
                                    <div className="space-y-3">
                                        <Label>Template Style</Label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: "corporate" as const, label: "Corporate", desc: "Clean & Professional" },
                                                { id: "modern" as const, label: "Modern", desc: "Sleek Sidebar Accent" },
                                                { id: "classic" as const, label: "Classic", desc: "Elegant & Traditional" },
                                            ].map((tmpl) => (
                                                <button
                                                    key={tmpl.id}
                                                    onClick={() => setInvoice(prev => ({ ...prev, template: tmpl.id }))}
                                                    className={cn(
                                                        "p-3 rounded-xl border-2 text-left transition-all cursor-pointer hover:border-primary/50",
                                                        invoice.template === tmpl.id
                                                            ? "border-primary bg-primary/10 shadow-sm"
                                                            : "border-muted hover:bg-muted/50"
                                                    )}
                                                >
                                                    <div className="font-medium text-sm">{tmpl.label}</div>
                                                    <div className="text-xs text-muted-foreground">{tmpl.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Color Picker */}
                                    <div className="space-y-3">
                                        <Label>Accent Color</Label>
                                        <div className="flex items-center gap-3">
                                            {/* Color Presets */}
                                            <div className="flex gap-2">
                                                {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"].map((color) => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setInvoice(prev => ({ ...prev, primaryColor: color }))}
                                                        className={cn(
                                                            "w-8 h-8 rounded-full transition-all cursor-pointer hover:scale-110",
                                                            invoice.primaryColor === color && "ring-2 ring-offset-2 ring-foreground"
                                                        )}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                            {/* Custom Color Picker */}
                                            <div className="relative">
                                                <input
                                                    type="color"
                                                    value={invoice.primaryColor}
                                                    onChange={(e) => setInvoice(prev => ({ ...prev, primaryColor: e.target.value }))}
                                                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-muted"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-1.5">
                                        <Label>Notes</Label>
                                        <Textarea
                                            value={invoice.notes || ""}
                                            onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="Additional notes for the client..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Preview */}
                <div ref={invoicePreviewRef} data-invoice-preview className="p-6 rounded-2xl border bg-white text-black shadow-lg min-h-[600px] lg:sticky lg:top-6 lg:self-start">
                    {/* Invoice Preview */}
                    <div className={cn(
                        "space-y-6",
                        invoice.template === "classic" && "border-4 border-double p-4 -m-2",
                    )} style={invoice.template === "classic" ? { borderColor: invoice.primaryColor } : {}}>
                        {/* Header */}
                        {invoice.template === "modern" ? (
                            /* Modern Template: Sidebar accent */
                            <div className="flex">
                                <div className="w-2 rounded-l-lg mr-4" style={{ backgroundColor: invoice.primaryColor }} />
                                <div className="flex-1 flex justify-between items-start pb-4">
                                    <div>
                                        {invoice.logo && (
                                            <img src={invoice.logo} alt="Logo" className="h-12 object-contain mb-2" />
                                        )}
                                        <h1 className="text-2xl font-bold">{invoice.sender.name || "Your Business"}</h1>
                                        <p className="text-sm opacity-70">{invoice.sender.email}</p>
                                        <p className="text-sm opacity-70">{invoice.sender.phone}</p>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-xl font-bold" style={{ color: invoice.primaryColor }}>INVOICE</h2>
                                        <p className="text-sm font-mono">{invoice.invoiceNumber}</p>
                                    </div>
                                </div>
                            </div>
                        ) : invoice.template === "classic" ? (
                            /* Classic Template: Elegant with decorative elements */
                            <div className="text-center pb-4 border-b-2" style={{ borderColor: invoice.primaryColor }}>
                                {invoice.logo && (
                                    <img src={invoice.logo} alt="Logo" className="h-16 object-contain mx-auto mb-3" />
                                )}
                                <h1 className="text-3xl font-serif font-bold mb-1">{invoice.sender.name || "Your Business"}</h1>
                                <p className="text-sm text-gray-600">{invoice.sender.email} • {invoice.sender.phone}</p>
                                <div className="mt-4 inline-block px-6 py-2 border-2 rounded" style={{ borderColor: invoice.primaryColor }}>
                                    <h2 className="text-lg font-bold tracking-widest" style={{ color: invoice.primaryColor }}>INVOICE</h2>
                                    <p className="text-sm font-mono">{invoice.invoiceNumber}</p>
                                </div>
                            </div>
                        ) : (
                            /* Corporate Template: Clean professional */
                            <div className="flex justify-between items-start pb-4 border-b" style={{ borderColor: invoice.primaryColor }}>
                                <div>
                                    {invoice.logo && (
                                        <img src={invoice.logo} alt="Logo" className="h-12 object-contain mb-2" />
                                    )}
                                    <h1 className="text-2xl font-bold">{invoice.sender.name || "Your Business"}</h1>
                                    <p className="text-sm opacity-70">{invoice.sender.email}</p>
                                    <p className="text-sm opacity-70">{invoice.sender.phone}</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-bold" style={{ color: invoice.primaryColor }}>INVOICE</h2>
                                    <p className="text-sm font-mono">{invoice.invoiceNumber}</p>
                                </div>
                            </div>
                        )}

                        {/* Dates & Client */}
                        <div className={cn("grid grid-cols-2 gap-6", invoice.template === "classic" && "grid-cols-1 text-center")}>
                            <div>
                                <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">Bill To</h3>
                                <p className="font-semibold">{invoice.client.name || "Client Name"}</p>
                                <p className="text-sm text-gray-600">{invoice.client.email}</p>
                                <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.client.address}</p>
                            </div>
                            <div className={cn("text-right", invoice.template === "classic" && "text-center")}>
                                <div className="text-sm">
                                    <span className="text-gray-500">Issue Date: </span>
                                    <span className="font-medium">{invoice.issueDate}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-500">Due Date: </span>
                                    <span className="font-medium">{invoice.dueDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left p-3 font-semibold">Description</th>
                                        <th className="text-right p-3 font-semibold w-20">Qty</th>
                                        <th className="text-right p-3 font-semibold w-24">Rate</th>
                                        <th className="text-right p-3 font-semibold w-28">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item, idx) => (
                                        <tr key={item.id} className={idx % 2 === 1 ? "bg-gray-50/50" : ""}>
                                            <td className="p-3">{item.description || "Item description"}</td>
                                            <td className="text-right p-3">{item.quantity}</td>
                                            <td className="text-right p-3">{formatCurrency(item.rate, invoice.currency)}</td>
                                            <td className="text-right p-3 font-medium">{formatCurrency(item.quantity * item.rate, invoice.currency)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                                </div>
                                {invoice.discountValue > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount {invoice.discountType === "percentage" ? `(${invoice.discountValue}%)` : ""}</span>
                                        <span>-{formatCurrency(invoice.discountType === "percentage" ? invoice.subtotal * invoice.discountValue / 100 : invoice.discountValue, invoice.currency)}</span>
                                    </div>
                                )}
                                {invoice.taxRate > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">{invoice.taxLabel} ({invoice.taxRate}%)</span>
                                        <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t font-bold text-lg">
                                    <span>Total</span>
                                    <span style={{ color: invoice.primaryColor }}>{formatCurrency(invoice.total, invoice.currency)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="pt-4 border-t">
                                <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">Notes</h3>
                                <p className="text-sm text-gray-600">{invoice.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PDF Preview Modal */}
            <Dialog open={showPreview} onOpenChange={(open) => !open && handleClosePreview()}>
                <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            Invoice Preview - {invoice.invoiceNumber}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden">
                        {previewUrl && (
                            <iframe
                                src={previewUrl}
                                className="w-full h-full border-0"
                                title="Invoice Preview"
                            />
                        )}
                    </div>
                    <DialogFooter className="p-4 border-t gap-2">
                        <Button variant="outline" onClick={handleClosePreview}>
                            Close
                        </Button>
                        <Button onClick={handleDownloadPDF} className="gap-2">
                            <Download className="w-4 h-4" />
                            Download PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
