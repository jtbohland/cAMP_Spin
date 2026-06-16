export type ChallengerPlay = {
  reframe: { a: string; gap: string; b: string };
  insight: string;
  leadWith: string;
  notWith: string;
  wheelPrompt: string;
  wheelHint: string;
};

export type Product = {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  color: string;
  oneLiner: string;
  happyHour: string;
  linkedinDrop: string;
  aiAngle: string;
  objections: { they: string; you: string }[];
  followUpAsk: string;
  whatNotToSay: string[];
  connectionPlay: string;
  challengerPlay?: ChallengerPlay;
};

export type Scenario = {
  id: string;
  label: string;
  icon: string;
  setup: string;
  oneliner: string;
};

export type Challenge = {
  product: Product;
  type: "pitch" | "objection" | "scenario" | "challenger";
  icon: string;
  label: string;
  prompt: string;
  hint: string;
  answer?: string;
};

export const SCENARIOS: Scenario[] = [
  { id: "conference", label: "Conference", icon: "🎪", setup: "You're at an industry conference after-party and a founder at your table asks what you do.", oneliner: "\"So what does your company actually do?\"" },
  { id: "happyhour", label: "Happy Hour", icon: "🍹", setup: "You're at happy hour with a mix of people and someone asks about your job.", oneliner: "\"Wait, Amplitude \u2014 what is that?\"" },
  { id: "gym", label: "Gym", icon: "🏋️", setup: "You're cooling down after a workout and your gym buddy asks what you sell.", oneliner: "\"So what does your company actually make?\"" },
  { id: "nailsalon", label: "Nail Salon / Barber", icon: "💅", setup: "You're in the chair and your stylist asks what you do for work.", oneliner: "\"Oh that sounds fancy \u2014 but what does it actually do?\"" },
  { id: "airplane", label: "Airplane", icon: "✈️", setup: "You're on a flight and your seatmate sees your laptop and asks about your work.", oneliner: "\"I've heard of Amplitude \u2014 what does it do exactly?\"" },
  { id: "baseball", label: "Baseball Game", icon: "⚾", setup: "You're at a game with friends and someone in your group asks what you do.", oneliner: "\"Analytics software \u2014 like spreadsheets?\"" },
  { id: "reunion", label: "Family Reunion", icon: "👨\u200d👩\u200d👧", setup: "Your cousin corners you at the family reunion and asks what you've been up to.", oneliner: "\"So you work in tech? What does your company do?\"" },
  { id: "nightout", label: "Night Out", icon: "🎉", setup: "You're out with friends and someone new to the group asks what you do for work.", oneliner: "\"Wait \u2014 so what exactly do you sell?\"" },
  { id: "uber", label: "Uber / Lyft", icon: "🚗", setup: "Your driver asks what you do and whether it's anything like what they've heard of.", oneliner: "\"Is that like Google Analytics or something?\"" },
  { id: "golf", label: "Golf", icon: "⛳", setup: "You're on the back nine with a prospect and they ask you to explain what you do in plain English.", oneliner: "\"Okay but what does a company actually use it for day to day?\"" },
  { id: "coffee", label: "Coffee Shop", icon: "☕", setup: "Someone at the next table sees your Amplitude sticker and asks about it.", oneliner: "\"I keep seeing that logo \u2014 what is Amplitude?\"" },
  { id: "wedding", label: "Wedding", icon: "💒", setup: "You're at a wedding reception and a guest at your table asks what you do.", oneliner: "\"Tech sales \u2014 so what are you selling?\"" },
  { id: "dogpark", label: "Dog Park", icon: "🐕", setup: "You're at the dog park and another owner asks what you do while your dogs play.", oneliner: "\"Analytics? What does that mean for a regular company?\"" },
  { id: "bookclub", label: "Book Club", icon: "📚", setup: "At a book club, someone asks what you work on since you mentioned data and decisions.", oneliner: "\"So is it like a business intelligence tool?\"" },
  { id: "volunteering", label: "Volunteering", icon: "🤝", setup: "You're volunteering and your partner for the day asks what your day job is.", oneliner: "\"That sounds really interesting \u2014 but what problem does it solve?\"" },
];

