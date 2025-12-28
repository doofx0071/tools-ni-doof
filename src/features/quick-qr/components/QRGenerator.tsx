"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling, {
    Options as QRCodeOptions,
    FileExtension,
} from "qr-code-styling";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Default options
const defaultOptions: QRCodeOptions = {
    width: 300,
    height: 300,
    type: "svg",
    data: "https://tools-ni-doof.com",
    image: "",
    dotsOptions: {
        color: "#4267b2",
        type: "rounded",
    },
    backgroundOptions: {
        color: "#ffffff",
    },
    imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
    },
};

interface QRGeneratorProps {
    options: QRCodeOptions;
    onDownload?: (extension: FileExtension) => void;
}

export default function QRGenerator({ options }: QRGeneratorProps) {
    const ref = useRef<HTMLDivElement>(null);
    const qrCode = useRef<QRCodeStyling | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && !qrCode.current) {
            qrCode.current = new QRCodeStyling(defaultOptions);
        }

        if (ref.current && qrCode.current) {
            qrCode.current.append(ref.current);
        }
    }, []);

    useEffect(() => {
        if (!qrCode.current) return;
        qrCode.current.update(options);
    }, [options]);

    const handleDownload = (ext: FileExtension) => {
        qrCode.current?.download({ extension: ext });
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6 p-6">
            <Card className="p-8 bg-white rounded-3xl shadow-2xl border-0 overflow-hidden relative group">
                {/* QR Container */}
                <div ref={ref} className="bg-white" />

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl" />
            </Card>

            <div className="flex gap-4">
                <Button onClick={() => handleDownload("png")} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    PNG
                </Button>
                <Button onClick={() => handleDownload("svg")} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    SVG
                </Button>
            </div>
        </div>
    );
}
