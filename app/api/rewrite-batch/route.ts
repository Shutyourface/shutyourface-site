import { NextRequest, NextResponse } from "next/server";

type EventInput = { text: string; year: number; index: number };

export async function POST(request: NextRequest) {
  const body = await request.json();
  const events: EventInput[] = body.events || [];
  const apiKey = ((process.env.ANTHROPIC_API_KEY || body.apiKey || request.headers.get("x-anthropic-key")) ?? "").trim();

  if (!events.length) return NextResponse.json({ error: "No events provided" }, { status: 400 });
  if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 401 });

  const eventList = events.map((e, i) => `${i + 1}. [${e.year}] ${e.text}`).join("\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `You write headlines for ShutYourFace.com, a punchy Drudge-style news aggregator. Rewrite each historical event below as a tabloid headline — sharp, short, clickable, nonpartisan. Include the year naturally in the headline (e.g. "In 1969, Man Lands on Moon" or "1963: President Shot in Dallas"). Maximum 12 words each. Return ONLY a numbered list matching the input order, one headline per line, no extra text or explanations.\n\n${eventList}`,
        },
      ],
    }),
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) return NextResponse.json({ error: data.error?.message || "AI rewrite failed" }, { status: response.status });

  const text: string = data.content?.[0]?.text?.trim() ?? "";
  const headlines = text
    .split("\n")
    .filter((l: string) => l.trim())
    .map((l: string) => l.replace(/^\d+\.\s*/, "").trim())
    .filter((h: string) => h.length > 0);

  return NextResponse.json({ headlines }, { headers: { "Cache-Control": "no-store" } });
}