export const PRODUCTS: Product[] = [
  {
    id: "analytics",
    name: "Analytics",
    icon: "📊",
    tagline: "One platform, one answer \u2014 no more arguments about whose data is right.",
    color: "#2962FF",
    oneLiner: "Amplitude Analytics shows you exactly what users do inside your product \u2014 so your team stops guessing and starts growing.",
    happyHour: "\"Okay so \u2014 you know how at most companies, product and marketing are always fighting about whose numbers are right? Everyone's got a different spreadsheet, nobody agrees on what's actually driving growth. We fix that. Put everything in one place. I've seen companies completely flip their strategy when they realized their 'best' marketing channel was actually churning customers out the back door. That's a board meeting conversation. Want to grab 30 minutes next week?\"",
    linkedinDrop: "\"Yeah! So basically \u2014 you know how companies say they're 'data-driven' but nobody can actually answer a simple question like 'why did retention drop last month?' We make that answerable in seconds. Product sees what's driving users to stay. Marketing sees which campaigns turn into actual customers \u2014 not just signups. Same tool, same truth. It sounds obvious but most companies don't have it.\"",
    aiAngle: "AI Assistant sits on top of your analytics and answers questions in plain English \u2014 no SQL, no analyst needed. Ask 'why did retention drop last week?' and get an answer in 30 seconds. With Amplitude MCP, that same intelligence works inside Claude, Cursor, or Figma \u2014 wherever your team already lives.",
    objections: [
      { they: "We already use Google Analytics.", you: "GA is great for traffic \u2014 who came and from where. Amplitude answers what they did after they arrived, which features drove them to stay, and why they churned. Different question, different tool." },
      { they: "We built something internally.", you: "Most teams do early on. The question is what it's costing your engineers to maintain it vs. building your actual product. That's usually where the real conversation starts." },
      { they: "We use Mixpanel.", you: "Good tool. The difference is we're a full platform \u2014 analytics, experimentation, session replay, and activation all in one place. No stitching together five vendors to get one answer." },
    ],
    followUpAsk: "\"I'd love to show you what it looks like when product and marketing are finally looking at the same numbers \u2014 takes about 20 minutes. Worth it?\"",
    whatNotToSay: [
      "Don't say 'we're the best analytics tool' \u2014 lead with the problem, not your ranking.",
      "Don't feature-dump funnels, cohorts, and charts \u2014 they care about decisions, not features.",
      "Don't say 'data-driven' \u2014 everyone says it. Show them what a data-driven decision looks like.",
      "Don't position against GA unless they bring it up \u2014 different category, sounds defensive.",
    ],
    connectionPlay: "Once they're nodding, bridge to Session Replay: \"The thing that makes analytics really click is pairing the numbers with actually watching what users do \u2014 that's where Session Replay comes in. Same platform, no context switching.\"",
    challengerPlay: {
      reframe: {
        a: "Most companies believe their analytics problem is a tools problem. They think they just need better dashboards or faster queries. So they add another tool, build another report, and still can't answer the question: 'Why did retention drop last month?'",
        gap: "The real problem isn't the tool. It's that product and marketing are each sitting on their own version of the truth \u2014 and every strategic decision gets delayed or diluted while both sides argue about whose numbers are right. That's not an analytics problem. That's a decision-making problem. And it's costing them speed, alignment, and revenue.",
        b: "When product and marketing operate from the same behavioral data source, the argument disappears. Decisions get made in hours instead of weeks. Teams stop optimizing for the metric they can measure and start optimizing for the outcome that actually matters."
      },
      insight: "The companies that grow fastest aren't the ones with the most data \u2014 they're the ones where product and marketing agree on what the data means. Most companies have one without the other.",
      leadWith: "When your product and marketing teams disagree on a number, how do you resolve it? Most companies I talk to can tell me how many users they have. Almost none can tell me which ones are actually going to stay.",
      notWith: "Amplitude is a product analytics platform used by 4,500+ companies. Don't lead with the product, the logo wall, or the G2 ranking.",
      wheelPrompt: "Don't tell me what Analytics does. Teach me something about my business I didn't know I needed to hear.",
      wheelHint: "Lead with the data argument problem, not the product. Make them feel the gap before you offer the solution."
    },
  },
  {
    id: "sessionreplay",
    name: "Session Replay + Heatmaps",
    icon: "🎞️🔥",
    tagline: "Stop guessing why users drop off. Watch what actually happened.",
    color: "#7B2FFF",
    oneLiner: "Session Replay lets you literally watch recordings of real user sessions so you can see exactly where they get confused, stuck, or drop off.",
    happyHour: "\"So you know that feeling when you can see users dropping off at step 3 of checkout but you have zero idea why? With Session Replay, you literally watch the recording. One of our customers found out everyone was clicking an image thinking it was a button \u2014 fixed it in an afternoon and recovered millions. Before that, they were flying blind. I'd love to show you what your checkout actually looks like to your users.\"",
    linkedinDrop: "\"It's the most 'oh my god why didn't we have this sooner' product. You see a drop-off in your funnel, click it, and you watch what actually happened on screen \u2014 the scrolling, the clicks, the confusion. Heatmaps give you the full picture across your whole site. Every team I've demoed it to has an immediate 'OH. THAT'S the problem' moment. It's like turning on the lights.\"",
    aiAngle: "Session Replay Agent reviews hundreds of sessions automatically \u2014 finds the rage clicks, the dead ends, the friction \u2014 and hands your team a report. No video-watching required. You get the insight without spending hours in the replay queue.",
    objections: [
      { they: "We already have Hotjar.", you: "Hotjar shows you where users click. We show you exactly what happened in the session AND connect it to your product analytics \u2014 so you know not just what they did, but who they are and what happened to them next." },
      { they: "Isn't that a privacy concern?", you: "Great question \u2014 Session Replay masks sensitive fields by default. You see the behavior, not the personal data. It's built for compliance from the ground up." },
      { they: "We don't have the bandwidth to watch recordings.", you: "That's the old way. Our AI summarizes sessions automatically \u2014 you see the patterns without watching a single video." },
    ],
    followUpAsk: "\"I could pull up a live demo of your own site in about 15 minutes \u2014 you'd see exactly what I mean. Want to do that?\"",
    whatNotToSay: [
      "Don't say 'it records your users' \u2014 that sounds creepy. Say 'it shows you how users experience your product.'",
      "Don't lead with heatmaps \u2014 Session Replay is the hero, heatmaps are the supporting feature.",
      "Don't make it sound like surveillance. It's about fixing friction, not watching people.",
      "Don't forget to mention the Amplitude integration \u2014 without it, it's just another recording tool.",
    ],
    connectionPlay: "Bridge to Experimentation: \"Once you see the friction in the recording, the natural next question is 'what should we change?' That's where Experimentation comes in \u2014 you test the fix before you ship it to everyone.\"",
    challengerPlay: {
      reframe: {
        a: "Most teams look at their analytics and see a drop-off in the funnel. Step 3: 60% completion. Step 4: 40%. And they spend the next two weeks hypothesizing about why \u2014 writing tickets, debating in Slack, running surveys.",
        gap: "What they're missing is that the answer is already recorded. It happened. A real user, on a real device, hit exactly the moment where things went wrong \u2014 and nobody watched it. The gap isn't data. It's visibility. Companies are making product decisions based on numbers when the actual story is sitting in a replay queue nobody has time to watch.",
        b: "When you can go from 'users are dropping off at step 3' to 'here's the exact moment they got confused and why' in under 5 minutes \u2014 the whole team stops guessing and starts fixing."
      },
      insight: "Your analytics tell you where users stop. Session Replay tells you why. Most teams only have half the story \u2014 and they're shipping product decisions based on the half that can't explain human behavior.",
      leadWith: "When you see a drop-off in your funnel, what's your process for figuring out why? Most teams I talk to say 'we hypothesize and test.' There's a faster way.",
      notWith: "We record your users' sessions. Don't lead with recording \u2014 it sounds like surveillance. Lead with the visibility gap.",
      wheelPrompt: "Don't pitch Session Replay. Show me the moment a team found a bug they didn't know they had.",
      wheelHint: "Tell the story of a specific discovery \u2014 a rage click, a broken button, a confusing flow \u2014 not what the product does."
    },
  },
  {
    id: "experimentation",
    name: "Experimentation",
    icon: "🧪",
    tagline: "Stop gambling on every product decision. Test first, ship confidently.",
    color: "#00BFA5",
    oneLiner: "Amplitude Experimentation lets any team run A/B tests without filing an engineering ticket \u2014 so you test ideas before they become expensive mistakes.",
    happyHour: "\"So we basically give companies a way to stop guessing. Instead of shipping something to everyone and hoping for the best \u2014 test it on 10% first. And for marketing: our product lets them run website A/B tests without filing a single engineering ticket. That sounds small but every marketing team I've talked to has been waiting on those tickets for months. One team ran more tests in their first month with us than in the entire previous year combined.\"",
    linkedinDrop: "\"It's A/B testing but actually accessible \u2014 two flavors \u2014 one for engineering where you safely roll out features to a small slice of users first, and one for marketing where they can test anything on the website themselves, zero code. And because it's all inside Amplitude, you immediately see if your great idea is quietly hurting retention. Way better than finding out six months later when churn spikes.\"",
    aiAngle: "Website Conversion Agent spots friction in your funnel, proposes test variants automatically, and launches them \u2014 you just approve the winner. It's experimentation on autopilot for teams that want to move fast without breaking things.",
    objections: [
      { they: "Our engineers handle A/B testing.", you: "For feature flags, sure \u2014 that makes sense. But can your marketing team run a test on the homepage without filing a ticket? That's the gap we usually fill first." },
      { they: "We use Optimizely.", you: "Optimizely is great for web testing. The difference is our experimentation is natively connected to your product behavioral data \u2014 so you see retention and downstream impact, not just conversion rate." },
      { they: "We don't have enough traffic to run tests.", you: "Smaller traffic just means longer tests, not impossible ones. We can help you scope what's actually testable at your current scale \u2014 it's usually more than people think." },
    ],
    followUpAsk: "\"If I could show you a test your marketing team could launch this week without touching engineering \u2014 would that be worth 20 minutes?\"",
    whatNotToSay: [
      "Don't say 'A/B testing' and leave it there \u2014 everyone thinks they already do it. Ask them how long their last test took to launch.",
      "Don't lead with feature flags unless you're talking to engineering \u2014 lead with the business outcome (less guessing, faster decisions).",
      "Don't forget to mention the Amplitude data connection \u2014 that's what makes it different from standalone tools.",
      "Don't oversell statistical significance \u2014 explain it simply or skip the jargon entirely.",
    ],
    connectionPlay: "Bridge to Analytics: \"The reason experimentation is so powerful in Amplitude is that the results connect directly back to your behavioral data \u2014 you don't just see who converted, you see what they did next and whether they stuck around.\"",
    challengerPlay: {
      reframe: {
        a: "Most teams believe they're making data-driven product decisions. They look at analytics, they hold team discussions, they rely on the instincts of their most senior people. And then they ship.",
        gap: "What they're actually doing is making educated guesses with extra steps. The difference between a hypothesis and an insight is a test \u2014 and most companies either don't run enough tests, or they run tests they can't trust because they're measuring the wrong thing or running them through the wrong team. Every unvalidated ship is a bet. Some bets pay off. Most don't. And you don't always find out until six months later when churn spikes.",
        b: "When every team \u2014 product AND marketing \u2014 can run a test without filing an engineering ticket, the number of validated decisions goes up and the number of expensive mistakes goes down. That's not a process improvement. That's a compounding advantage."
      },
      insight: "The difference between companies that grow predictably and companies that grow chaotically is usually one thing: how fast they can run a test and trust the result. Most teams are still waiting on engineering to find out if their idea worked.",
      leadWith: "How long does it take your marketing team to run an A/B test on your website without involving engineering? Whatever the answer is \u2014 I can usually cut it to zero.",
      notWith: "We do A/B testing. Feature flags. Statistical significance. Don't lead with the mechanics \u2014 lead with the cost of not testing fast enough.",
      wheelPrompt: "Don't describe Experimentation. Tell me what happens to a company that ships without testing.",
      wheelHint: "Make them feel the cost of slow experimentation \u2014 missed retention signals, expensive rollbacks, guesses masquerading as strategy."
    },
  },
  {
    id: "guidessurveys",
    name: "Guides & Surveys",
    icon: "🐕",
    tagline: "The right nudge at the right time \u2014 not random popups that annoy everyone.",
    color: "#FF6B35",
    oneLiner: "Guides & Surveys lets you show in-app messages, onboarding flows, and collect feedback exactly when and where users need it \u2014 triggered by what they actually did, not a random timer.",
    happyHour: "\"You know those annoying popups that ask for feedback right when you're trying to actually do something? We built the literal opposite. Guides and prompts only show up when they make sense \u2014 based on what the user just did in the app. User got stuck? Guide appears. User just hit a milestone? That's when you ask for a review. One of our customers saw retention go up 18% just from getting this right \u2014 without changing a single line of product code.\"",
    linkedinDrop: "\"It's basically smart in-app tooltips and surveys that trigger based on what a user is actually doing, not just 'it's been 3 days, please rate us 1-5.' The difference between being helpful and being annoying \u2014 and we nail the timing because we know the full behavioral context. Plus everything flows back into Amplitude, so you see what people said AND what they did next. The feedback finally means something.\"",
    aiAngle: "With Amplitude MCP Server, AI tools in your team's workflow can query guide and survey data directly \u2014 so product context travels with the team wherever they work. Your PM's AI assistant knows what users are struggling with before the meeting starts.",
    objections: [
      { they: "We use Intercom for in-app messaging.", you: "Intercom is great for support conversations. Guides & Surveys is built for product moments \u2014 onboarding flows, feature announcements, and NPS triggered by behavior. The difference is the data connection to what users actually did." },
      { they: "Our users hate popups.", you: "Everyone's users hate random popups. The reason ours work is they're triggered by specific behaviors \u2014 so they feel helpful, not interruptive. Right message, right moment." },
      { they: "We just use email for this.", you: "Email is great for users who've already left your product. Guides catch them inside the product at the exact moment they need help \u2014 that's when it actually changes behavior." },
    ],
    followUpAsk: "\"What does your current onboarding flow look like? I'd love to show you what a behavior-triggered version of it could look like \u2014 takes about 20 minutes.\"",
    whatNotToSay: [
      "Don't say 'we do in-app messaging' \u2014 that sounds like a chat widget. Lead with the behavior-triggered angle.",
      "Don't lead with NPS \u2014 it's the least exciting feature. Lead with onboarding and activation.",
      "Don't forget to mention the Amplitude data connection \u2014 that's what separates it from standalone tools like Appcues.",
      "Don't oversell the no-code angle \u2014 technical buyers will ask about customization, non-technical buyers will care about the no-code. Know your audience.",
    ],
    connectionPlay: "Bridge to Activation: \"Guides & Surveys is how you nudge users toward their aha moment \u2014 Activation is how you figure out what that aha moment actually is and build smarter paths to get everyone there.\"",
    challengerPlay: {
      reframe: {
        a: "Most product teams assume their onboarding works. Users sign up, they get a welcome email, maybe a tooltip or two \u2014 and then the team watches the activation rate and wonders why it's stuck at 30%.",
        gap: "The problem is that most in-app communication is designed around what the product team needs users to do, not what users are actually struggling with in the moment. A tooltip that fires three days after signup isn't helpful \u2014 it's noise. A survey that appears every time someone logs in isn't feedback \u2014 it's friction. The result is users who feel interrupted instead of guided, and product teams who are guessing at what users need because the feedback they're collecting isn't connected to what users actually did.",
        b: "When your in-app messages trigger based on real behavior \u2014 when a user gets stuck, hits a milestone, or completes an action \u2014 they feel like the product understands them. Retention goes up. Support tickets go down. And the feedback you collect actually means something because it's tied to what users did, not just what they said."
      },
      insight: "The difference between an annoying popup and a helpful nudge is one thing: timing. Most teams are sending the right message at the wrong moment \u2014 because they don't know what the user just did.",
      leadWith: "When a user gets stuck in your product right now, what happens? Most teams say 'they either figure it out or they churn.' There's a better third option.",
      notWith: "We do in-app tooltips, modals, banners, and NPS surveys. Don't list the UI components \u2014 lead with the timing and behavioral trigger advantage.",
      wheelPrompt: "Don't describe Guides & Surveys. Tell me what it costs a product team when their onboarding doesn't work.",
      wheelHint: "Lead with the gap between what teams think users experience and what users actually experience. The aha moment is the bridge."
    },
  },
  {
    id: "activation",
    name: "Activation",
    icon: "🚀",
    tagline: "Get users to their 'aha moment' before they give up and leave forever.",
    color: "#FFB300",
    oneLiner: "Activation helps you figure out exactly what makes users stick, then build personalized paths to get every new user to that moment faster.",
    happyHour: "\"Here's a stat that surprises most people \u2014 most companies lose the majority of their users before those users ever experience what makes the product actually great. They sign up, wander around, and bounce before the magic happens. We help you find exactly what that magic moment is and build smarter paths to get everyone there faster. One company found just 3 specific actions in week 1 predicted 4x better retention at 90 days. Three things. That's what changes your entire growth trajectory.\"",
    linkedinDrop: "\"It's the most underrated part of the funnel. Everyone obsesses over acquisition and retention but ignores the gap in the middle \u2014 getting someone from just signing up to 'I actually get it.' That's activation. We help you pinpoint your product's aha moment and engineer onboarding to get every user there. Pull that lever and everything else downstream gets easier \u2014 retention, expansion, NRR, all of it.\"",
    aiAngle: "Amplitude MCP Server lets your engineers query live activation data from Cursor or ChatGPT while they build \u2014 so the team building onboarding knows what 'good' looks like before they ship.",
    objections: [
      { they: "We handle onboarding with our product team.", you: "Most do. The question is whether you know which specific actions in week 1 predict retention at 90 days. That's what Activation surfaces \u2014 and it's usually 2 or 3 things, not 20." },
      { they: "We use HubSpot for lifecycle marketing.", you: "HubSpot is great for email sequences. Activation is about understanding the behavioral milestones inside your product that predict whether a user will stick \u2014 that data lives in Amplitude, not your CRM." },
      { they: "Our activation rate is already fine.", you: "Most companies think that until they see the benchmark data. What's your activation rate? We can compare it to similar products on our platform in about 5 minutes." },
    ],
    followUpAsk: "\"Do you know what your aha moment actually is \u2014 the specific in-product action that predicts whether someone stays? I'd love to help you find it.\"",
    whatNotToSay: [
      "Don't say 'activation' and assume they know what it means \u2014 define it as 'getting users to the moment where they actually get the value.'",
      "Don't confuse activation with acquisition \u2014 they're different problems and different buyers.",
      "Don't make it sound like a marketing automation tool \u2014 it's a product analytics and personalization play.",
      "Don't forget the connection to retention \u2014 activation is the lever that makes everything downstream easier.",
    ],
    connectionPlay: "Bridge to Guides & Surveys: \"Once you know what your aha moment is, the next question is how do you get every user there. That's where Guides & Surveys comes in \u2014 behavior-triggered nudges that move users toward that moment in the product itself.\"",
    challengerPlay: {
      reframe: {
        a: "Most growth teams are obsessed with acquisition. CAC, conversion rate, channel mix \u2014 they optimize relentlessly for getting users in the door. And then they watch 70% of those users disappear within the first week.",
        gap: "What they're missing is that acquisition without activation is a leaky bucket. You can pour all the budget you want into the top of the funnel, but if users don't reach the moment where they actually 'get' the product \u2014 the aha moment \u2014 they churn before they ever become customers. Most teams know their activation rate. Almost none know the specific 2-3 in-product actions that actually predict whether a user will be retained at 90 days. Without that, every onboarding decision is a guess.",
        b: "When you know exactly what your aha moment is \u2014 the specific actions that predict long-term retention \u2014 you can engineer every new user's path toward it. That's when acquisition spend starts paying off. That's when retention compounds. That's when growth becomes predictable."
      },
      insight: "Most companies are optimizing for the wrong metric. Getting a user to sign up isn't activation \u2014 it's just arrival. The real question is: what do they need to do in the first week to actually stay? Most teams don't know the answer.",
      leadWith: "Do you know which specific actions in your product, taken in the first week, predict whether a user is still around at 90 days? Most teams don't \u2014 and they're designing onboarding blind.",
      notWith: "We help with user activation and audience management. Don't lead with the feature set \u2014 lead with the aha moment insight gap.",
      wheelPrompt: "Don't describe Activation. Teach me why most companies are optimizing for the wrong thing in their growth funnel.",
      wheelHint: "The reframe is acquisition vs. activation \u2014 getting users in the door vs. getting them to the moment where the product clicks. Lead there."
    },
  },
  {
    id: "aifeedback",
    name: "AI Feedback",
    icon: "🎤",
    tagline: "All that qualitative feedback nobody reads? AI reads it \u2014 and connects it to real behavior.",
    color: "#E91E8C",
    oneLiner: "AI Feedback aggregates everything your users say \u2014 support tickets, reviews, surveys, social \u2014 and surfaces what's actually trending and why it matters, connected to real behavioral data.",
    happyHour: "\"So every company has thousands of support tickets, app store reviews, survey responses \u2014 and nobody reads them. They sit there with all the answers, and everyone's too busy. We use AI to read all of it for you and surface the patterns: what's trending, what's getting worse, what's about to blow up. A team caught a bug killing their enterprise accounts from a spike in complaints \u2014 before it ever showed up in their churn numbers. That's the kind of thing that saves a quarter.\"",
    linkedinDrop: "\"It's an 'finally' product. You know how the answers are always somewhere in your customer feedback but nobody has time to dig? AI does the digging. It reads your tickets, reviews, and surveys \u2014 surfaces the top themes and tracks whether they're getting better or worse \u2014 and connects it to actual user behavior. So instead of 'customers seem frustrated,' you know exactly who, about what, and how urgent it is.\"",
    aiAngle: "Customer Feedback Agent runs continuously \u2014 it proactively alerts you when sentiment is shifting so you're never caught off guard at a QBR. It connects what users say to what users do, in real time, across every feedback channel you have.",
    objections: [
      { they: "We have a customer success team for this.", you: "CS teams are great at relationship management. The question is whether they have time to read 10,000 support tickets a month and surface the patterns. That's what AI Feedback does \u2014 it's the layer underneath that tells CS where to focus." },
      { they: "We use Medallia / Qualtrics for feedback.", you: "Those are great survey tools. AI Feedback goes beyond surveys \u2014 it reads support tickets, app store reviews, social, and call scripts too. And it connects everything back to behavioral data in Amplitude so you know not just what users said but what they did." },
      { they: "We already tag our support tickets.", you: "Manual tagging catches what you're already looking for. AI Feedback surfaces what you didn't know to look for \u2014 the emerging patterns before they become a crisis." },
    ],
    followUpAsk: "\"How do you currently find out what your users are frustrated about before it shows up in churn? I'd love to show you what we're seeing in your category.\"",
    whatNotToSay: [
      "Don't say 'sentiment analysis' \u2014 it sounds like a 2015 marketing tool. Lead with the problem: you have more feedback than you can read.",
      "Don't lead with the AI angle \u2014 lead with the problem it solves, then reveal that AI is how it does it.",
      "Don't forget the behavioral data connection \u2014 without it, it's just another feedback aggregator.",
      "Don't make it sound like it replaces your CS team \u2014 it makes them faster and smarter.",
    ],
    connectionPlay: "Bridge to Analytics: \"The reason AI Feedback is really powerful is because it connects to your behavioral data \u2014 so you go from 'users are complaining about X' to 'users who experience X have 40% lower retention.' That's where the Analytics layer comes in.\"",
    challengerPlay: {
      reframe: {
        a: "Most companies think they're listening to their customers. They have a support team, an NPS survey, maybe an app store presence. The problem is that listening and understanding are two very different things.",
        gap: "The average company at scale is receiving thousands of signals every week \u2014 support tickets, reviews, survey responses, social mentions, call transcripts \u2014 and almost none of it gets read by anyone who can act on it. It sits in separate systems, tagged inconsistently, summarized quarterly in a report that's already three months out of date. Meanwhile, the patterns that predict churn, the bugs that are killing enterprise accounts, the feature gaps that are driving users to competitors \u2014 they're all in there. Nobody's looking.",
        b: "When AI reads all of it for you \u2014 aggregates it, surfaces the trends, connects sentiment to actual behavior \u2014 you go from 'customers seem frustrated about something' to 'here's exactly what's driving churn, who's affected, and what to do about it.' That's the difference between listening and acting."
      },
      insight: "The most important signals about your product's future are already in your customer feedback. The problem isn't that companies don't collect feedback \u2014 it's that nobody has time to read it all. AI does.",
      leadWith: "How do you currently find out what your customers are frustrated about before it shows up in churn? Most teams say 'our CS team tells us' or 'we look at NPS.' Both are too slow.",
      notWith: "We aggregate support tickets, reviews, and surveys into one dashboard. Don't lead with the data sources \u2014 lead with the signal that's already there and being missed.",
      wheelPrompt: "Don't describe AI Feedback. Tell me about the insight a company almost missed \u2014 and what would have happened if they had.",
      wheelHint: "The story is about speed and signal \u2014 a pattern hiding in thousands of tickets that almost became a churn crisis. Make it feel urgent."
    },
  },
  {
    id: "aiassistant",
    name: "AI Assistant",
    icon: "🤖",
    tagline: "Anyone on your team gets answers from your data \u2014 in plain English, in seconds, no analyst needed.",
    color: "#00C853",
    oneLiner: "Amplitude AI Assistant is a built-in AI that answers questions about your product data in plain English \u2014 so anyone can get insights without knowing SQL or waiting for a data analyst.",
    happyHour: "\"We're trying to make it so that anyone at a company \u2014 not just the data team \u2014 can answer their own questions. You shouldn't have to file a ticket and wait three days to know if your new feature is working. You just ask. In plain English. And you get a real answer in 30 seconds. One of our customers went from 20 people using analytics to 80 in a single month. That's not a product update \u2014 that's a culture shift. I'd love to show you what that unlocks.\"",
    linkedinDrop: "\"It's like having a really smart analyst available 24/7 who never gets annoyed when you ask the same question twice. You type what you want to know, it builds the chart and explains what it means. And it proactively tells you when something weird is happening with your metrics \u2014 before you even think to ask. Best part? With MCP Server, that same power works inside Claude, ChatGPT, Cursor, and Figma \u2014 wherever your team already lives.\"",
    aiAngle: "Amplitude MCP Server extends AI Assistant to any AI tool \u2014 Claude, ChatGPT, Cursor, Figma. Your behavioral data travels with your team. No tab-switching, no waiting, no ticket.",
    objections: [
      { they: "We have a data team for this.", you: "Your data team is probably overwhelmed with ad-hoc requests. AI Assistant doesn't replace them \u2014 it handles the routine questions so they can focus on the analysis that actually requires human judgment." },
      { they: "Our team already uses ChatGPT for data questions.", you: "ChatGPT doesn't know your data. Amplitude AI Assistant is trained on your actual behavioral data \u2014 it gives you real answers about your real users, not generic advice." },
      { they: "We already have a BI tool.", you: "BI tools are great for dashboards. AI Assistant is conversational \u2014 you ask a question in plain English and get an answer. No building a report, no waiting for a data pull." },
    ],
    followUpAsk: "\"What's the last question you had to wait more than a day to get answered about your product? I'd love to show you how fast that answer would come back.\"",
    whatNotToSay: [
      "Don't say 'AI chatbot' \u2014 it undersells it. It's a behavioral intelligence layer.",
      "Don't lead with the MCP angle to a non-technical audience \u2014 lead with the 30-second answer story.",
      "Don't make it sound like it replaces your data team \u2014 it democratizes access to data.",
      "Don't forget to connect it to real examples \u2014 'how many users completed onboarding last week' is a better demo than abstract capabilities.",
    ],
    connectionPlay: "Bridge to Analytics: \"AI Assistant is the interface on top of your analytics data \u2014 the way you make that data accessible to everyone, not just the people who know how to build charts. The more complete your Analytics setup, the smarter the Assistant gets.\"",
    challengerPlay: {
      reframe: {
        a: "Most companies say they're data-driven. What they really mean is: the data team is data-driven, and everyone else files a ticket and waits three days for an answer.",
        gap: "The gap between 'we have data' and 'we make decisions with data' is an access problem \u2014 not a technology problem. The data exists. The analytics platform exists. But 80% of the people who could benefit from it can't use it without knowing SQL, building a chart, or asking someone who knows how. So they guess. They go on instinct. They wait. And by the time the answer comes back, the moment to act on it has passed.",
        b: "When anyone on the team can ask a question in plain English and get a real answer in 30 seconds \u2014 not a dashboard link, not a ticket, a real answer \u2014 the entire organization starts making faster, better decisions. That's not a product feature. That's a culture shift."
      },
      insight: "The bottleneck in most data-driven companies isn't the data \u2014 it's the 3-day wait for someone who can query it. AI Assistant removes the bottleneck without replacing the data team.",
      leadWith: "What's the last question someone on your team had to wait more than a day to get answered about your product? Whatever it was \u2014 that wait is the problem we solve.",
      notWith: "We have an AI chatbot that answers questions about your data. Don't say chatbot. Don't lead with the interface \u2014 lead with the access gap it closes.",
      wheelPrompt: "Don't describe AI Assistant. Tell me what a company loses every time someone has to file a ticket to get a data question answered.",
      wheelHint: "The insight is about access and speed \u2014 the cost of the gap between having data and being able to act on it. Lead with the 3-day wait story."
    },
  },
];

