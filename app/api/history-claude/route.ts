import { NextRequest, NextResponse } from "next/server";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { month, day } = body as { month: string; day: string };
  const apiKey = ((process.env.ANTHROPIC_API_KEY || body.apiKey || req.headers.get("x-anthropic-key")) ?? "").trim();

  if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  if (!month || !day) return NextResponse.json({ error: "Missing month or day" }, { status: 400 });

  const monthName = MONTH_NAMES[parseInt(month, 10) - 1];
  const dayNum = parseInt(day, 10);

  const prompt = `You are a history curator for ShutYourFace.com, a Drudge Report-style news aggregator with a bold tabloid voice.

Generate 25-30 significant historical events that occurred on ${monthName} ${dayNum} throughout history. Draw from your knowledge of Wikipedia, Britannica's "On This Day," History.com's "This Day in History," and other reputable references.

PRIORITIZE events with strong narrative hooks: dramatic moments, famous figures, bizarre/weird stories, disasters, political shockers, wars, assassinations, scandals, cultural milestones, world records, stunning upsets. SKIP minor treaty signings, routine appointments, and forgettable events unless genuinely world-changing.

Spread across different centuries and categories — don't cluster everything in one era.

For each event return an object with these exact keys:
- "year": number
- "description": string (2-3 sentence factual account of what happened)
- "headline": string (ALL CAPS Drudge/tabloid style, punchy and provocative, must end with "...")
- "blurb": string (exactly two sentences written to hook a reader — vivid, dramatic, makes them want to click)
- "sourceUrl": string (a real, specific Wikipedia article URL for this event — e.g. https://en.wikipedia.org/wiki/Event_Name)

Return ONLY a valid JSON array. No markdown fences, no commentary, no wrapper text.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json() as { content?: Array<{ type: string; text: string }>; error?: { message: string } };
    if (!res.ok) return NextResponse.json({ error: data.error?.message || "Claude API error" }, { status: res.status });

    const raw = data.content?.[0]?.type === "text" ? data.content[0].text : "[]";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();

    let events: unknown[];
    try {
      events = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Claude returned invalid JSON", raw }, { status: 500 });
    }

    return NextResponse.json({ events });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
