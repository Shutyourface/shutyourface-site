import { NextRequest, NextResponse } from "next/server";

function cleanKey(key: string) {
  return key.trim();
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const headline = typeof body.headline === "string" ? body.headline.trim() : "";
  const apiKey = cleanKey(process.env.ANTHROPIC_API_KEY || body.apiKey || request.headers.get("x-anthropic-key") || "");

  if (!headline) {
    return NextResponse.json({ error: "Missing headline" }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: "Missing Anthropic API key" }, { status: 401 });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 80,
      messages: [
        {
          role: "user",
          content: `You write headlines for ShutYourFace.com, a punchy no-BS news aggregator. Rewrite this headline so it pops: sharper, shorter, clickable, and nonpartisan. Maximum 12 words. Return only the rewritten headline, no quotes, no explanation.\n\nOriginal headline: ${headline}`,
        },
      ],
    }),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: data.error?.message || "AI rewrite failed" }, { status: response.status });
  }

  const rewritten = data.content?.[0]?.text?.trim();

  if (!rewritten) {
    return NextResponse.json({ error: "AI returned an empty rewrite" }, { status: 502 });
  }

  return NextResponse.json({ headline: rewritten }, { headers: { "Cache-Control": "no-store" } });
}