export const SECTIONS = [
  { key: "oneLiner", label: "\ud83c\udfaf One-Liner", desc: "The headline. One sentence, no setup needed." },
  { key: "happyHour", label: "\ud83c\udf79 Happy Hour", desc: "Casual, story-led. You bump into a prospect." },
  { key: "linkedinDrop", label: "\ud83d\udcbc LinkedIn Drop", desc: "Slightly more polished, post-worthy." },
  { key: "aiAngle", label: "🦾 AI Angle", desc: "Connect it to the Amplitude AI ecosystem." },
  { key: "challengerPlay", label: "🎓 Challenger Play", desc: "Lead with insight, not product. Reframe the problem." },
  { key: "whatNotToSay", label: "\u274c What NOT to Say", desc: "Common mistakes to avoid." },
  { key: "objections", label: "\ud83d\udcac Objection Pivot", desc: "When they push back \u2014 natural one-liners." },
  { key: "followUpAsk", label: "\ud83e\ude9d Follow-Up Ask", desc: "Move forward without killing the vibe." },
  { key: "connectionPlay", label: "\ud83d\udd17 Connection Play", desc: "Bridge to another Amplitude product." },
] as const;

export const WHEEL_COLORS = ["#2962FF", "#7B2FFF", "#00BFA5", "#FF6B35", "#FFB300", "#E91E8C", "#00C853"];

