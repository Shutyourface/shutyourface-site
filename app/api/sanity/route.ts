import { NextRequest, NextResponse } from "next/server";

const projectId = "faufs903";
const dataset = "production";
const apiVersion = "2025-05-28";
const baseUrl = `https://${projectId}.api.sanity.io/v${apiVersion}`;

function cleanToken(token: string) {
  return token.replace(/^Bearer\s+/i, "").trim();
}

function getToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const dashboardToken = request.headers.get("x-sanity-token");
  const envToken = process.env.SANITY_API_TOKEN;

  if (envToken) {
    return cleanToken(envToken);
  }

  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return cleanToken(authorization);
  }

  return dashboardToken ? cleanToken(dashboardToken) : "";
}

function responseFromSanity(data: unknown, status: number) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Missing required query parameter: query" }, { status: 400 });
  }

  const params = new URLSearchParams();
  params.set("query", query);

  request.nextUrl.searchParams.forEach((value, key) => {
    if (key !== "query") {
      params.append(key, value);
    }
  });

  const response = await fetch(`${baseUrl}/data/query/${dataset}?${params.toString()}`, {
    headers: {
      ...(getToken(request) ? { Authorization: `Bearer ${getToken(request)}` } : {}),
    },
    cache: "no-store",
  });

  const data = await response.json();
  return responseFromSanity(data, response.status);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const token = getToken(request) || (typeof body.token === "string" ? cleanToken(body.token) : "");

  if (!token) {
    return NextResponse.json({ error: "Missing Sanity API token. Set SANITY_API_TOKEN or send x-sanity-token." }, { status: 401 });
  }

  delete body.token;

  const endpoint = body.query ? "query" : "mutate";
  const url = endpoint === "query" ? `${baseUrl}/data/query/${dataset}` : `${baseUrl}/data/mutate/${dataset}?returnDocuments=true`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await response.json();
  return responseFromSanity(data, response.status);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
