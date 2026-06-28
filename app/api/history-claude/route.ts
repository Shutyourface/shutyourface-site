import { NextRequest, NextResponse } from "next/server";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

type ContentBlock = { type: string; text?: string; id?: string; name?: string; input?: unknown };
type Message = { role: string; content: ContentBlock[] | string };
type ApiResponse = {
  content?: ContentBlock[];
  stop_reason?: string;
  error?: { message: string };
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { month, day } = body as { month: string; day: string };
  const apiKey = ((process.env.ANTHROPIC_API_KEY || body.apiKey || req.headers.get("x-anthropic-key")) ?? "").trim();

  if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  if (!month || !day) return NextResponse.json({ error: "Missing month or day" }, { status: 400 });

  const monthName = MONTH_NAMES[parseInt(month, 10) - 1];
  const dayNum = parseInt(day, 10);

  const prompt = `You are a history curator for ShutYourFace.com, a Drudge Report-style news aggregator with a bold tabloid voice.

Search "On This Day ${monthName} ${dayNum}" across Britannica, History.com, Wikipedia, and similar reputable history sites. Generate 25-30 of the most notable and recognizable historical events that occurred on ${monthName} ${dayNum} across history.

PRIORITIZE:
- Events from 1850 onward (modern era — readers connect with these more)
- Events involving well-known people, places, or institutions readers would recognize
- Dramatic moments: assassinations, disasters, scandals, war milestones, cultural firsts
- Wild/weird stories with strong narrative hooks
- Pop culture milestones: famous album releases, movie premieres, sports records, celebrity births/deaths

AVOID:
- Obscure medieval events readers won't recognize
- Minor political appointments, routine treaty signings
- Anything before 1700 unless it's a genuinely famous event (Columbus, major battles, founding moments)
- Generic "a king was born" or "a duke died" entries

For each event return an object with these exact keys:
- "year": number
- "description": string (2-3 sentence factual account of what happened)
- "headline": string (ALL CAPS Drudge/tabloid style, punchy and provocative, must end with "...")
- "blurb": string (exactly two sentences written to hook a reader — vivid, dramatic, makes them want to click)
- "sourceUrl": string (a real specific Wikipedia article URL for this event)

Return ONLY a valid JSON array. No markdown fences, no commentary, no wrapper text.`;

  try {
    const messages: Message[] = [{ role: "user", content: prompt }];
    let finalText = "";
    let iterations = 0;

    while (iterations < 8) {
      iterations++;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": "web-search-2025-03-05",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 8192,
          tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 1 }],
          messages,
        }),
      });

      const data = await res.json() as ApiResponse;
      if (!res.ok) return NextResponse.json({ error: data.error?.message || "Claude API error" }, { status: res.status });

      const content = data.content || [];

      // Collect any text blocks
      const textBlocks = content.filter(b => b.type === "text" && b.text);
      if (textBlocks.length > 0) {
        finalText = textBlocks.map(b => b.text ?? "").join("");
      }

      if (data.stop_reason === "end_turn") break;

      if (data.stop_reason === "tool_use") {
        // Add assistant turn
        messages.push({ role: "assistant", content });
        // Return empty tool_result for each tool_use block so Claude can continue
        const toolUses = content.filter(b => b.type === "tool_use" && b.id);
        messages.push({
          role: "user",
          content: toolUses.map(b => ({
            type: "tool_result",
            tool_use_id: b.id,
            content: "",
          })) as unknown as ContentBlock[],
        });
      } else {
        break;
      }
    }

    if (!finalText) return NextResponse.json({ error: "No response from Claude" }, { status: 500 });

    const cleaned = finalText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
    let events: unknown[];
    try {
      events = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Claude returned invalid JSON", raw: finalText }, { status: 500 });
    }

    return NextResponse.json({ events });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
