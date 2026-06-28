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

Use your web search to look up "On This Day ${monthName} ${dayNum}" on onthisday.com, history.com, britannica.com, thefactsite.com, and thisdaytrivia.com. Pull events from those results.

Generate 25-30 events that occurred on ${monthName} ${dayNum}. The target reader is an American who watches the news, loves pop culture, and remembers major moments from the last 100 years.

WANT MORE OF THIS:
- Celebrity deaths, scandals, arrests, feuds (Jayne Mansfield killed, Mike Tyson bites Holyfield's ear)
- Iconic movie/album/TV premieres readers actually know (Grease released, Thriller drops, Star Wars opens)
- Sports moments everyone remembers (Ali vs Frazier, Miracle on Ice, O.J. chase)
- Famous crimes, murders, trials (Manson, JFK, BTK, Columbine)
- Inventions and tech milestones everyone knows (iPhone announced, moon landing, first TV broadcast)
- Wars: D-Day, Pearl Harbor, 9/11, Vietnam milestones — major turning points only
- Presidential moments: inaugurations, assassinations, scandals (Watergate, Monica, Jan 6)
- Disasters everyone's heard of (Titanic, Hindenburg, Chernobyl, Katrina)
- Wild/weird/shocking stories with strong narrative hooks
- Famous births of icons readers know by first name

KEEP FROM THE 1800s ONLY:
- Presidents, wars, inventions that shaped modern America
- Events every American learned in school (Lincoln shot, Civil War battles, Gold Rush)
- Skip everything else from the 1800s

HARD AVOID:
- Anything before 1800 unless it's Columbus, a founding father, or a world-famous battle
- Obscure kings, dukes, bishops, minor nobles
- Treaty signings no one has heard of
- "A parliament was formed in [obscure country]"
- Routine political appointments
- Academic/scientific events no general reader would recognize

For each event return an object with these exact keys:
- "year": number
- "description": string (2-3 sentence factual account)
- "headline": string (ALL CAPS Drudge/tabloid style, punchy, must end with "...")
- "blurb": string (two sentences to hook a reader — vivid, dramatic, makes them want to click)
- "sourceUrl": string (specific Wikipedia article URL)

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
          tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
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
