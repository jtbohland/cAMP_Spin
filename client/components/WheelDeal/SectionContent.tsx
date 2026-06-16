import { SECTIONS, type Product } from "@/lib/wheel-deal-data.js";

type SectionContentProps = {
  product: Product;
  activeSection: string;
  onSectionChange: (key: string) => void;
};

export default function SectionContent({ product, activeSection, onSectionChange }: SectionContentProps) {
  const color = product.color;

  function renderContent() {
    switch (activeSection) {
      case "oneLiner":
        return (
          <div className="rounded-lg p-4 border" style={{ borderColor: `${color}33`, background: "var(--color-card)" }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color }}>One-Liner</div>
            <p className="text-xs text-muted-foreground mb-2">The headline. One sentence, no setup needed.</p>
            <p className="text-sm text-foreground/90 italic border-l-3 pl-3" style={{ borderColor: color }}>{product.oneLiner}</p>
          </div>
        );
      case "happyHour":
        return (
          <div className="rounded-lg p-4 border" style={{ borderColor: `${color}33`, background: "var(--color-card)" }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color }}>Happy Hour</div>
            <p className="text-xs text-muted-foreground mb-2">Casual, story-led. Keep it under 2 minutes.</p>
            <p className="text-sm text-foreground/90 italic border-l-3 pl-3" style={{ borderColor: color }}>{product.happyHour}</p>
          </div>
        );
      case "linkedinDrop":
        return (
          <div className="rounded-lg p-4 border" style={{ borderColor: `${color}33`, background: "var(--color-card)" }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color }}>LinkedIn Drop</div>
            <p className="text-xs text-muted-foreground mb-2">Slightly more polished, post-worthy.</p>
            <p className="text-sm text-foreground/90 italic border-l-3 pl-3" style={{ borderColor: color }}>{product.linkedinDrop}</p>
          </div>
        );
      case "aiAngle":
        return (
          <div className="rounded-lg p-4 border" style={{ borderColor: `${color}33`, background: "var(--color-card)" }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color }}>AI Angle</div>
            <p className="text-xs text-muted-foreground mb-2">Connect it to the Amplitude AI ecosystem.</p>
            <p className="text-sm text-foreground/90 leading-relaxed">{product.aiAngle}</p>
          </div>
        );
      case "challengerPlay":
        return (
          <div className="rounded-lg p-4 border" style={{ borderColor: `${color}33`, background: "var(--color-card)" }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color }}>Challenger Play</div>
            <p className="text-xs text-muted-foreground mb-3">Lead with insight, not product. Reframe the problem.</p>
            {product.challengerPlay ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-foreground mb-2">The Reframe (A → Gap → B)</div>
                  <div className="space-y-2 bg-background rounded-lg p-3 border border-border">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">A — What they believe</span>
                      <p className="text-sm text-foreground/90 leading-relaxed mt-0.5">{product.challengerPlay.reframe.a}</p>
                    </div>
                    <div className="border-t border-border pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Gap — What they're missing</span>
                      <p className="text-sm text-foreground/90 leading-relaxed mt-0.5">{product.challengerPlay.reframe.gap}</p>
                    </div>
                    <div className="border-t border-border pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>B — The new world</span>
                      <p className="text-sm text-foreground/90 leading-relaxed mt-0.5">{product.challengerPlay.reframe.b}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="text-xs font-bold text-foreground mb-1">Core Insight</div>
                  <p className="text-sm text-foreground/90 italic border-l-3 pl-3" style={{ borderColor: color }}>{product.challengerPlay.insight}</p>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="text-xs font-bold text-foreground mb-1">Lead With</div>
                  <p className="text-sm text-foreground/90 italic border-l-3 pl-3" style={{ borderColor: color }}>{product.challengerPlay.leadWith}</p>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="text-xs font-bold text-red-500 mb-1">NOT With</div>
                  <p className="text-sm text-foreground/90 border-l-3 pl-3 border-red-300">{product.challengerPlay.notWith}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Challenger play content coming soon for this product.</p>
            )}
          </div>
        );
      case "objections":
        return (
          <div className="rounded-lg p-4 border" style={{ borderColor: `${color}33`, background: "var(--color-card)" }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color }}>Objection Pivot</div>
            <p className="text-xs text-muted-foreground mb-3">Natural one-liners when they push back.</p>
            {product.objections.map((o, i) => (
              <div key={i} className="rounded-lg p-3 mb-2 border border-border bg-background">
                <div className="text-xs font-bold text-red-500 mb-1">They say: &ldquo;{o.they}&rdquo;</div>
                <div className="text-sm text-foreground/90">You: &ldquo;{o.you}&rdquo;</div>
              </div>
            ))}
          </div>
        );
      case "followUpAsk":
        return (
          <div className="rounded-lg p-4 border" style={{ borderColor: `${color}33`, background: "var(--color-card)" }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color }}>Follow-Up Ask</div>
            <p className="text-xs text-muted-foreground mb-2">Move it forward without killing the vibe.</p>
            <p className="text-sm text-foreground/90 italic border-l-3 pl-3" style={{ borderColor: color }}>{product.followUpAsk}</p>
          </div>
        );
      case "whatNotToSay":
        return (
          <div className="rounded-lg p-4 border" style={{ borderColor: `${color}33`, background: "var(--color-card)" }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color }}>What NOT to Say</div>
            <p className="text-xs text-muted-foreground mb-3">Common mistakes that make new AEs sound like a brochure.</p>
            {product.whatNotToSay.map((item, i) => (
              <div key={i} className="flex gap-2 py-2 border-b border-border last:border-b-0">
                <span className="text-sm shrink-0">⚠️</span>
                <span className="text-sm text-foreground/90 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        );
      case "connectionPlay":
        return (
          <div className="rounded-lg p-4 border" style={{ borderColor: `${color}33`, background: "var(--color-card)" }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color }}>Connection Play</div>
            <p className="text-xs text-muted-foreground mb-2">Bridge from this product to another mid-conversation.</p>
            <p className="text-sm text-foreground/90 italic border-l-3 pl-3" style={{ borderColor: color }}>{product.connectionPlay}</p>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Pick Your Cheat Sheet</p>
      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {SECTIONS.map((sec) => (
          <button
            key={sec.key}
            onClick={() => onSectionChange(sec.key)}
            className="px-2 py-1.5 rounded-full text-[11px] font-semibold transition-all border text-center whitespace-nowrap"
            style={{
              background: activeSection === sec.key ? color : "transparent",
              borderColor: activeSection === sec.key ? color : "var(--color-border)",
              color: activeSection === sec.key ? "#fff" : "var(--color-muted-foreground)",
            }}
          >
            {sec.label}
          </button>
        ))}
      </div>
      {renderContent()}
    </div>
  );
}
