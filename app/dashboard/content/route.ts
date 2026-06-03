import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const cookieName = "syf_dashboard_auth";

export async function GET(request: Request) {
  const isUnlocked = cookies().get(cookieName)?.value === "ok";

  if (!isUnlocked) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const filePath = path.join(process.cwd(), "private", "syf-curation-dashboard.html");
  const html = await readFile(filePath, "utf8");

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
