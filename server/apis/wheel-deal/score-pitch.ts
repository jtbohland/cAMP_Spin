import { api, z, anthropic } from "@superblocksteam/sdk-api";

const ANTHROPIC = "c7c693c4-0472-4c6b-952c-122c8d884281";

const MessageResponseSchema = z.object({
  id: z.string(),
  type: z.literal("message"),
  role: z.literal("assistant"),
  content: z.array(
    z.object({
      type: z.literal("text"),
      text: z.string(),
    }),
  ),
  model: z.string(),
  stop_reason: z.string().nullable(),
  stop_sequence: z.string().nullable(),
  usage: z.object({
    input_tokens: z.number(),
    output_tokens: z.number(),
  }),
});

export default api({
  name: "WheelDealScorePitch",
  description: "Scores a typed sales pitch using Anthropic Claude AI on 4C rubric",
  integrations: {
    ai: anthropic(ANTHROPIC),
  },
  input: z.object({
    productName: z.string(),
    challengeType: z.string(),
    challengePrompt: z.string(),
    cheatSheetContent: z.string(),
    pitchText: z.string(),
  }),
  output: z.object({
    clarity: z.number(),
    conversational: z.number(),
    credibility: z.number(),
    close: z.number(),
    totalScore: z.number(),
    feedbackBullets: z.array(z.string()),
    isCopied: z.boolean(),
  }),
  async run(ctx, input) {
    const systemPrompt = `You are a sales pitch coach for Amplitude's sales team. You evaluate typed sales pitches on a strict 4-category rubric.

SCORING RUBRIC (each category 1-3, total /12):
- **Clarity** (1-3): Was the pitch concise, jargon-free, and easy to follow? 3 = crystal clear, 1 = confusing or rambling.
- **Conversational Tone** (1-3): Did the pitch feel natural and human? 3 = sounds like talking to a friend, 1 = robotic or scripted.
- **Credibility** (1-3): Did they demonstrate real product knowledge and use concrete examples? 3 = specific and believable, 1 = vague or incorrect.
- **Close** (1-3): Did they end with a compelling, natural ask or next step? 3 = great call to action, 1 = no close or awkward ask.

IMPORTANT RULES:
1. If the pitch is largely copy-pasted from the cheat sheet (>60% overlap in phrasing), set "isCopied" to true and penalize Conversational Tone to 1.
2. Be fair but demanding. Most pitches should score 6-9/12. Reserve 11-12 for truly exceptional work.
3. Provide exactly 5 actionable, forward-looking feedback bullets. Focus on what to DO next time, not what went wrong. Be specific and constructive.

You MUST respond with valid JSON only. No markdown, no extra text. Use this exact structure:
{
  "clarity": <1-3>,
  "conversational": <1-3>,
  "credibility": <1-3>,
  "close": <1-3>,
  "isCopied": <true|false>,
  "feedbackBullets": ["bullet1", "bullet2", "bullet3", "bullet4", "bullet5"]
}`;

    const userPrompt = `Product: ${input.productName}
Challenge type: ${input.challengeType}
Prompt they responded to: "${input.challengePrompt}"

CHEAT SHEET CONTENT (for copy detection):
${input.cheatSheetContent}

THEIR TYPED PITCH:
${input.pitchText}

Score this pitch on the 4C rubric. Respond with JSON only.`;

    const result = await ctx.integrations.ai.apiRequest(
      {
        method: "POST",
        path: "/v1/messages",
        body: {
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        },
      },
      { response: MessageResponseSchema },
      { label: "Score typed pitch with Claude" },
    );

    const textContent = result.content.find((c) => c.type === "text");
    const rawText = textContent?.text ?? "";

    // Parse the JSON response
    let parsed: {
      clarity: number;
      conversational: number;
      credibility: number;
      close: number;
      isCopied: boolean;
      feedbackBullets: string[];
    };

    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Fallback: try to extract JSON from response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI scoring response as JSON");
      }
    }

    // Clamp scores to 1-3
    const clamp = (n: number) => Math.max(1, Math.min(3, Math.round(n)));
    const clarity = clamp(parsed.clarity);
    const conversational = clamp(parsed.conversational);
    const credibility = clamp(parsed.credibility);
    const close = clamp(parsed.close);

    return {
      clarity,
      conversational,
      credibility,
      close,
      totalScore: clarity + conversational + credibility + close,
      feedbackBullets: (parsed.feedbackBullets || []).slice(0, 5),
      isCopied: !!parsed.isCopied,
    };
  },
});
