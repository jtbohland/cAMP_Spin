import { useState, useRef, useCallback, useEffect } from "react";
import { type Challenge } from "@/lib/wheel-deal-data.js";
import { DebriefCard } from "./DebriefCard.js";
import { useApi } from "@/hooks/useApi.js";
import { toast } from "sonner";

type SelfScores = {
  clarity: number;
  conversational: number;
  credibility: number;
  close: number;
};

type ChallengeCardProps = {
  challenge: Challenge;
  isMultiplayer: boolean;
  spinId: number | null;
  onSpinRecorded: (data: {
    productId: string;
    challengeType: string;
    cheatPeek: boolean;
    selfClarity: number | null;
    selfConversational: number | null;
    selfCredibility: number | null;
    selfClose: number | null;
    timerUsed: boolean;
    timerExpired: boolean;
  }) => void;
};

export default function ChallengeCard({ challenge, isMultiplayer, spinId, onSpinRecorded }: ChallengeCardProps) {
  const [showCheat, setShowCheat] = useState(false);
  const [cheatPeeked, setCheatPeeked] = useState(false);
  const [timerSecs, setTimerSecs] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const [timerUsed, setTimerUsed] = useState(false);
  const [assessmentDone, setAssessmentDone] = useState(false);
  const [showDebrief, setShowDebrief] = useState(true);

  // Self-eval 4C scores (1-3 each)
  const [selfClarity, setSelfClarity] = useState(0);
  const [selfTone, setSelfTone] = useState(0);
  const [selfCredibility, setSelfCredibility] = useState(0);
  const [selfClose, setSelfClose] = useState(0);

  // Coach scorecard scores
  const [coachClarity, setCoachClarity] = useState(0);
  const [coachTone, setCoachTone] = useState(0);
  const [coachCredibility, setCoachCredibility] = useState(0);
  const [coachClose, setCoachClose] = useState(0);
  const [coachName, setCoachName] = useState("");
  const [coachSubmitted, setCoachSubmitted] = useState(false);
  const { run: recordRating, loading: ratingLoading } = useApi("RecordPeerRating");
  const [timerDoneEarly, setTimerDoneEarly] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = useCallback(() => {
    if (timerActive) return;
    setTimerActive(true);
    setTimerUsed(true);
    timerRef.current = setInterval(() => {
      setTimerSecs((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [timerActive]);

  const handleDone = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);
    setTimerDoneEarly(true);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);
    setTimerSecs(120);
    setTimerDoneEarly(false);
  }, []);

  const handleCheatPeek = useCallback(() => {
    if (!showCheat) setCheatPeeked(true);
    setShowCheat((prev) => !prev);
  }, [showCheat]);

  const handleSubmitAssessment = useCallback(() => {
    setAssessmentDone(true);
    onSpinRecorded({
      productId: challenge.product.id,
      challengeType: challenge.type,
      cheatPeek: cheatPeeked,
      selfClarity,
      selfConversational: selfTone,
      selfCredibility,
      selfClose,
      timerUsed,
      timerExpired: timerSecs === 0 && !timerDoneEarly,
    });
  }, [challenge, cheatPeeked, selfClarity, selfTone, selfCredibility, selfClose, timerUsed, timerSecs, timerDoneEarly, onSpinRecorded]);

  const color = challenge.product.color;
  const timerColor = timerSecs <= 30 ? "#E53935" : timerSecs <= 60 ? "#F57C00" : "var(--color-foreground)";

  // Build self-scores object for debrief (null if not yet assessed)
  const selfScores: SelfScores | null = assessmentDone
    ? { clarity: selfClarity, conversational: selfTone, credibility: selfCredibility, close: selfClose }
    : null;

  return (
    <div className="w-full max-w-lg rounded-xl p-5 border text-left" style={{ borderColor: color, background: "var(--color-card)" }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{challenge.icon}</span>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>{challenge.label}</div>
          <div className="text-xs text-muted-foreground">{challenge.product.icon} {challenge.product.name}</div>
        </div>
      </div>

      {/* Prompt */}
      <p className="text-[15px] font-semibold text-foreground leading-snug mb-2">
        &ldquo;{challenge.prompt}&rdquo;
      </p>
      <p className="text-xs text-muted-foreground mb-4">{challenge.hint}</p>

      {/* Timer */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl font-bold font-mono tabular-nums" style={{ color: timerColor }}>
          {String(Math.floor(timerSecs / 60)).padStart(2, "0")}:{String(timerSecs % 60).padStart(2, "0")}
        </span>
        {!timerActive && timerSecs === 120 && !timerDoneEarly && (
          <button onClick={startTimer} className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#2962FF] hover:bg-[#1e50d4] transition-colors">
            Start Timer
          </button>
        )}
        {timerActive && (
          <>
            <button onClick={handleDone} className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#00C853] hover:bg-[#00a844] transition-colors">
              Done
            </button>
            <button onClick={resetTimer} className="px-3 py-1.5 rounded-md text-xs font-semibold text-muted-foreground bg-muted hover:bg-muted/80 transition-colors">
              Reset
            </button>
          </>
        )}
        {!timerActive && timerSecs < 120 && timerSecs > 0 && !timerDoneEarly && (
          <>
            <button onClick={startTimer} className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#2962FF] hover:bg-[#1e50d4] transition-colors">
              Resume
            </button>
            <button onClick={resetTimer} className="px-3 py-1.5 rounded-md text-xs font-semibold text-muted-foreground bg-muted hover:bg-muted/80 transition-colors">
              Reset
            </button>
          </>
        )}
        {timerSecs === 0 && (
          <>
            <span className="text-xs font-semibold text-red-500">Time's up!</span>
            <button onClick={resetTimer} className="px-3 py-1.5 rounded-md text-xs font-semibold text-muted-foreground bg-muted hover:bg-muted/80 transition-colors">
              Reset
            </button>
          </>
        )}
        {timerDoneEarly && timerSecs > 0 && (
          <>
            <span className="text-xs font-semibold text-green-600">Done! — Great pace 👏</span>
            <button onClick={resetTimer} className="px-3 py-1.5 rounded-md text-xs font-semibold text-muted-foreground bg-muted hover:bg-muted/80 transition-colors">
              Reset
            </button>
          </>
        )}
      </div>

      {/* Cheat sheet toggle */}
      <button
        onClick={handleCheatPeek}
        className="px-4 py-2 rounded-lg text-xs font-semibold transition-all border mb-3"
        style={{ borderColor: `${color}66`, color }}
      >
        {showCheat ? "Hide cheat sheet" : "Show cheat sheet"}
      </button>

      {showCheat && (
        <div className="bg-background rounded-lg p-3 border border-border mb-4">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Your cheat sheet</div>
          {challenge.type === "pitch" && (
            <p className="text-sm text-foreground/90 leading-relaxed italic">{challenge.product.happyHour}</p>
          )}
          {challenge.type === "objection" && (
            <>
              <div className="text-xs text-red-500 font-bold mb-1">Pivot:</div>
              <p className="text-sm text-foreground/90 leading-relaxed">&ldquo;{challenge.answer}&rdquo;</p>
            </>
          )}
          {challenge.type === "scenario" && (
            <p className="text-sm text-foreground/90 leading-relaxed italic">{challenge.product.happyHour}</p>
          )}
          {challenge.type === "challenger" && challenge.product.challengerPlay && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-foreground">Reframe:</div>
              <p className="text-sm text-foreground/90 leading-relaxed"><strong>A:</strong> {challenge.product.challengerPlay.reframe.a}</p>
              <p className="text-sm text-foreground/90 leading-relaxed"><strong>Gap:</strong> {challenge.product.challengerPlay.reframe.gap}</p>
              <p className="text-sm text-foreground/90 leading-relaxed"><strong>B:</strong> {challenge.product.challengerPlay.reframe.b}</p>
              <div className="mt-2 pt-2 border-t border-border">
                <div className="text-xs font-bold text-foreground mb-1">Lead With:</div>
                <p className="text-sm text-foreground/90 italic">{challenge.product.challengerPlay.leadWith}</p>
              </div>
            </div>
          )}
          {(challenge.type === "pitch" || challenge.type === "scenario") && (
            <p className="text-sm text-foreground/90 leading-relaxed italic mt-2.5 pt-2.5 border-t border-border">
              Close: {challenge.product.followUpAsk}
            </p>
          )}
        </div>
      )}

      {/* Self-assessment — 4Cs rated 1-3 (matches coach scorecard) */}
      {!assessmentDone && (timerSecs === 0 || timerDoneEarly) && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">🫵🏼</span>
              <p className="text-sm font-semibold text-foreground">How Did You Do?</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Rate yourself honestly on each category — this will be compared with your coach's scores.</p>
            <p className="text-[10px] text-muted-foreground mb-3 italic">1 = Needs work · 2 = Solid · 3 = Nailed it</p>

            <div className="space-y-2 mb-4">
              <RatingRow label="Clarity" description="Were you concise and easy to follow?" value={selfClarity} onChange={setSelfClarity} />
              <RatingRow label="Conversational Tone" description="Did it feel natural, not scripted?" value={selfTone} onChange={setSelfTone} />
              <RatingRow label="Credibility" description="Did you speak about the product correctly?" value={selfCredibility} onChange={setSelfCredibility} />
              <RatingRow label="Close" description="Did you end with a compelling ask?" value={selfClose} onChange={setSelfClose} />
            </div>

            <button
              onClick={() => {
                if (selfClarity === 0 || selfTone === 0 || selfCredibility === 0 || selfClose === 0) {
                  toast.error("Rate all 4 categories");
                  return;
                }
                handleSubmitAssessment();
              }}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: color }}
            >
              Submit Self-Evaluation
            </button>
          </div>
        </div>
      )}

      {/* Coach Scorecard — inline form for presenter to enter coach's verbal feedback */}
      {assessmentDone && isMultiplayer && !coachSubmitted && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">📋</span>
              <p className="text-sm font-semibold text-foreground">Coach Scorecard</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Ask your coach to rate you verbally (1-3) on each category, then enter their scores below.</p>
            <p className="text-[10px] text-muted-foreground mb-3 italic">1 = Needs work · 2 = Solid · 3 = Nailed it</p>

            {/* Coach name */}
            <input
              type="text"
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
              placeholder="Coach's name"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm mb-3 bg-background"
            />

            {/* Score inputs */}
            <div className="space-y-2 mb-4">
              <RatingRow label="Clarity" description="Were they concise and easy to follow?" value={coachClarity} onChange={setCoachClarity} />
              <RatingRow label="Conversational Tone" description="Did it feel natural, not scripted?" value={coachTone} onChange={setCoachTone} />
              <RatingRow label="Credibility" description="Did they speak about the product correctly?" value={coachCredibility} onChange={setCoachCredibility} />
              <RatingRow label="Close" description="Did they end with a compelling ask?" value={coachClose} onChange={setCoachClose} />
            </div>

            {/* Submit */}
            <button
              onClick={async () => {
                if (!coachName.trim()) { toast.error("Enter coach's name"); return; }
                if (coachClarity === 0 || coachTone === 0 || coachCredibility === 0 || coachClose === 0) { toast.error("Rate all 4 categories"); return; }
                if (!spinId) { toast.error("Still recording spin — try again in a moment"); return; }
                try {
                  await recordRating({
                    spinId,
                    observerName: coachName.trim(),
                    clarityScore: coachClarity,
                    conversationalScore: coachTone,
                    credibilityScore: coachCredibility,
                    closeScore: coachClose,
                  });
                  setCoachSubmitted(true);
                  toast.success("Coach scores recorded!");
                } catch {
                  toast.error("Failed to save — try again");
                }
              }}
              disabled={ratingLoading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {ratingLoading ? "Saving..." : "Submit Coach Scores"}
            </button>
          </div>
        </div>
      )}

      {coachSubmitted && (
        <div className="mt-3 pt-3 border-t border-border text-center">
          <p className="text-sm text-green-600 font-semibold">✅ Coach scores recorded — see debrief below!</p>
        </div>
      )}

      {/* Debrief Card — polls for observer ratings */}
      {isMultiplayer && assessmentDone && spinId && showDebrief && (
        <DebriefCard spinId={spinId} selfScores={selfScores} onDismiss={() => setShowDebrief(false)} />
      )}
    </div>
  );
}

function RatingRow({ label, description, value, onChange }: { label: string; description: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-lg border text-sm font-semibold transition ${
              value === n
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:border-primary/50"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
