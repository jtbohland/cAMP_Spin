import { useState, useRef, useCallback, useEffect } from "react";
import confetti from "canvas-confetti";
import { PRODUCTS, SCENARIOS, type Product, type Challenge, getRandom } from "@/lib/wheel-deal-data.js";
import { useApi } from "@/hooks/useApi.js";
import { useApiData } from "@/hooks/useApiData.js";
import { useSuperblocksUser } from "@superblocksteam/library";
import ChallengeCard from "./ChallengeCard.js";
import RegistrationModal from "./RegistrationModal.js";

// Confetti emoji pairs per product
const CONFETTI_EMOJIS: Record<string, string[]> = {
  analytics: ["📊", "📈"],
  sessionreplay: ["🔥", "🗺️"],
  experimentation: ["🧪", "🥼"],
  guidessurveys: ["🐕", "🧭"],
  statsig: ["📈", "⚡️"],
  activation: ["🚀", "🎯"],
  aifeedback: ["🦾", "💬"],
  aiassistant: ["🤖", "🗣️"],
};

function fireEmojiConfetti(productId: string) {
  const emojis = CONFETTI_EMOJIS[productId];
  if (!emojis) return;
  for (const emoji of emojis) {
    const shape = confetti.shapeFromText({ text: emoji, scalar: 3 });
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.5 },
      shapes: [shape],
      scalar: 3,
      ticks: 300,
      gravity: 0.4,
      drift: 0.5,
      decay: 0.92,
    });
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.5 },
      shapes: [shape],
      scalar: 3,
      ticks: 300,
      gravity: 0.4,
      drift: -0.5,
      decay: 0.92,
    });
  }
}

type SpinWheelTabProps = {
  onProductLand: (product: Product) => void;
  isMultiplayer: boolean;
  onModeToggle: () => void;
  /** Notify parent when eval becomes pending or completes */
  onEvalPendingChange: (pending: boolean) => void;
};

const WHEEL_SIZE = 580;
const CX = WHEEL_SIZE / 2;
const CY = WHEEL_SIZE / 2;
const R = 260;
const NUM_SEGS = PRODUCTS.length;
const SEG_ANGLE = (2 * Math.PI) / NUM_SEGS;

// Web Audio API tick sound
function playTick() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.03);
    setTimeout(() => ctx.close(), 100);
  } catch {
    // silently fail if audio not available
  }
}

