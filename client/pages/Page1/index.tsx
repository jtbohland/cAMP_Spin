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
  const [evalPending, setEvalPending] = useState(false);
  const { run: recordVisit } = useApi("RecordVisit");

  // Record page visit on mount — fire and forget
  useEffect(() => {
    recordVisit({}).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProductLand = useCallback((product: Product) => {
    setActiveProduct(product);
  }, []);

  const handleEvalPendingChange = useCallback((pending: boolean) => {
    setEvalPending(pending);
  }, []);

  const handleTabClick = useCallback((tabId: string) => {
    // Block tab switching when eval is pending
    if (evalPending && tabId !== "wheel") return;
    setActiveTab(tabId);
  }, [evalPending]);

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

      {/* Eval pending banner — visible across all tabs */}
      {evalPending && activeTab !== "wheel" && (
        <div className="px-5 py-2.5 bg-red-50 border-b border-red-200 text-center">
          <p className="text-xs font-semibold text-red-700">
            🔒 You have an incomplete evaluation. <button onClick={() => setActiveTab("wheel")} className="underline font-bold">Go back to complete it</button>
          </p>
        </div>
      )}

      {/* Tab nav */}
      <div className="flex bg-card border-b border-border">
        {TABS.map((tab) => {
          const isLocked = evalPending && tab.id !== "wheel";
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              disabled={isLocked}
              className="px-5 py-3 text-[13px] font-medium transition-colors border-b-2 disabled:cursor-not-allowed"
              style={{
                color: isLocked
                  ? "var(--color-muted-foreground)"
                  : activeTab === tab.id
                  ? "var(--color-foreground)"
                  : "var(--color-muted-foreground)",
                borderBottomColor: activeTab === tab.id ? "#2962FF" : "transparent",
                opacity: isLocked ? 0.4 : 1,
              }}
            >
              {isLocked ? "🔒 " : ""}{tab.label}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className={`p-5 mx-auto ${activeTab === "leaderboard" || activeTab === "analytics" ? "max-w-[1200px]" : "max-w-[900px]"}`}>
        {activeTab === "welcome" && <WelcomeTab onNavigate={setActiveTab} />}
        {activeTab === "cheatsheet" && (
          <CheatSheetsTab activeProduct={activeProduct} onProductChange={setActiveProduct} />
        )}
        {activeTab === "wheel" && (
          <SpinWheelTab
            onProductLand={handleProductLand}
            isMultiplayer={isMultiplayer}
            onModeToggle={() => setIsMultiplayer((m) => !m)}
            onEvalPendingChange={handleEvalPendingChange}
          />
        )}
        {activeTab === "leaderboard" && <LeaderboardTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  );
}
