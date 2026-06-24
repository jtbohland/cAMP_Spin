import { useState, useCallback, useEffect } from "react";
import { PRODUCTS, type Product } from "@/lib/wheel-deal-data.js";
import { useApi } from "@/hooks/useApi.js";
import WelcomeTab from "@/components/WheelDeal/WelcomeTab.js";
import CheatSheetsTab from "@/components/WheelDeal/CheatSheetsTab.js";
import SpinWheelTab from "@/components/WheelDeal/SpinWheel.js";
import LeaderboardTab from "@/components/WheelDeal/LeaderboardTab.js";
import AnalyticsTab from "@/components/WheelDeal/AnalyticsTab.js";

const TABS = [
  { id: "welcome", label: "👋 Welcome" },
  { id: "cheatsheet", label: "📝 Cheat Sheets" },
  { id: "wheel", label: "🎡 Spin the Wheel" },
  { id: "leaderboard", label: "🏆 Leaderboard" },
  { id: "analytics", label: "📊 Analytics" },
];

export default function Page1Component() {
  const [activeTab, setActiveTab] = useState("welcome");
  const [activeProduct, setActiveProduct] = useState<Product>(PRODUCTS[0]);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const { run: recordVisit } = useApi("RecordVisit");

  // Record page visit on mount — fire and forget
  useEffect(() => {
    recordVisit({}).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProductLand = useCallback((product: Product) => {
    setActiveProduct(product);
  }, []);

  return (
    <div className="min-h-screen text-foreground font-sans" style={{ background: '#F3EDFC' }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3" style={{ background: '#4A1D8E', borderBottom: '1px solid #5B2BA6' }}>
        <span className="text-2xl">🎡</span>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">Wheel & Deal</h1>
          <p className="text-xs text-purple-200">Two minutes. No slides. No jargon. A real answer to "so what does Amplitude do?"</p>
        </div>
      </div>

      {/* Mode banner */}
      <div
        className="px-5 py-3 border-b flex items-center justify-between"
        style={{
          background: isMultiplayer ? "rgba(0,200,83,0.06)" : "rgba(41,98,255,0.04)",
          borderColor: isMultiplayer ? "rgba(0,200,83,0.2)" : "var(--color-border)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{isMultiplayer ? "🧑\u200d🤝\u200d🧑" : "👤"}</span>
          <div>
            <span className="text-sm font-semibold text-foreground">
              {isMultiplayer ? "Multiplayer Mode" : "Solo Mode"}
            </span>
            <p className="text-xs text-muted-foreground">
              {isMultiplayer
                ? "Practice with a coach — share the link so they can rate you silently on clarity, tone, and close."
                : "Practice on your own — spin, respond, and self-assess your delivery."}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsMultiplayer(!isMultiplayer)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all border"
          style={{
            background: isMultiplayer ? "#00C853" : "#2962FF",
            borderColor: isMultiplayer ? "#00C853" : "#2962FF",
            color: "#fff",
          }}
        >
          <span>{isMultiplayer ? "👤" : "🧑\u200d🤝\u200d🧑"}</span>
          {isMultiplayer ? "Switch to Solo" : "Switch to Multiplayer"}
        </button>
      </div>

      {/* Tab nav */}
      <div className="flex bg-card border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-5 py-3 text-[13px] font-medium transition-colors border-b-2"
            style={{
              color: activeTab === tab.id ? "var(--color-foreground)" : "var(--color-muted-foreground)",
              borderBottomColor: activeTab === tab.id ? "#2962FF" : "transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="p-5 max-w-[900px] mx-auto">
        {activeTab === "welcome" && <WelcomeTab onNavigate={setActiveTab} />}
        {activeTab === "cheatsheet" && (
          <CheatSheetsTab activeProduct={activeProduct} onProductChange={setActiveProduct} />
        )}
        {activeTab === "wheel" && (
          <SpinWheelTab onProductLand={handleProductLand} isMultiplayer={isMultiplayer} />
        )}
        {activeTab === "leaderboard" && <LeaderboardTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  );
}
