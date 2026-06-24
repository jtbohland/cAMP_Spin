import { useState, useRef, useCallback, useEffect } from "react";
import { PRODUCTS, SCENARIOS, type Product, type Challenge, getRandom } from "@/lib/wheel-deal-data.js";
import { useApi } from "@/hooks/useApi.js";
import ChallengeCard from "./ChallengeCard.js";

type SpinWheelTabProps = {
  onProductLand: (product: Product) => void;
  isMultiplayer: boolean;
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

export default function SpinWheelTab({ onProductLand, isMultiplayer }: SpinWheelTabProps) {
  const [spinning, setSpinning] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTickSegRef = useRef<number>(-1);
  const [currentSpinId, setCurrentSpinId] = useState<number | null>(null);
  const spinIdPromiseRef = useRef<Promise<number | null> | null>(null);
  const { run: recordSpin } = useApi("RecordSpin");
  const { run: updateSpin } = useApi("UpdateSpin");

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const spin = useCallback(() => {
    if (spinning) return;
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

      // Tick sound on segment boundary
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
        // The pointer is at the top. Segments are drawn clockwise from the top.
        // After rotating `normalized` degrees clockwise, the segment at the top
        // is the one that was originally at (360 - normalized) degrees from start.
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
          // Challenger Play
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

        // Record spin immediately on landing — so it counts on the leaderboard
        // regardless of whether they complete self-assessment
        // Store promise in ref so handleSpinRecorded can await it if needed
        spinIdPromiseRef.current = recordSpin({
          productId: product.id,
          challengeType: newChallenge.type,
          cheatPeek: false,
          selfScore: null,
          timerUsed: false,
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

        setTimeout(() => {
          onProductLand(product);
          setChallenge(newChallenge);
          setSpinning(false);
        }, 300);
      }
    }
    rafRef.current = requestAnimationFrame(animate);
  }, [spinning, spinAngle, onProductLand, recordSpin, isMultiplayer]);

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
  }) => {
    // Await the spinId if it hasn't resolved yet (race condition fix)
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
      });
    } catch (e) {
      console.error("Failed to update spin:", e);
    }
  }, [updateSpin, currentSpinId]);

  return (
    <div className="flex flex-col items-center pt-2">
      <p className="text-base font-bold text-foreground mb-1">Spin the Wheel</p>
      <p className="text-xs text-muted-foreground mb-5 text-center">
        Land on a product. Get a challenge. Practice out loud before checking the cheat sheet.
      </p>

      {/* Wheel */}
      <div className="relative mb-5">
        {/* Pointer */}
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
            const mx = CX + R * 0.5 * Math.cos(start + SEG_ANGLE / 2);
            const my = CY + R * 0.5 * Math.sin(start + SEG_ANGLE / 2);
            const lx = CX + R * 0.75 * Math.cos(start + SEG_ANGLE / 2);
            const ly = CY + R * 0.75 * Math.sin(start + SEG_ANGLE / 2);
            return (
              <g key={i}>
                <path
                  d={`M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`}
                  fill={prod.color}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <text x={mx} y={my - 8} textAnchor="middle" dominantBaseline="middle" fontSize="28" fill="#fff">
                  {prod.icon}
                </text>
                {/* Render product name, split into two lines only if it contains + or & */}
                {prod.name.includes("+") || prod.name.includes("&") ? (
                  <>
                    <text x={lx} y={ly + 8} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="rgba(255,255,255,0.95)" fontFamily="Inter,sans-serif" fontWeight="700">
                      {prod.name.split(/\s*[+&]\s*/)[0]}
                    </text>
                    <text x={lx} y={ly + 22} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="rgba(255,255,255,0.95)" fontFamily="Inter,sans-serif" fontWeight="700">
                      {prod.name.includes("+") ? "+ " : "& "}{prod.name.split(/\s*[+&]\s*/)[1]}
                    </text>
                  </>
                ) : (
                  <text x={lx} y={ly + 14} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="rgba(255,255,255,0.95)" fontFamily="Inter,sans-serif" fontWeight="700">
                    {prod.name}
                  </text>
                )}
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
        disabled={spinning}
        className="mb-5 px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:cursor-not-allowed"
        style={{
          background: spinning ? "var(--color-muted)" : "#2962FF",
          opacity: spinning ? 0.5 : 1,
        }}
      >
        {spinning ? "Spinning..." : "Spin!"}
      </button>

      {/* Challenge card */}
      {challenge && !spinning && (
        <ChallengeCard
          challenge={challenge}
          isMultiplayer={isMultiplayer}
          spinId={currentSpinId}
          onSpinRecorded={handleSpinRecorded}
        />
      )}

      {!challenge && !spinning && (
        <p className="text-xs text-muted-foreground">
          Spin to get your challenge — then practice out loud before peeking at the cheat sheet.
        </p>
      )}
    </div>
  );
}