export default function SpinWheelTab({ onProductLand, isMultiplayer, onModeToggle, onEvalPendingChange }: SpinWheelTabProps) {
  const [spinning, setSpinning] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [evalPending, setEvalPending] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTickSegRef = useRef<number>(-1);
  const [currentSpinId, setCurrentSpinId] = useState<number | null>(null);
  const spinIdPromiseRef = useRef<Promise<number | null> | null>(null);
  const { run: recordSpin } = useApi("RecordSpin");
  const { run: updateSpin } = useApi("UpdateSpin");

  // Profile gate: check if user has registered
  const user = useSuperblocksUser();
  const { data: profileData, loading: profileLoading, refetch: refetchProfile } = useApiData("GetProfile", {});
  const [registered, setRegistered] = useState(false);

  const hasProfile = registered || (profileData?.profile !== null && profileData?.profile !== undefined);

  const handleRegistrationComplete = useCallback(() => {
    setRegistered(true);
    refetchProfile();
  }, [refetchProfile]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Notify parent when evalPending changes
  useEffect(() => {
    onEvalPendingChange(evalPending);
  }, [evalPending, onEvalPendingChange]);

  // Clear challenge state when switching modes — require a fresh spin
  useEffect(() => {
    setChallenge(null);
    setEvalPending(false);
    setCurrentSpinId(null);
  }, [isMultiplayer]);

  const handleEvalComplete = useCallback(() => {
    setEvalPending(false);
  }, []);

  const spin = useCallback(() => {
    if (spinning || evalPending) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setSpinning(true);
    setChallenge(null);
    lastTickSegRef.current = -1;
    const startAngle = spinAngle;
    const extraSpins = 1440 + Math.floor(Math.random() * 720);
    const target = startAngle + extraSpins;
    const duration = 3500;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = startAngle + (target - startAngle) * ease;
      setSpinAngle(current);

      const segSize = 360 / NUM_SEGS;
      const currentSeg = Math.floor(((current % 360) + 360) % 360 / segSize);
      if (currentSeg !== lastTickSegRef.current) {
        lastTickSegRef.current = currentSeg;
        playTick();
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setSpinAngle(target);
        const normalized = ((target % 360) + 360) % 360;
        const segSize = 360 / NUM_SEGS;
        const pointerAngle = ((360 - normalized) % 360 + 360) % 360;
        const idx = Math.floor(pointerAngle / segSize) % NUM_SEGS;
        const product = PRODUCTS[idx];

        const challengeType = Math.floor(Math.random() * 4);
        let newChallenge: Challenge;

        if (challengeType === 0) {
          newChallenge = {
            product,
            type: "pitch",
            icon: "🎯",
            label: "Tell Me About It",
            prompt: `Hey, what does ${product.name} actually do?`,
            hint: "Give a natural 1–2 minute answer. No slides, no jargon.",
          };
        } else if (challengeType === 1) {
          const obj = getRandom(product.objections);
          newChallenge = {
            product,
            type: "objection",
            icon: "🛡️",
            label: "Handle the Objection",
            prompt: obj.they,
            hint: "Respond naturally — don't get defensive, reframe it.",
            answer: obj.you,
          };
        } else if (challengeType === 2) {
          const scenario = getRandom(SCENARIOS);
          newChallenge = {
            product,
            type: "scenario",
            icon: scenario.icon,
            label: scenario.label,
            prompt: `${scenario.setup} You're pitching ${product.name}. They say: "${scenario.oneliner}"`,
            hint: `Keep it under 2 minutes. Conversational, not salesy. Focus on ${product.name}.`,
          };
        } else {
          const cp = product.challengerPlay;
          newChallenge = {
            product,
            type: "challenger",
            icon: "🔥",
            label: "Challenger Play",
            prompt: cp?.wheelPrompt || `Teach me something about my business I didn't know I needed to hear — using ${product.name}.`,
            hint: cp?.wheelHint || "Lead with the insight gap, not the product. Make them feel the problem before you offer the solution.",
          };
        }

        // Record spin immediately on landing
        spinIdPromiseRef.current = recordSpin({
          productId: product.id,
          challengeType: newChallenge.type,
          cheatPeek: false,
          selfScore: null,
          timerUsed: true, // always true now
          timerExpired: false,
          isMultiplayer,
        }).then((result) => {
          const id = result?.spinId ?? null;
          if (id) setCurrentSpinId(id);
          return id;
        }).catch((e) => {
          console.error("Failed to record spin:", e);
          return null;
        });

        fireEmojiConfetti(product.id);

        setTimeout(() => {
          onProductLand(product);
          setChallenge(newChallenge);
          setSpinning(false);
          setEvalPending(true); // Lock until eval is done
        }, 300);
      }
    }
    rafRef.current = requestAnimationFrame(animate);
  }, [spinning, evalPending, spinAngle, onProductLand, recordSpin, isMultiplayer]);

  const handleSpinRecorded = useCallback(async (spinData: {
    productId: string;
    challengeType: string;
    cheatPeek: boolean;
    selfClarity: number | null;
    selfConversational: number | null;
    selfCredibility: number | null;
    selfClose: number | null;
    timerUsed: boolean;
    timerExpired: boolean;
    pitchSeconds: number | null;
  }) => {
    let spinId = currentSpinId;
    if (!spinId && spinIdPromiseRef.current) {
      spinId = await spinIdPromiseRef.current;
    }
    if (!spinId) {
      console.error("No spinId available to update");
      return;
    }
    setCurrentSpinId(spinId);
    try {
      await updateSpin({
        spinId,
        cheatPeek: spinData.cheatPeek,
        selfClarity: spinData.selfClarity,
        selfConversational: spinData.selfConversational,
        selfCredibility: spinData.selfCredibility,
        selfClose: spinData.selfClose,
        timerUsed: spinData.timerUsed,
        timerExpired: spinData.timerExpired,
        pitchSeconds: spinData.pitchSeconds,
      });
    } catch (e) {
      console.error("Failed to update spin:", e);
    }
  }, [updateSpin, currentSpinId]);

  // Show loading skeleton while checking profile
  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full bg-muted animate-pulse mb-4" />
        <div className="w-48 h-4 rounded bg-muted animate-pulse mb-2" />
        <div className="w-36 h-3 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  // Show registration modal if no profile
  if (!hasProfile) {
    return <RegistrationModal defaultName={user?.name || ""} onComplete={handleRegistrationComplete} />;
  }

  const spinDisabled = spinning || evalPending;

  return (
    <div className="flex flex-col items-center pt-2">
      {/* Mode toggle — lives inside the wheel tab only */}
      {(() => {
        const soloRoundActive = !isMultiplayer && evalPending;
        return (
          <div
            className="w-full max-w-lg mb-4 px-4 py-3 rounded-xl flex items-center justify-between"
            style={{
              background: isMultiplayer ? "rgba(0,200,83,0.06)" : "rgba(41,98,255,0.04)",
              border: `1px solid ${isMultiplayer ? "rgba(0,200,83,0.2)" : "rgba(41,98,255,0.15)"}`,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{isMultiplayer ? "\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1" : "\ud83d\udc64"}</span>
              <div>
                <span className="text-sm font-semibold text-foreground">
                  {isMultiplayer ? "Multiplayer" : "Solo"}
                </span>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {isMultiplayer ? "Practice with a coach" : "Type your pitch, get AI feedback"}
                </p>
              </div>
            </div>
            <button
              onClick={() => !soloRoundActive && onModeToggle()}
              disabled={soloRoundActive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: soloRoundActive ? "#9CA3AF" : isMultiplayer ? "#00C853" : "#2962FF",
                borderColor: soloRoundActive ? "#9CA3AF" : isMultiplayer ? "#00C853" : "#2962FF",
                color: "#fff",
              }}
              title={soloRoundActive ? "Complete your solo round first" : undefined}
            >
              <span>{isMultiplayer ? "\ud83d\udc64" : "\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1"}</span>
              {soloRoundActive ? "\ud83d\udd12 Finish Round" : isMultiplayer ? "Solo" : "Multiplayer"}
            </button>
          </div>
        );
      })()}

      <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-1 drop-shadow-sm">
🎰 Spin the Wheel!
      </h1>
      <p className="text-sm text-muted-foreground mb-5 text-center">
        Land on a product. Get a challenge. Practice out loud before checking the cheat sheet.
      </p>

      {/* Eval pending banner */}
      {evalPending && !spinning && (
        <div className="w-full max-w-lg mb-4 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-center animate-pulse">
          <p className="text-xs font-semibold text-red-700">
            🔒 Complete your evaluation below before spinning again
          </p>
        </div>
      )}

      {/* Wheel */}
      <div className="relative mb-5">
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
          style={{
            width: 0,
            height: 0,
            borderLeft: "11px solid transparent",
            borderRight: "11px solid transparent",
            borderTop: "24px solid #1a1a2e",
          }}
        />
        <svg
          width={WHEEL_SIZE}
          height={WHEEL_SIZE}
          viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
          className="block drop-shadow-xl"
          style={{ transform: `rotate(${spinAngle}deg)` }}
        >
          {PRODUCTS.map((prod, i) => {
            const start = i * SEG_ANGLE - Math.PI / 2;
            const end = start + SEG_ANGLE;
            const x1 = CX + R * Math.cos(start);
            const y1 = CY + R * Math.sin(start);
            const x2 = CX + R * Math.cos(end);
            const y2 = CY + R * Math.sin(end);
            const midAngleDeg = ((start + SEG_ANGLE / 2) * 180) / Math.PI;
            const textRotDeg = midAngleDeg;
            let words: string[];
            if (prod.name.includes("+")) {
              const [before, after] = prod.name.split(/\s*\+\s*/);
              const bWords = before.split(/\s+/);
              bWords[bWords.length - 1] += " +";
              words = [...bWords, after];
            } else if (prod.name.includes("&")) {
              const [before, after] = prod.name.split(/\s*&\s*/);
              words = [before + " &", after];
            } else {
              words = [prod.name];
            }
            const charWidth = 8.2;
            const wordWidths = words.map((w) => w.length * charWidth);
            const edgeGap = 8;
            const totalSpan = wordWidths.reduce((a, b) => a + b, 0) + edgeGap * (words.length - 1);
            const spokeMid = R * 0.54;
            const blockStart = spokeMid - totalSpan / 2;
            const wordPositions = words.map((_, wi) => {
              let pos = blockStart;
              for (let j = 0; j < wi; j++) {
                pos += wordWidths[j] + edgeGap;
              }
              pos += wordWidths[wi] / 2;
              return pos;
            });
            return (
              <g key={i}>
                <path
                  d={`M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`}
                  fill={prod.color}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <g transform={`translate(${CX}, ${CY}) rotate(${textRotDeg})`}>
                  {words.map((word, wi) => {
                    const wordX = wordPositions[wi];
                    return (
                      <text
                        key={wi}
                        x={wordX}
                        y={0}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="13"
                        fill="rgba(255,255,255,0.95)"
                        fontFamily="Inter,sans-serif"
                        fontWeight="800"
                        style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}
                      >
                        {word}
                      </text>
                    );
                  })}
                </g>
              </g>
            );
          })}
          <circle cx={CX} cy={CY} r="30" fill="#fff" />
          <circle cx={CX} cy={CY} r="14" fill="#2962FF" />
        </svg>
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={spinDisabled}
        className="mb-5 px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:cursor-not-allowed"
        style={{
          background: spinDisabled ? "var(--color-muted)" : "#2962FF",
          opacity: spinDisabled ? 0.5 : 1,
        }}
      >
        {spinning ? "Spinning..." : evalPending ? "🔒 Complete Eval First" : "Spin!"}
      </button>

      {/* Challenge card */}
      {challenge && !spinning && (
        <ChallengeCard
          challenge={challenge}
          isMultiplayer={isMultiplayer}
          spinId={currentSpinId}
          onSpinRecorded={handleSpinRecorded}
          onEvalComplete={handleEvalComplete}
        />
      )}

      {!challenge && !spinning && !evalPending && (
        <p className="text-xs text-muted-foreground">
          Spin to get your challenge — then practice out loud before peeking at the cheat sheet.
        </p>
      )}
    </div>
  );
}
