"use client";

import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    pdf,
} from "@react-pdf/renderer";

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
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    logo?: string;
    template: "corporate" | "modern" | "classic";
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
    primaryColor: string;
}

// Dynamic styles based on template and color
const createStyles = (template: "corporate" | "modern" | "classic", primaryColor: string) => {
    const isModern = template === "modern";
    const isClassic = template === "classic";

    return StyleSheet.create({
        page: {
            backgroundColor: "#ffffff",
            padding: 40,
            fontFamily: "Helvetica",
            fontSize: 10,
            color: "#333333",
            ...(isClassic && {
                borderWidth: 3,
                borderColor: primaryColor,
                borderStyle: "solid",
            }),
        },
        // Modern template - sidebar accent
        headerModern: {
            flexDirection: "row" as const,
            marginBottom: 30,
        },
        modernAccent: {
            width: 6,
            backgroundColor: primaryColor,
            marginRight: 20,
            borderRadius: 3,
        },
        modernContent: {
            flex: 1,
            flexDirection: "row" as const,
            justifyContent: "space-between" as const,
        },
        // Corporate template - bottom border
        headerCorporate: {
            flexDirection: "row" as const,
            justifyContent: "space-between" as const,
            marginBottom: 30,
            paddingBottom: 20,
            borderBottomWidth: 2,
            borderBottomColor: primaryColor,
        },
        // Classic template - centered with decorative elements
        headerClassic: {
            alignItems: "center" as const,
            marginBottom: 30,
            paddingBottom: 20,
            borderBottomWidth: 2,
            borderBottomColor: primaryColor,
        },
        classicBadge: {
            marginTop: 15,
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderWidth: 2,
            borderColor: primaryColor,
            borderRadius: 4,
        },
        headerRow: {
            flexDirection: "row" as const,
            justifyContent: "space-between" as const,
        },
        senderInfo: {
            maxWidth: isClassic ? "100%" : "50%",
            alignItems: isClassic ? "center" as const : "flex-start" as const,
        },
        logoRow: {
            flexDirection: "row" as const,
            alignItems: "center" as const,
            gap: 10,
            marginBottom: 4,
        },
        logo: {
            width: isClassic ? 60 : 50,
            height: isClassic ? 60 : 50,
            objectFit: "contain" as const,
            marginBottom: 8,
        },
        senderName: {
            fontSize: isClassic ? 22 : 18,
            fontFamily: "Helvetica-Bold",
            marginBottom: 4,
            color: "#1f2937",
            textAlign: isClassic ? "center" as const : "left" as const,
        },
        senderDetail: {
            fontSize: 9,
            color: "#6b7280",
            marginBottom: 2,
            textAlign: isClassic ? "center" as const : "left" as const,
        },
        invoiceTitle: {
            alignItems: isClassic ? "center" as const : "flex-end" as const,
        },
        invoiceLabel: {
            fontSize: isClassic ? 28 : 24,
            fontFamily: "Helvetica-Bold",
            color: primaryColor,
            marginBottom: 4,
            ...(isClassic && { letterSpacing: 3 }),
        },
        invoiceNumber: {
            fontSize: 10,
            color: "#6b7280",
        },
        infoSection: {
            flexDirection: isClassic ? "column" as const : "row" as const,
            justifyContent: "space-between" as const,
            marginBottom: 30,
            alignItems: isClassic ? "center" as const : "flex-start" as const,
            gap: isClassic ? 20 : 0,
        },
        billTo: {
            maxWidth: isClassic ? "100%" : "50%",
            alignItems: isClassic ? "center" as const : "flex-start" as const,
        },
        sectionTitle: {
            fontSize: 8,
            fontFamily: "Helvetica-Bold",
            color: isModern ? primaryColor : "#9ca3af",
            textTransform: "uppercase" as const,
            letterSpacing: 1,
            marginBottom: 6,
            textAlign: isClassic ? "center" as const : "left" as const,
        },
        clientName: {
            fontSize: 12,
            fontFamily: "Helvetica-Bold",
            marginBottom: 4,
            color: "#1f2937",
            textAlign: isClassic ? "center" as const : "left" as const,
        },
        clientDetail: {
            fontSize: 9,
            color: "#6b7280",
            marginBottom: 2,
            textAlign: isClassic ? "center" as const : "left" as const,
        },
        dates: {
            alignItems: isClassic ? "center" as const : "flex-end" as const,
        },
        dateRow: {
            flexDirection: "row" as const,
            marginBottom: 4,
        },
        dateLabel: {
            fontSize: 9,
            color: "#6b7280",
            width: 70,
        },
        dateValue: {
            fontSize: 9,
            fontFamily: "Helvetica-Bold",
            color: "#1f2937",
        },
        table: {
            marginBottom: 30,
        },
        tableHeader: {
            flexDirection: "row" as const,
            backgroundColor: isModern ? primaryColor : "#f3f4f6",
            paddingVertical: 10,
            paddingHorizontal: 8,
            borderBottomWidth: isModern ? 0 : 1,
            borderBottomColor: "#e5e7eb",
        },
        tableHeaderText: {
            fontSize: 9,
            fontFamily: "Helvetica-Bold",
            color: isModern ? "#ffffff" : "#374151",
            textTransform: "uppercase" as const,
        },
        tableRow: {
            flexDirection: "row" as const,
            paddingVertical: 10,
            paddingHorizontal: 8,
            borderBottomWidth: 1,
            borderBottomColor: "#f3f4f6",
        },
        colDescription: {
            flex: 3,
        },
        colQty: {
            flex: 1,
            textAlign: "right" as const,
        },
        colRate: {
            flex: 1,
            textAlign: "right" as const,
        },
        colAmount: {
            flex: 1,
            textAlign: "right" as const,
        },
        totalsSection: {
            alignItems: isClassic ? "center" as const : "flex-end" as const,
            marginBottom: 30,
        },
        totalsBox: {
            width: 200,
        },
        totalRow: {
            flexDirection: "row" as const,
            justifyContent: "space-between" as const,
            paddingVertical: 4,
        },
        totalLabel: {
            fontSize: 9,
            color: "#6b7280",
        },
        totalValue: {
            fontSize: 9,
            color: "#1f2937",
        },
        grandTotalRow: {
            flexDirection: "row" as const,
            justifyContent: "space-between" as const,
            paddingVertical: 8,
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            marginTop: 4,
        },
        grandTotalLabel: {
            fontSize: 12,
            fontFamily: "Helvetica-Bold",
            color: "#1f2937",
        },
        grandTotalValue: {
            fontSize: 12,
            fontFamily: "Helvetica-Bold",
            color: primaryColor,
        },
        notesSection: {
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            paddingTop: 20,
            alignItems: isClassic ? "center" as const : "flex-start" as const,
        },
        notesTitle: {
            fontSize: 8,
            fontFamily: "Helvetica-Bold",
            color: "#9ca3af",
            textTransform: "uppercase" as const,
            letterSpacing: 1,
            marginBottom: 6,
        },
        notesText: {
            fontSize: 9,
            color: "#6b7280",
            lineHeight: 1.5,
            textAlign: isClassic ? "center" as const : "left" as const,
        },
    });
};

