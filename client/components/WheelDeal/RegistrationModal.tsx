import { useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi.js";
import { toast } from "sonner";

const ROLES = [
  "SDR",
  "Velocity AE",
  "Emerging AE",
  "Majors AE",
  "Strat AE",
  "SE",
  "PSM",
  "TSM",
  "Renewals",
  "Admin",
];

// Sentinel value for the "my manager isn't listed" write-in path
const MANAGER_OTHER = "Other";

const MANAGERS = [
  "Adam Yapkowitz",
  "Alice Steels",
  "Anush Arora",
  "Brian Wagner",
  "Gamon Yaklich",
  "Halle Morris",
  "Jeremy Grinbaum",
  "Jessica Arnold",
  "Joe Skupinsky",
  "Kazuki Hirose",
  "Kevin Shain",
  "Kier Johnson",
  "Lauren Hargarten",
  "Lee Edwards",
  "Madhuri Krishnan",
  "Maggie Peracchi",
  "Mathieu Di Franco",
  "Matt Bennett",
  "Nick Iyengar",
  "Nick Ryan",
  "Nicolette Conti",
  "Rhiannon Sheehan",
  "Rob Bow",
  "Shawn Hensley",
  "Tansu Yegen",
  MANAGER_OTHER,
];

const REGIONS = [
  { value: "NAMER", label: "🌎 NAMER (Americas)" },
  { value: "EMEA", label: "🌍 EMEA (Europe, Middle East & Africa)" },
  { value: "AAPJ", label: "🌏 AAPJ (Asia, Australia, Pacific & Japan)" },
];

type RegistrationModalProps = {
  defaultName: string;
  onComplete: () => void;
};

export default function RegistrationModal({ defaultName, onComplete }: RegistrationModalProps) {
  const [name, setName] = useState(defaultName);
  const [role, setRole] = useState("");
  const [manager, setManager] = useState("");
  const [otherManager, setOtherManager] = useState("");
  const [region, setRegion] = useState("");
  const { run: saveProfile, loading } = useApi("SaveProfile");

  const isOtherManager = manager === MANAGER_OTHER;
  // When "Other" is picked we save the typed name, so analytics groups by a real person
  const resolvedManager = isOtherManager ? otherManager.trim() : manager;

  const isComplete =
    name.trim() !== "" &&
    role !== "" &&
    region !== "" &&
    resolvedManager !== "";

  const handleSubmit = useCallback(async () => {
    if (!isComplete) return;
    try {
      await saveProfile({ name: name.trim(), role, manager: resolvedManager, region });
      toast.success("Profile saved! Let's spin! 🎡");
      onComplete();
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : String(error);
      toast.error("Error saving profile: " + message);
    }
  }, [isComplete, name, role, resolvedManager, region, saveProfile, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(74, 29, 142, 0.85)" }}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center" style={{ background: "linear-gradient(135deg, #4A1D8E 0%, #6B3FA0 100%)" }}>
          <span className="text-4xl block mb-2">🎡</span>
          <h2 className="text-xl font-bold text-white mb-1">Welcome to Wheel & Deal!</h2>
          <p className="text-sm text-purple-200">Tell us a bit about yourself before you spin.</p>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#4A1D8E]/50 focus:border-[#4A1D8E]"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#4A1D8E]/50 focus:border-[#4A1D8E] appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
            >
              <option value="" disabled>Select your role</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Manager */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Manager</label>
            <select
              value={manager}
              onChange={(e) => {
                const next = e.target.value;
                setManager(next);
                if (next !== MANAGER_OTHER) setOtherManager("");
              }}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#4A1D8E]/50 focus:border-[#4A1D8E] appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
            >
              <option value="" disabled>Select your manager</option>
              {MANAGERS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {isOtherManager && (
              <input
                type="text"
                value={otherManager}
                onChange={(e) => setOtherManager(e.target.value)}
                placeholder="Manager's first and last name"
                autoFocus
                className="mt-2 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#4A1D8E]/50 focus:border-[#4A1D8E]"
              />
            )}
          </div>

          {/* Region */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#4A1D8E]/50 focus:border-[#4A1D8E] appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
            >
              <option value="" disabled>Select your timezone region</option>
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit area */}
        <div className="px-6 pb-6">
          {isComplete ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
              style={{ background: "linear-gradient(135deg, #4A1D8E 0%, #7C3AED 50%, #4A1D8E 100%)" }}
            >
              {loading ? "Saving..." : "🎡 SPIN. THAT. WHEEL!"}
            </button>
          ) : (
            <div className="w-full py-3.5 rounded-xl text-sm font-medium text-muted-foreground text-center bg-muted border border-border">
              Fill in all fields above to unlock the wheel
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
