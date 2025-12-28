"use client";

import React, { useState } from "react";
import "./styles/tool.css";
import QRGenerator from "@/features/quick-qr/components/QRGenerator";
import QRControls from "@/features/quick-qr/components/QRControls";
import { Options } from "qr-code-styling";

const initialOptions: Options = {
  width: 300,
  height: 300,
  type: "svg",
  data: "https://tools-ni-doof.com",
  image: "",
  dotsOptions: {
    color: "#8b5cf6", // Violet default
    type: "rounded",
  },
  backgroundOptions: {
    color: "#ffffff",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 10,
  },
  cornersSquareOptions: {
    type: "extra-rounded",
  },
  cornersDotOptions: {
    type: "dot",
  }
};

export default function QuickQR() {
  const [options, setOptions] = useState<Options>(initialOptions);

  return (
    <div className="tool-quick-qr min-h-screen bg-background text-foreground animate-in fade-in duration-500 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Quick QR</h1>
          <p className="text-muted-foreground">Generate premium styles for your links.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Preview Section - Sticky on desktop */}
          <div className="md:col-span-5 lg:col-span-4 order-2 md:order-1">
            <div className="sticky top-8">
              <QRGenerator options={options} />
            </div>
          </div>

          {/* Controls Section */}
          <div className="md:col-span-7 lg:col-span-8 order-1 md:order-2">
            <QRControls options={options} onChange={setOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
