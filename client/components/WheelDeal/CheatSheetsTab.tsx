import { useState } from "react";
import { PRODUCTS, type Product } from "@/lib/wheel-deal-data.js";
import SectionContent from "./SectionContent.js";
import ResourcesSection from "./ResourcesSection.js";

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

      <ResourcesSection product={activeProduct} />

      {/* AI Maturity Assessment callout — cross-product */}
      <div className="mt-5 relative overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-amber-500/10 p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.12),transparent_50%)]" />
        <div className="relative">
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 mb-2">
            <span className="text-lg">🚀</span> Level Up Your Value Conversations
          </h3>
          <p className="text-xs italic text-foreground/70 mb-3">
            "You know the product — now connect it to where your prospect actually is."
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Use the <strong className="text-foreground">AI Maturity Assessment</strong> to figure out where your prospect sits on the maturity curve (Classic → Self-Improving), then tailor your pitch to meet them there. The best reps don't just pitch features — they diagnose where the customer is and show them what's next.
          </p>
          <a
            href="https://claude.ai/design/p/11187613-4ecd-453b-936b-f92fdf832019?file=Maturity%20Assessment.dc.html&present=1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:scale-105 transition-transform"
          >
            🎯 Open AI Maturity Assessment
          </a>
        </div>
      </div>
    </div>
  );
}