export function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateChallenge(product: Product): Challenge {
  const challengeType = Math.floor(Math.random() * 4);

  if (challengeType === 0) {
    return {
      product,
      type: "pitch",
      icon: "🎯",
      label: "Tell Me About It",
      prompt: `Hey, what does ${product.name} actually do?`,
      hint: "Give a natural 1\u20132 minute answer. No slides, no jargon.",
    };
  } else if (challengeType === 1) {
    const obj = getRandom(product.objections);
    return {
      product,
      type: "objection",
      icon: "🛡️",
      label: "Handle the Objection",
      prompt: obj.they,
      hint: "Respond naturally \u2014 don't get defensive, reframe it.",
      answer: obj.you,
    };
  } else if (challengeType === 2) {
    const scenario = getRandom(SCENARIOS);
    return {
      product,
      type: "scenario",
      icon: scenario.icon,
      label: scenario.label,
      prompt: `${scenario.setup} They say: ${scenario.oneliner}`,
      hint: "Keep it under 2 minutes. Conversational, not salesy.",
    };
  } else {
    const cp = product.challengerPlay;
    return {
      product,
      type: "challenger",
      icon: "🔥",
      label: "Challenger Play",
      prompt: cp?.wheelPrompt || `Teach me something about my business I didn't know I needed to hear \u2014 using ${product.name}.`,
      hint: cp?.wheelHint || "Lead with the insight gap, not the product. Make them feel the problem before you offer the solution.",
    };
  }
}
