"use client";

import React, { useState } from "react";
import "./styles/tool.css";
import GeneratorLayout, { GeneratorTab } from "./components/GeneratorLayout";
import IdentityGenerator from "./components/generators/IdentityGenerator";
import CreditCardGenerator from "./components/generators/CreditCardGenerator";
import IbanGenerator from "./components/generators/IbanGenerator";
import InvoiceGenerator from "./components/generators/InvoiceGenerator";

export default function GenStackTool() {
  const [activeTab, setActiveTab] = useState<GeneratorTab>("identity");

  return (
    <div className="tool-genstack min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <GeneratorLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === "identity" && <IdentityGenerator />}
        {activeTab === "credit-card" && <CreditCardGenerator />}
        {activeTab === "iban" && <IbanGenerator />}
        {activeTab === "invoice" && <InvoiceGenerator />}
      </GeneratorLayout>
    </div>
  );
}