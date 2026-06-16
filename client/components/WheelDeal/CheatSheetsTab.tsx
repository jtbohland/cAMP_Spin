import { useState } from "react";
import { PRODUCTS, type Product } from "@/lib/wheel-deal-data.js";
import SectionContent from "./SectionContent.js";

type CheatSheetsTabProps = {
  activeProduct: Product;
  onProductChange: (product: Product) => void;
};

export default function CheatSheetsTab({ activeProduct, onProductChange }: CheatSheetsTabProps) {
  const [activeSection, setActiveSection] = useState("happyHour");

  function handleProductSelect(product: Product) {
    onProductChange(product);
    setActiveSection("happyHour");
  }

  return (
    <div>
      {/* Product selector - prominent */}
      <div className="mb-5">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Pick Your Product</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRODUCTS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProductSelect(p)}
              className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold transition-all border text-center min-h-[56px]"
              style={{
                background: activeProduct.id === p.id ? p.color : "var(--color-card)",
                borderColor: activeProduct.id === p.id ? p.color : "var(--color-border)",
                color: activeProduct.id === p.id ? "#fff" : "var(--color-foreground)",
              }}
            >
              <span className="text-lg flex-shrink-0">{p.icon}</span>
              <span className="leading-tight">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product header */}
      <div
        className="rounded-xl p-4 mb-4 flex items-start gap-3 border"
        style={{ borderColor: `${activeProduct.color}44`, background: "var(--color-card)" }}
      >
        <span className="text-3xl">{activeProduct.icon}</span>
        <div>
          <p className="text-xl font-bold text-foreground mb-0.5">{activeProduct.name}</p>
          <p className="text-xs text-muted-foreground italic">{activeProduct.tagline}</p>
        </div>
      </div>

      {/* Section nav + content */}
      <SectionContent
        product={activeProduct}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
    </div>
  );
}
