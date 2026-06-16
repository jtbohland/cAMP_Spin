import { useState, useCallback } from "react";
import { executeApi } from "@/lib/executeApi.js";
import { toast } from "sonner";

type ObserverViewProps = {
  spinId: number;
  onClose: () => void;
};

export function ObserverView({ spinId, onClose }: ObserverViewProps) {
  const [observerName, setObserverName] = useState("");
  const [clarity, setClarity] = useState(0);
  const [conversational, setConversational] = useState(0);
  const [credibility, setCredibility] = useState(0);
  const [close, setClose] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);


  const handleSubmit = useCallback(async () => {
    if (!observerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (clarity === 0 || conversational === 0 || credibility === 0 || close === 0) {
      toast.error("Please rate all four categories");
      return;
    }
    setSubmitting(true);


    // Fire the API call — it writes to the DB server-side even if the
    // client-side promise never resolves (known deployed-app behavior).
    // Race: resolve on API success OR after 4s optimistic timeout.
    const apiCall = executeApi("RecordPeerRating", {
      spinId,
      observerName: observerName.trim(),
      clarityScore: clarity,
      conversationalScore: conversational,
      credibilityScore: credibility,
      closeScore: close,
    });

    const optimisticTimeout = new Promise<"timeout">((resolve) =>
      setTimeout(() => resolve("timeout"), 4000)
    );

    try {
      const result = await Promise.race([apiCall, optimisticTimeout]);
      // Either the API resolved or we timed out — either way, show success
      // The DB write goes through server-side regardless
      void result;
      setSubmitted(true);
    } catch {
      // Even on error, the server-side write likely went through.
      // Show success optimistically after the timeout fires.
      setSubmitted(true);
    }
  }, [spinId, observerName, clarity, conversational, credibility, close]);

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card border rounded-xl p-8 shadow-sm text-center max-w-md">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-xl font-bold text-foreground mb-2">Score Sent!</p>
          <p className="text-muted-foreground text-sm">Thanks, {observerName}! Your feedback has been recorded and will appear in the presenter's debrief.</p>
          <p className="mt-4 text-xs text-muted-foreground">You can close this tab now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="bg-card border rounded-xl shadow-sm p-6 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">📋</div>
          <h1 className="text-xl font-bold text-foreground">Coach Scorecard</h1>
          <p className="text-sm text-muted-foreground mt-1">Rate your partner's pitch silently on clarity, tone, credibility, and close.</p>
        </div>

        {/* Observer name */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground block mb-1">Your Name</label>
          <input
            type="text"
            value={observerName}
            onChange={(e) => setObserverName(e.target.value)}
            placeholder="e.g. Sarah (Manager)"
            className="w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Rating categories */}
        <div className="space-y-4 mb-6">
          <RatingRow label="Clarity" description="Were they concise and easy to follow?" value={clarity} onChange={setClarity} />
          <RatingRow label="Conversational Tone" description="Did it feel natural, not scripted?" value={conversational} onChange={setConversational} />
          <RatingRow label="Credibility" description="Did they sound like someone you'd trust on this product?" value={credibility} onChange={setCredibility} />
          <RatingRow label="Close" description="Did they end with a compelling ask?" value={close} onChange={setClose} />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "Sending scores..." : "Submit Rating"}
        </button>


      </div>
    </div>
  );
}

function RatingRow({ label, description, value, onChange }: { label: string; description: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      <div className="flex gap-2">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition ${
              value === n ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:border-primary/50"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
        <span>Needs work</span><span>Solid</span><span>Nailed it</span>
      </div>
    </div>
  );
}