// Currency formatter
const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        PHP: "₱",
    };
    const symbol = symbols[currency] || "$";
    return `${symbol}${amount.toFixed(2)}`;
};

// PDF Document Component
const InvoicePDFDocument = ({ data }: { data: InvoiceData }) => {
    const styles = createStyles(data.template || "corporate", data.primaryColor || "#3b82f6");
    const isModern = data.template === "modern";
    const isClassic = data.template === "classic";

    const discountAmount =
        data.discountType === "percentage"
            ? data.subtotal * (data.discountValue / 100)
            : data.discountValue;

    // Render header based on template
    const renderHeader = () => {
        if (isModern) {
            // Modern template: Sidebar accent
            return (
                <View style={styles.headerModern}>
                    <View style={styles.modernAccent} />
                    <View style={styles.modernContent}>
                        <View style={styles.senderInfo}>
                            {data.logo && (
                                <Image src={data.logo} style={styles.logo} />
                            )}
                            <Text style={styles.senderName}>
                                {data.sender.name || "Your Business"}
                            </Text>
                            {data.sender.email && (
                                <Text style={styles.senderDetail}>{data.sender.email}</Text>
                            )}
                            {data.sender.phone && (
                                <Text style={styles.senderDetail}>{data.sender.phone}</Text>
                            )}
                        </View>
                        <View style={styles.invoiceTitle}>
                            <Text style={styles.invoiceLabel}>INVOICE</Text>
                            <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
                        </View>
                    </View>
                </View>
            );
        }

        if (isClassic) {
            // Classic template: Centered elegant
            return (
                <View style={styles.headerClassic}>
                    {data.logo && (
                        <Image src={data.logo} style={styles.logo} />
                    )}
                    <Text style={styles.senderName}>
                        {data.sender.name || "Your Business"}
                    </Text>
                    {data.sender.email && (
                        <Text style={styles.senderDetail}>{data.sender.email}</Text>
                    )}
                    <View style={styles.classicBadge}>
                        <Text style={styles.invoiceLabel}>INVOICE</Text>
                        <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
                    </View>
                </View>
            );
        }

        // Corporate template: Classic with border
        return (
            <View style={styles.headerCorporate}>
                <View style={styles.senderInfo}>
                    {data.logo && (
                        <Image src={data.logo} style={styles.logo} />
                    )}
                    <Text style={styles.senderName}>
                        {data.sender.name || "Your Business"}
                    </Text>
                    {data.sender.email && (
                        <Text style={styles.senderDetail}>{data.sender.email}</Text>
                    )}
                    {data.sender.phone && (
                        <Text style={styles.senderDetail}>{data.sender.phone}</Text>
                    )}
                    {data.sender.address && (
                        <Text style={styles.senderDetail}>{data.sender.address}</Text>
                    )}
                </View>
                <View style={styles.invoiceTitle}>
                    <Text style={styles.invoiceLabel}>INVOICE</Text>
                    <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
                </View>
            </View>
        );
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                {renderHeader()}

                {/* Bill To & Dates */}
                <View style={styles.infoSection}>
                    <View style={styles.billTo}>
                        <Text style={styles.sectionTitle}>BILL TO</Text>
                        <Text style={styles.clientName}>
                            {data.client.name || "Client Name"}
                        </Text>
                        {data.client.email && (
                            <Text style={styles.clientDetail}>{data.client.email}</Text>
                        )}
                        {data.client.phone && (
                            <Text style={styles.clientDetail}>{data.client.phone}</Text>
                        )}
                        {data.client.address && (
                            <Text style={styles.clientDetail}>{data.client.address}</Text>
                        )}
                    </View>
                    <View style={styles.dates}>
                        <View style={styles.dateRow}>
                            <Text style={styles.dateLabel}>Issue Date:</Text>
                            <Text style={styles.dateValue}>{data.issueDate}</Text>
                        </View>
                        <View style={styles.dateRow}>
                            <Text style={styles.dateLabel}>Due Date:</Text>
                            <Text style={styles.dateValue}>{data.dueDate}</Text>
                        </View>
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.colDescription]}>
                            Description
                        </Text>
                        <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
                        <Text style={[styles.tableHeaderText, styles.colRate]}>Rate</Text>
                        <Text style={[styles.tableHeaderText, styles.colAmount]}>
                            Amount
                        </Text>
                    </View>

                    {/* Table Rows */}
                    {data.items.map((item) => (
                        <View key={item.id} style={styles.tableRow}>
                            <Text style={styles.colDescription}>
                                {item.description || "Item"}
                            </Text>
                            <Text style={styles.colQty}>{item.quantity}</Text>
                            <Text style={styles.colRate}>
                                {formatCurrency(item.rate, data.currency)}
                            </Text>
                            <Text style={styles.colAmount}>
                                {formatCurrency(item.quantity * item.rate, data.currency)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View style={styles.totalsBox}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Subtotal</Text>
                            <Text style={styles.totalValue}>
                                {formatCurrency(data.subtotal, data.currency)}
                            </Text>
                        </View>
                        {data.discountValue > 0 && (
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>
                                    Discount{" "}
                                    {data.discountType === "percentage"
                                        ? `(${data.discountValue}%)`
                                        : ""}
                                </Text>
                                <Text style={[styles.totalValue, { color: "#10b981" }]}>
                                    -{formatCurrency(discountAmount, data.currency)}
                                </Text>
                            </View>
                        )}
                        {data.taxRate > 0 && (
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>
                                    {data.taxLabel} ({data.taxRate}%)
                                </Text>
                                <Text style={styles.totalValue}>
                                    {formatCurrency(data.taxAmount, data.currency)}
                                </Text>
                            </View>
                        )}
                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>Total</Text>
                            <Text style={styles.grandTotalValue}>
                                {formatCurrency(data.total, data.currency)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Notes */}
                {data.notes && (
                    <View style={styles.notesSection}>
                        <Text style={styles.notesTitle}>Notes</Text>
                        <Text style={styles.notesText}>{data.notes}</Text>
                    </View>
                )}
            </Page>
        </Document>
    );
};

// Export function to generate PDF blob
export const generateInvoicePDF = async (data: InvoiceData): Promise<Blob> => {
    const blob = await pdf(<InvoicePDFDocument data={data} />).toBlob();
    return blob;
};

export default InvoicePDFDocument;
