import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { DEVICE_ID_COOKIE, DYNAMIC_HMAC_SECRET_COOKIE } from "@/lib/auth/constants";

const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function getBackendBaseUrl(): string {
  let raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    DEFAULT_API_BASE_URL;

  if (!raw.startsWith("http")) {
    raw = `https://${raw}`;
  }

  const trimmed = raw.endsWith("/") ? raw.slice(0, -1) : raw;
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

function generateNonce(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function generateTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

function buildSignaturePayload(
  bodyString: string,
  nonce: string,
  timestamp: string
): string {
  return `${bodyString}${nonce}${timestamp}`;
}

function signHmacSha256(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  const pathSegment = pathSegments.length ? pathSegments.join("/") : "";
  const method = request.method;

  const cookieStore = await cookies();
  const dynamicSecret = cookieStore.get(DYNAMIC_HMAC_SECRET_COOKIE)?.value?.trim();
  const deviceId = cookieStore.get(DEVICE_ID_COOKIE)?.value?.trim();
  const staticSecret = (process.env.HMAC_SECRET || "").trim();
  const hmacSecret = dynamicSecret || staticSecret;

  const baseUrl = getBackendBaseUrl();
  const rawQueryString = request.nextUrl.search;
  const relativeUri = `/api/${pathSegment}${rawQueryString}`;
  const targetUrl = `${baseUrl.replace(/\/api$/, "")}${relativeUri}`;

  let bodyString = "";
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    try {
      bodyString = await request.text();
    } catch {
      bodyString = "";
    }
  }

  const timestamp = generateTimestamp();
  const nonce = generateNonce();
  const signaturePayload = buildSignaturePayload(bodyString, nonce, timestamp);
  const signature = hmacSecret ? signHmacSha256(signaturePayload, hmacSecret) : "";

  const headersToSend = new Headers();
  headersToSend.set("X-Nonce", nonce);
  headersToSend.set("X-Timestamp", timestamp);
  headersToSend.set("X-Signature", signature);
  if (deviceId) headersToSend.set("X-Device-ID", deviceId);
  headersToSend.set("Accept", "application/json");

  // Transfert des headers (Authorization Bearer, etc.)
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower !== "host" && lower !== "connection" && lower !== "content-length") {
      headersToSend.set(key, value);
    }
  });

  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  if (cookieHeader) headersToSend.set("Cookie", cookieHeader);

  const fetchOptions: RequestInit = {
    method,
    headers: headersToSend,
    cache: "no-store",
    redirect: "manual",
  };

  if (bodyString && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    fetchOptions.body = bodyString;
  }

  try {
    const backendResponse = await fetch(targetUrl, fetchOptions);
    const buffer = await backendResponse.arrayBuffer();

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      if (!["content-encoding", "transfer-encoding"].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(buffer, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });

  } catch (err) {
    console.error("Proxy Error:", err);
    return NextResponse.json({ error: "Proxy Error" }, { status: 502 });
  }
}

export async function GET(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function POST(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function PUT(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function PATCH(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function DELETE(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }