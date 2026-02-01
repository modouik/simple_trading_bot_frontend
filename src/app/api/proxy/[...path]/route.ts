import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function getBackendBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    DEFAULT_API_BASE_URL;
  const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
  const trimmed = withProtocol.endsWith("/") ? withProtocol.slice(0, -1) : withProtocol;
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
  method: string,
  pathSegment: string,
  bodyString: string,
  timestamp: string,
  nonce: string
): string {
  return `${timestamp}${nonce}${method.toUpperCase()}/api/${pathSegment}${bodyString}`;
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
  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  const hmacSecret = process.env.HMAC_SECRET || "";
  if (!hmacSecret) {
    console.error("[proxy] HMAC_SECRET is not set");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const baseUrl = getBackendBaseUrl();
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const targetPath = pathSegment ? `/${pathSegment}` : "";
  const targetUrl = `${baseUrl}${targetPath}${queryString ? `?${queryString}` : ""}`;

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
  const signaturePayload = buildSignaturePayload(
    method,
    pathSegment,
    bodyString,
    timestamp,
    nonce
  );
  const signature = signHmacSha256(signaturePayload, hmacSecret);

  const headersToSend = new Headers();
  headersToSend.set("X-Timestamp", timestamp);
  headersToSend.set("X-Nonce", nonce);
  headersToSend.set("X-Signature", signature);
  headersToSend.set("Accept", "application/json");

  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower === "authorization" ||
      lower === "content-type" ||
      lower === "accept-language"
    ) {
      headersToSend.set(key, value);
    }
  });

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (cookieHeader) {
    headersToSend.set("Cookie", cookieHeader);
  }

  const fetchOptions: RequestInit = {
    method,
    headers: headersToSend,
    cache: "no-store",
  };
  if (bodyString && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    fetchOptions.body = bodyString;
  }

  try {
    const backendResponse = await fetch(targetUrl, fetchOptions);
    const contentType = backendResponse.headers.get("content-type") ?? "";
    const isJson =
      contentType.includes("application/json") ||
      contentType.includes("application/vnd.api+json");

    const buffer = await backendResponse.arrayBuffer();
    let body: BodyInit | null = buffer.byteLength ? buffer : null;
    if (buffer.byteLength && isJson) {
      try {
        const text = new TextDecoder().decode(buffer);
        const json = JSON.parse(text);
        return NextResponse.json(json, {
          status: backendResponse.status,
          statusText: backendResponse.statusText,
          headers: { "content-type": contentType },
        });
      } catch {
        body = buffer;
      }
    }

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        lower === "content-type" ||
        lower === "content-length" ||
        lower === "cache-control"
      ) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("[proxy] Backend fetch error:", err);
    return NextResponse.json(
      { error: "Backend unavailable" },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}
