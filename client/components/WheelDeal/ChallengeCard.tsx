import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { type Challenge, type Product } from "@/lib/wheel-deal-data.js";
import { DebriefCard } from "./DebriefCard.js";
import { AiDebriefCard } from "./AiDebriefCard.js";
import { useApi } from "@/hooks/useApi.js";
import { toast } from "sonner";

type SelfScores = {
  clarity: number;
  conversational: number;
  credibility: number;
  close: number;
};

type AiScores = {
  clarity: number;
  conversational: number;
  credibility: number;
  close: number;
  totalScore: number;
  feedbackBullets: string[];
  isCopied: boolean;
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
    completionScore: number;
    timerUsed: boolean;
    timerExpired: boolean;
    pitchSeconds: number | null;
  }) => void;
  onEvalComplete: () => void;
};

const STUDY_DURATION = 30;
const PITCH_DURATION = 120;
const MAX_WORDS = 200;
const MIN_WORDS = 25;

// Phases for solo typed pitch mode
type SoloPhase = "study" | "pitch" | "selfEval" | "aiScoring" | "debrief";

export default function ChallengeCard({ challenge, isMultiplayer, spinId, onSpinRecorded, onEvalComplete }: ChallengeCardProps) {
  // ─── MULTIPLAYER STATE (verbal pitch, unchanged) ───
  const [showCheat, setShowCheat] = useState(false);
  const [cheatPeeked, setCheatPeeked] = useState(false);
  const [timerSecs, setTimerSecs] = useState(PITCH_DURATION);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const pitchSecondsRef = useRef<number | null>(null);

  // ─── SOLO TYPED PITCH STATE ───
  const [soloPhase, setSoloPhase] = useState<SoloPhase>("study");
  const [studySecs, setStudySecs] = useState(STUDY_DURATION);
  const [soloPitchSecs, setSoloPitchSecs] = useState(PITCH_DURATION);
  const [pitchText, setPitchText] = useState("");
  const soloPitchSecondsRef = useRef<number | null>(null);

  // ─── COMPLETION SCORE STATE ───
  const [completionScore, setCompletionScore] = useState(0);
  const [timerExpiredSolo, setTimerExpiredSolo] = useState(false);

  // ─── COMMON EVAL STATE ───
  const [selfClarity, setSelfClarity] = useState(0);
  const [selfTone, setSelfTone] = useState(0);
  const [selfCredibility, setSelfCredibility] = useState(0);
  const [selfClose, setSelfClose] = useState(0);
  const [assessmentDone, setAssessmentDone] = useState(false);

  // ─── AI SCORING STATE ───
  const [aiScores, setAiScores] = useState<AiScores | null>(null);

  // ─── MULTIPLAYER COACH STATE ───
  const [coachClarity, setCoachClarity] = useState(0);
  const [coachTone, setCoachTone] = useState(0);
  const [coachCredibility, setCoachCredibility] = useState(0);
  const [coachClose, setCoachClose] = useState(0);
  const [coachName, setCoachName] = useState("");
  const [coachSubmitted, setCoachSubmitted] = useState(false);
  const [showDebrief, setShowDebrief] = useState(true);

  const { run: recordRating, loading: ratingLoading } = useApi("RecordPeerRating");
  const { run: scorePitch, loading: aiLoading } = useApi("ScorePitch");
  const { run: recordAiScore } = useApi("RecordAiScore");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const studyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pitchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── MULTIPLAYER: Auto-start verbal pitch timer on mount ───
  useEffect(() => {
    if (!isMultiplayer) return;
    setTimerActive(true);
    timerRef.current = setInterval(() => {
      setTimerSecs((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimerActive(false);
          setTimerDone(true);
          setCompletionScore(1); // Timer expired in multiplayer
          pitchSecondsRef.current = PITCH_DURATION;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isMultiplayer]);

  // ─── SOLO: Study phase countdown ───
  useEffect(() => {
    if (isMultiplayer || soloPhase !== "study") return;
    studyTimerRef.current = setInterval(() => {
      setStudySecs((prev) => {
        if (prev <= 1) {
          if (studyTimerRef.current) clearInterval(studyTimerRef.current);
          // Auto-transition to pitch phase
          setSoloPhase("pitch");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (studyTimerRef.current) clearInterval(studyTimerRef.current); };
  }, [isMultiplayer, soloPhase]);

  // ─── SOLO: Pitch phase countdown ───
  useEffect(() => {
    if (isMultiplayer || soloPhase !== "pitch") return;
    pitchTimerRef.current = setInterval(() => {
      setSoloPitchSecs((prev) => {
        if (prev <= 1) {
          if (pitchTimerRef.current) clearInterval(pitchTimerRef.current);
          soloPitchSecondsRef.current = PITCH_DURATION;
          setCompletionScore(1); // Timer expired
          setTimerExpiredSolo(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (pitchTimerRef.current) clearInterval(pitchTimerRef.current); };
  }, [isMultiplayer, soloPhase]);

  // Word count
  const wordCount = useMemo(() => {
    const trimmed = pitchText.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [pitchText]);

  // ─── SOLO: Auto-submit when timer expires and 25+ words ───
  useEffect(() => {
    if (!timerExpiredSolo || soloPhase !== "pitch") return;
    if (wordCount >= MIN_WORDS) {
      // Has enough words — auto-submit
      soloPitchSecondsRef.current = PITCH_DURATION;
      setSoloPhase("selfEval");
    }
    // If under MIN_WORDS, stay in pitch phase (user sees "Time's up!" banner)
  }, [timerExpiredSolo, wordCount, soloPhase]);

  // Solo: Start typing transitions from study to pitch
  const handleTypingStart = useCallback(() => {
    if (soloPhase !== "study") return;
    if (studyTimerRef.current) clearInterval(studyTimerRef.current);
    setSoloPhase("pitch");
  }, [soloPhase]);

  // Solo: Submit pitch (done button)
  const handlePitchDone = useCallback(() => {
    if (pitchTimerRef.current) clearInterval(pitchTimerRef.current);
    soloPitchSecondsRef.current = PITCH_DURATION - soloPitchSecs;
    // Calculate completion score: 3 = 30+ sec left, 2 = <30 sec, 1 = expired
    if (soloPitchSecs >= 30) {
      setCompletionScore(3);
    } else if (soloPitchSecs > 0) {
      setCompletionScore(2);
    } else {
      setCompletionScore(1);
    }
    setSoloPhase("selfEval");
  }, [soloPitchSecs]);

  // Solo: Block paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    toast.error("Paste is disabled — type your pitch!");
  }, []);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    if (words <= MAX_WORDS) {
      setPitchText(text);
    }
  }, []);

  // Multiplayer: done button
  const handleDone = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    pitchSecondsRef.current = PITCH_DURATION - timerSecs;
    // Completion score for multiplayer
    if (timerSecs >= 30) {
      setCompletionScore(3);
    } else if (timerSecs > 0) {
      setCompletionScore(2);
    } else {
      setCompletionScore(1);
    }
    setTimerActive(false);
    setTimerDone(true);
  }, [timerSecs]);

  // Multiplayer: cheat peek toggle
  const handleCheatPeek = useCallback(() => {
    if (!showCheat) setCheatPeeked(true);
    setShowCheat((prev) => !prev);
  }, [showCheat]);

  // Build rich cheat sheet context for AI — product-specific & challenge-type-aware
  const cheatSheetContent = useMemo(() => {
    const p = challenge.product;
    // Common context every challenge type benefits from
    const common = [
      `One-liner: ${p.oneLiner}`,
      `What NOT to say: ${p.whatNotToSay.join(" | ")}`,
    ];

    if (challenge.type === "pitch" || challenge.type === "scenario") {
      return [
        ...common,
        `Happy Hour Pitch: ${p.happyHour}`,
        `LinkedIn Drop: ${p.linkedinDrop}`,
        p.aiAngle ? `AI Angle: ${p.aiAngle}` : "",
        `Close / Follow-Up Ask: ${p.followUpAsk}`,
      ].filter(Boolean).join("\n\n");
    }
    if (challenge.type === "objection") {
      const allObjections = p.objections
        .map((o) => `They say: "${o.they}" → You say: "${o.you}"`)
        .join("\n");
      return [
        ...common,
        `All Objection Handles:\n${allObjections}`,
        challenge.answer ? `Specific handle for this objection: ${challenge.answer}` : "",
        `Close / Follow-Up Ask: ${p.followUpAsk}`,
      ].filter(Boolean).join("\n\n");
    }
    if (challenge.type === "challenger" && p.challengerPlay) {
      const cp = p.challengerPlay;
      return [
        ...common,
        `Challenger Reframe A: ${cp.reframe.a}`,
        `The Gap: ${cp.reframe.gap}`,
        `Challenger Reframe B: ${cp.reframe.b}`,
        `Insight: ${cp.insight}`,
        `Lead With: ${cp.leadWith}`,
        `NOT With: ${cp.notWith}`,
        `Close / Follow-Up Ask: ${p.followUpAsk}`,
      ].join("\n\n");
    }
    // Fallback
    return [...common, `Happy Hour Pitch: ${p.happyHour}`, `Close: ${p.followUpAsk}`].join("\n\n");
  }, [challenge]);

  // Self-eval submit handler
  const handleSubmitAssessment = useCallback(async () => {
    setAssessmentDone(true);

    const pitchSecs = isMultiplayer ? pitchSecondsRef.current : soloPitchSecondsRef.current;

    onSpinRecorded({
      productId: challenge.product.id,
      challengeType: challenge.type,
      cheatPeek: isMultiplayer ? cheatPeeked : true, // solo always has study phase (cheat visible)
      selfClarity,
      selfConversational: selfTone,
      selfCredibility,
      selfClose,
      completionScore,
      timerUsed: true,
      timerExpired: isMultiplayer ? timerSecs === 0 : soloPitchSecs === 0,
      pitchSeconds: pitchSecs,
    });

    if (!isMultiplayer) {
      // Solo: proceed to AI scoring
      setSoloPhase("aiScoring");
      try {
        const result = await scorePitch({
          productName: challenge.product.name,
          challengeType: challenge.type,
          challengePrompt: challenge.prompt,
          cheatSheetContent,
          pitchText,
        });
          if (result) {
          setAiScores(result);
          // Record AI scores in DB
          if (spinId) {
            try {
              await recordAiScore({
                spinId,
                pitchText,
                aiClarity: result.clarity,
                aiConversational: result.conversational,
                aiCredibility: result.credibility,
                aiClose: result.close,
                aiScore: result.totalScore + completionScore,
                aiFeedback: result.feedbackBullets,
                completionScore,
              });
            } catch {
              // non-critical — scoring still shows
            }
          }
        }
        setSoloPhase("debrief");
        onEvalComplete();
      } catch {
        toast.error("AI scoring failed — your self-eval was still recorded.");
        setSoloPhase("debrief");
        onEvalComplete();
      }
    } else {
      // Multiplayer: eval done after self-assessment (no AI)
      // Coach scores are separate
    }
  }, [
    challenge, cheatPeeked, selfClarity, selfTone, selfCredibility, selfClose,
    timerSecs, soloPitchSecs, isMultiplayer, onSpinRecorded, onEvalComplete,
    scorePitch, recordAiScore, pitchText, cheatSheetContent, spinId, completionScore,
  ]);

  const color = challenge.product.color;

  // Self-scores object for debrief
  const selfScores: SelfScores | null = assessmentDone
    ? { clarity: selfClarity, conversational: selfTone, credibility: selfCredibility, close: selfClose }
    : null;

  // ─── RENDER ───
  return (
    <div className="w-full max-w-lg rounded-xl p-5 border text-left" style={{ borderColor: color, background: "var(--color-card)" }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{challenge.icon}</span>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>{challenge.label}</div>
          <div className="text-xs text-muted-foreground">{challenge.product.icon} {challenge.product.name}</div>
        </div>
        {!isMultiplayer && (
          <span className="ml-auto text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">Solo — Typed Pitch</span>
        )}
      </div>

      {/* Prompt */}
      <div className="rounded-lg border-2 px-4 py-3 mb-4" style={{ borderColor: color, backgroundColor: `${color}08` }}>
        <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color }}>Your Scenario</p>
        <p className="text-base font-bold text-foreground leading-snug">
          &ldquo;{challenge.prompt}&rdquo;
        </p>
        {challenge.hint && (
          <p className="text-xs text-muted-foreground mt-1.5 italic">{challenge.hint}</p>
        )}
      </div>

      {/* ═══════════ SOLO MODE ═══════════ */}
      {!isMultiplayer && (
        <>
          {/* STUDY PHASE */}
          {soloPhase === "study" && (
            <StudyPhase
              studySecs={studySecs}
              challenge={challenge}
              color={color}
              onTypingStart={handleTypingStart}
              pitchText={pitchText}
              onTextChange={handleTextChange}
              onPaste={handlePaste}
              wordCount={wordCount}
            />
          )}

          {/* PITCH PHASE */}
          {soloPhase === "pitch" && (
            <PitchPhase
              pitchSecs={soloPitchSecs}
              pitchText={pitchText}
              onTextChange={handleTextChange}
              onPaste={handlePaste}
              wordCount={wordCount}
              onDone={handlePitchDone}
              color={color}
              timerExpired={timerExpiredSolo}
            />
          )}

          {/* SELF-EVAL PHASE */}
          {soloPhase === "selfEval" && !assessmentDone && (
            <SelfEvalSection
              selfClarity={selfClarity}
              selfTone={selfTone}
              selfCredibility={selfCredibility}
              selfClose={selfClose}
              onClarityChange={setSelfClarity}
              onToneChange={setSelfTone}
              onCredibilityChange={setSelfCredibility}
              onCloseChange={setSelfClose}
              onSubmit={handleSubmitAssessment}
              color={color}
              completionScore={completionScore}
            />
          )}

          {/* AI SCORING PHASE */}
          {soloPhase === "aiScoring" && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-3" />
              <p className="text-sm font-semibold text-foreground">AI Coach is reviewing your pitch…</p>
              <p className="text-xs text-muted-foreground mt-1">Analyzing clarity, tone, credibility, and close</p>
            </div>
          )}

          {/* DEBRIEF PHASE */}
          {soloPhase === "debrief" && selfScores && (
            <>
              {aiScores ? (
                <AiDebriefCard selfScores={{ ...selfScores, completion: completionScore }} aiScores={{ ...aiScores, completion: completionScore }} product={challenge.product} />
              ) : (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                    AI scoring unavailable. Your self-evaluation was recorded: {selfClarity + selfTone + selfCredibility + selfClose + completionScore}/15
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ═══════════ MULTIPLAYER MODE (unchanged) ═══════════ */}
      {isMultiplayer && (
        <>
          {/* Timer */}
          <MultiplayerTimerSection
            timerSecs={timerSecs}
            timerActive={timerActive}
            timerDone={timerDone}
            pitchSeconds={pitchSecondsRef.current}
            onDone={handleDone}
          />

          {/* Cheat sheet toggle */}
          <button
            onClick={handleCheatPeek}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all border mb-3"
            style={{ borderColor: `${color}66`, color }}
          >
            {showCheat ? "Hide cheat sheet" : "Show cheat sheet"}
          </button>

          {showCheat && <CheatSheetContent challenge={challenge} />}

          {/* Self-assessment after timer ends */}
          {!assessmentDone && timerDone && (
            <SelfEvalSection
              selfClarity={selfClarity}
              selfTone={selfTone}
              selfCredibility={selfCredibility}
              selfClose={selfClose}
              onClarityChange={setSelfClarity}
              onToneChange={setSelfTone}
              onCredibilityChange={setSelfCredibility}
              onCloseChange={setSelfClose}
              onSubmit={() => {
                handleSubmitAssessment();
                onEvalComplete();
              }}
              color={color}
              completionScore={completionScore}
            />
          )}

          {/* Coach Scorecard */}
          {assessmentDone && !coachSubmitted && (
            <CoachScorecard
              coachClarity={coachClarity}
              coachTone={coachTone}
              coachCredibility={coachCredibility}
              coachClose={coachClose}
              coachName={coachName}
              onClarityChange={setCoachClarity}
              onToneChange={setCoachTone}
              onCredibilityChange={setCoachCredibility}
              onCloseChange={setCoachClose}
              onNameChange={setCoachName}
              onSubmit={async () => {
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
                  onEvalComplete();
                } catch {
                  toast.error("Failed to save — try again");
                }
              }}
              loading={ratingLoading}
            />
          )}

          {coachSubmitted && (
            <div className="mt-3 pt-3 border-t border-border text-center">
              <p className="text-sm text-green-600 font-semibold">✅ Coach scores recorded — see debrief below!</p>
            </div>
          )}

          {/* Debrief Card — polls for observer ratings */}
          {assessmentDone && spinId && showDebrief && (
            <DebriefCard spinId={spinId} selfScores={selfScores} onDismiss={() => setShowDebrief(false)} />
          )}
        </>
      )}
    </div>
  );
}

// ═══════════ SUB-COMPONENTS ═══════════

function StudyPhase({
  studySecs, challenge, color, onTypingStart, pitchText, onTextChange, onPaste, wordCount,
}: {
  studySecs: number;
  challenge: Challenge;
  color: string;
  onTypingStart: () => void;
  pitchText: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  wordCount: number;
}) {
  return (
    <div>
      {/* Study timer */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📖</span>
        <span className="text-xs font-semibold text-foreground">Study Phase</span>
        <span className="text-lg font-bold font-mono tabular-nums text-amber-600">
          0:{String(studySecs).padStart(2, "0")}
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground mb-3 italic">
        Review your cheat sheet below. Start typing to begin your pitch, or it closes in {studySecs}s.
      </p>

      {/* Cheat sheet visible during study */}
      <CheatSheetContent challenge={challenge} />

      {/* Textarea (typing starts pitch phase) */}
      <div className="mt-3">
        <textarea
          value={pitchText}
          onChange={(e) => {
            onTypingStart();
            onTextChange(e);
          }}
          onPaste={onPaste}
          placeholder="Start typing your pitch here to begin…"
          className="w-full h-28 px-3 py-2 border border-border rounded-lg text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <div className="flex justify-end mt-1">
          <span className={`text-[10px] font-medium ${wordCount > MAX_WORDS * 0.9 ? "text-red-500" : "text-muted-foreground"}`}>
            {wordCount}/{MAX_WORDS} words
          </span>
        </div>
      </div>
    </div>
  );
}

function PitchPhase({
  pitchSecs, pitchText, onTextChange, onPaste, wordCount, onDone, color, timerExpired,
}: {
  pitchSecs: number;
  pitchText: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  wordCount: number;
  onDone: () => void;
  color: string;
  timerExpired: boolean;
}) {
  const timerColor = pitchSecs <= 30 ? "#E53935" : pitchSecs <= 60 ? "#F57C00" : "var(--color-foreground)";

  return (
    <div>
      {/* Time's up banner */}
      {timerExpired && wordCount < MIN_WORDS && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-700 rounded-lg px-3 py-2 mb-3">
          <p className="text-xs font-bold text-red-700 dark:text-red-400">⏰ Time's up! Finish your pitch (need {MIN_WORDS - wordCount} more words) to submit.</p>
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <span className="text-lg">✍️</span>
        <span className="text-xs font-semibold text-foreground">Pitch Phase</span>
        {!timerExpired && (
          <span className="text-2xl font-bold font-mono tabular-nums" style={{ color: timerColor }}>
            {String(Math.floor(pitchSecs / 60)).padStart(2, "0")}:{String(pitchSecs % 60).padStart(2, "0")}
          </span>
        )}
        {timerExpired && (
          <span className="text-sm font-bold text-red-600">⏰ 0:00</span>
        )}
        <button
          onClick={onDone}
          disabled={wordCount < MIN_WORDS}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ml-auto ${
            wordCount < MIN_WORDS
              ? "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700 cursor-not-allowed"
              : "text-white bg-[#00C853] hover:bg-[#00a844]"
          }`}
        >
          {wordCount < MIN_WORDS ? `${MIN_WORDS - wordCount} words to go` : "✅ Submit Pitch"}
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground mb-2 italic">
        Cheat sheet is hidden. Type your pitch below. No pasting allowed.
      </p>

      <textarea
        value={pitchText}
        onChange={onTextChange}
        onPaste={onPaste}
        autoFocus
        placeholder="Type your sales pitch…"
        className="w-full h-36 px-3 py-2 border border-border rounded-lg text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      <div className="flex justify-end mt-1">
        <span className={`text-[10px] font-medium ${wordCount > MAX_WORDS * 0.9 ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
          {wordCount}/{MAX_WORDS} words
        </span>
      </div>
    </div>
  );
}

function SelfEvalSection({
  selfClarity, selfTone, selfCredibility, selfClose,
  onClarityChange, onToneChange, onCredibilityChange, onCloseChange,
  onSubmit, color, completionScore,
}: {
  selfClarity: number; selfTone: number; selfCredibility: number; selfClose: number;
  onClarityChange: (v: number) => void; onToneChange: (v: number) => void;
  onCredibilityChange: (v: number) => void; onCloseChange: (v: number) => void;
  onSubmit: () => void; color: string; completionScore: number;
}) {
  const total = selfClarity + selfTone + selfCredibility + selfClose + completionScore;
  return (
    <div className="mt-3 pt-3 border-t border-border">
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-base">🫵🏼</span>
          <p className="text-sm font-semibold text-foreground">How Did You Do?</p>
        </div>
        <p className="text-xs text-muted-foreground mb-1">Rate yourself honestly on each category.</p>
        <p className="text-[10px] font-medium text-red-600 mb-3">⚠️ You must complete this before spinning again.</p>
        <p className="text-[10px] text-muted-foreground mb-3 italic">🔴 Needs work · 🟡 Getting there · 🟢 Nailed it</p>

        <div className="space-y-2 mb-4">
          <RatingRow label="Clarity" description="Were you concise and easy to follow?" value={selfClarity} onChange={onClarityChange} />
          <RatingRow label="Conversational Tone" description="Did it feel natural, not scripted?" value={selfTone} onChange={onToneChange} />
          <RatingRow label="Credibility" description="Did you speak about the product correctly?" value={selfCredibility} onChange={onCredibilityChange} />
          <RatingRow label="Close" description="Did you end with a compelling ask?" value={selfClose} onChange={onCloseChange} />
          {/* Completion row — auto-filled & locked */}
          <div className="flex items-center justify-between gap-2 opacity-80">
            <div className="flex-1">
              <span className="text-xs font-medium text-foreground">Completion</span>
              <p className="text-[10px] text-muted-foreground leading-tight">Did you finish before time ran out?</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">Auto</span>
              <div className="flex gap-1.5">
                {([1, 2, 3] as const).map((n) => {
                  const cfg = SCORE_CONFIG[n];
                  return (
                    <div
                      key={n}
                      className={`w-9 h-9 rounded-lg border text-sm font-semibold flex items-center justify-center ${
                        completionScore === n
                          ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                          : "bg-background text-muted-foreground/30 border-border"
                      }`}
                    >
                      {n}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (selfClarity === 0 || selfTone === 0 || selfCredibility === 0 || selfClose === 0) {
              toast.error("Rate all 4 categories");
              return;
            }
            onSubmit();
          }}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ background: color }}
        >
          Score: {total}/15 — Submit Self-Evaluation
        </button>
      </div>
    </div>
  );
}

function MultiplayerTimerSection({
  timerSecs, timerActive, timerDone, pitchSeconds, onDone,
}: {
  timerSecs: number; timerActive: boolean; timerDone: boolean; pitchSeconds: number | null; onDone: () => void;
}) {
  const timerColor = timerSecs <= 30 ? "#E53935" : timerSecs <= 60 ? "#F57C00" : "var(--color-foreground)";
  const pitchTimeDisplay = pitchSeconds !== null
    ? `${Math.floor(pitchSeconds / 60)}:${String(pitchSeconds % 60).padStart(2, "0")}`
    : null;

  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-2xl font-bold font-mono tabular-nums" style={{ color: timerColor }}>
        {String(Math.floor(timerSecs / 60)).padStart(2, "0")}:{String(timerSecs % 60).padStart(2, "0")}
      </span>
      {timerActive && (
        <button onClick={onDone} className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#00C853] hover:bg-[#00a844] transition-colors">
          Done
        </button>
      )}
      {timerSecs === 0 && !timerDone && (
        <span className="text-xs font-semibold text-red-500">Time's up!</span>
      )}
      {timerDone && timerSecs > 0 && (
        <span className="text-xs font-semibold text-green-600">
          Done in {pitchTimeDisplay}! — Great pace 👏
        </span>
      )}
      {timerDone && timerSecs === 0 && (
        <span className="text-xs font-semibold text-red-500">Time's up! — {pitchTimeDisplay}</span>
      )}
    </div>
  );
}

function CheatSheetContent({ challenge }: { challenge: Challenge }) {
  return (
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
  );
}

function CoachScorecard({
  coachClarity, coachTone, coachCredibility, coachClose, coachName,
  onClarityChange, onToneChange, onCredibilityChange, onCloseChange, onNameChange,
  onSubmit, loading,
}: {
  coachClarity: number; coachTone: number; coachCredibility: number; coachClose: number;
  coachName: string;
  onClarityChange: (v: number) => void; onToneChange: (v: number) => void;
  onCredibilityChange: (v: number) => void; onCloseChange: (v: number) => void;
  onNameChange: (v: string) => void;
  onSubmit: () => void; loading: boolean;
}) {
  return (
    <div className="mt-3 pt-3 border-t border-border">
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-base">📋</span>
          <p className="text-sm font-semibold text-foreground">Coach Scorecard</p>
        </div>
        <p className="text-xs text-muted-foreground mb-1">Ask your coach to rate you verbally (1-3) on each category, then enter their scores below.</p>
        <p className="text-[10px] font-medium text-red-600 mb-3">⚠️ You must submit coach scores before spinning again.</p>
        <p className="text-[10px] text-muted-foreground mb-3 italic">🔴 Needs work · 🟡 Getting there · 🟢 Nailed it</p>

        <input
          type="text"
          value={coachName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Coach's name"
          className="w-full px-3 py-2 border border-border rounded-lg text-sm mb-3 bg-background"
        />

        <div className="space-y-2 mb-4">
          <RatingRow label="Clarity" description="Were they concise and easy to follow?" value={coachClarity} onChange={onClarityChange} />
          <RatingRow label="Conversational Tone" description="Did it feel natural, not scripted?" value={coachTone} onChange={onToneChange} />
          <RatingRow label="Credibility" description="Did they speak about the product correctly?" value={coachCredibility} onChange={onCredibilityChange} />
          <RatingRow label="Close" description="Did they end with a compelling ask?" value={coachClose} onChange={onCloseChange} />
        </div>

        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : `Score: ${coachClarity + coachTone + coachCredibility + coachClose}/12 — Submit Coach Scores`}
        </button>
      </div>
    </div>
  );
}

// ═══════════ RATING ROW ═══════════

const SCORE_CONFIG: Record<number, { emoji: string; label: string; bg: string; text: string; border: string; hoverBorder: string }> = {
  1: { emoji: "🔴", label: "Needs work", bg: "bg-red-500", text: "text-white", border: "border-red-500", hoverBorder: "hover:border-red-300" },
  2: { emoji: "🟡", label: "Getting there", bg: "bg-yellow-400", text: "text-gray-900", border: "border-yellow-400", hoverBorder: "hover:border-yellow-300" },
  3: { emoji: "🟢", label: "Nailed it", bg: "bg-green-500", text: "text-white", border: "border-green-500", hoverBorder: "hover:border-green-300" },
};

function RatingRow({ label, description, value, onChange }: { label: string; description: string; value: number; onChange: (v: number) => void }) {
  const selected = value > 0 ? SCORE_CONFIG[value] : null;
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
        {selected && (
          <p className="text-[10px] font-semibold mt-0.5 leading-tight">
            {selected.emoji} {selected.label}
          </p>
        )}
      </div>
      <div className="flex gap-1.5">
        {([1, 2, 3] as const).map((n) => {
          const cfg = SCORE_CONFIG[n];
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`w-9 h-9 rounded-lg border text-sm font-semibold transition ${
                value === n
                  ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                  : `bg-background text-foreground border-border ${cfg.hoverBorder}`
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
