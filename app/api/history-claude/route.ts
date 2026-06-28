import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { month, day } = body as { month: string; day: string };
  const apiKey = ((process.env.ANTHROPIC_API_KEY || body.apiKey || req.headers.get("x-anthropic-key")) ?? "").trim();

  if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  if (!month || !day) return NextResponse.json({ error: "Missing month or day" }, { status: 400 });

  // Step 1: Fetch raw events from Wikipedia (free, no AI cost)
  const wikiRes = await fetch(
    `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${parseInt(month, 10)}/${parseInt(day, 10)}`,
    { headers: { "Accept": "application/json" } }
  );
  if (!wikiRes.ok) return NextResponse.json({ error: `Wikipedia fetch failed: ${wikiRes.status}` }, { status: 502 });

  const wikiData = await wikiRes.json() as { events?: Array<{ year: number; text: string; pages?: Array<{ content_urls?: { desktop?: { page?: string } } }> }> };
  const rawEvents = (wikiData.events || []).map(e => ({
    year: e.year,
    text: e.text,
    url: e.pages?.[0]?.content_urls?.desktop?.page || "",
  }));

  if (!rawEvents.length) return NextResponse.json({ error: "No Wikipedia events found for this date" }, { status: 404 });

  // Step 2: Send to Claude to pick the best 15 and rewrite in SYF voice
  const eventList = rawEvents.map((e, i) => `${i + 1}. [${e.year}] ${e.text}`).join("\n");

  const prompt = `You are a tabloid editor for ShutYourFace.com, a Drudge Report-style news aggregator.

Below is Wikipedia's full list of historical events for this date. Your job: pick the 15 most compelling and rewrite them in SYF voice.

PICK events about:
- Celebrity deaths, scandals, arrests (the more shocking the better)
- Iconic movies, albums, TV shows everyone knows
- Sports moments people talk about forever (Tyson biting ear, miracle on ice, etc.)
- Famous crimes, murders, trials
- Wars, battles, major turning points
- Inventions and tech milestones everyone knows (moon landing, iPhone, first TV)
- Presidential moments: assassinations, inaugurations, scandals
- Disasters everyone's heard of (Titanic, Hindenburg, Chernobyl)
- Wild/weird/shocking stories with strong narrative hooks

SKIP:
- Obscure political appointments, minor treaty signings
- Events involving people or places no general reader would recognize
- Anything dry or academic

WIKIPEDIA EVENTS:
${eventList}

Return a JSON array of exactly 15 objects with these keys:
- "year": number (from the Wikipedia entry)
- "description": string (2-3 sentence factual account)
- "headline": string (ALL CAPS Drudge/tabloid style, punchy, must end with "...")
- "blurb": string (two vivid sentences that make a reader want to click)
- "sourceUrl": string (use the Wikipedia URL if provided, otherwise construct one: https://en.wikipedia.org/wiki/[Topic])

Return ONLY a valid JSON array. No markdown, no commentary.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json() as { content?: Array<{ type: string; text?: string }>; error?: { message: string } };
  if (!res.ok) return NextResponse.json({ error: data.error?.message || "Claude API error" }, { status: res.status });

  const raw = data.content?.find(b => b.type === "text")?.text ?? "[]";
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();

  let events: unknown[];
  try {
    events = JSON.parse(cleaned);
  } catch {
    return NextResponse.json({ error: "Claude returned invalid JSON", raw }, { status: 500 });
  }

  return NextResponse.json({ events });
}
