import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

/**
 * ⚡️ LOGIQUE STRICTE POSTMAN
 * Script: const dataToSign = body + nonce + timestamp;
 */
function buildSignaturePayload(
  bodyString: string,
  nonce: string,
  timestamp: string
): string {
  // ATTENTION : L'ordre est Body + Nonce + Timestamp
  // Pour un GET, bodyString est vide "", donc ça donne Nonce + Timestamp
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

  // Récupération du Secret
  const hmacSecret = (process.env.HMAC_SECRET || "").trim();
  
  const baseUrl = getBackendBaseUrl();
  const rawQueryString = request.nextUrl.search;
  const relativeUri = `/api/${pathSegment}${rawQueryString}`;
  const targetUrl = `${baseUrl.replace(/\/api$/, '')}${relativeUri}`;

  // 1. Gestion du Body (Exactement comme ton script Postman)
  let bodyString = "";
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    try {
      bodyString = await request.text();
    } catch {
      bodyString = "";
    }
  }
  // Note: Pour un GET, bodyString reste "" (vide), ce qui est correct.

  const timestamp = generateTimestamp();
  const nonce = generateNonce();

  // 2. Signature : ON APPLIQUE TA FORMULE POSTMAN
  // dataToSign = body + nonce + timestamp
  const signaturePayload = buildSignaturePayload(bodyString, nonce, timestamp);
  
  const signature = hmacSecret ? signHmacSha256(signaturePayload, hmacSecret) : "";

  // 🔍 LOGS DEBUG pour vérifier que ça match Postman
  console.log("---------------- POSTMAN LOGIC DEBUG ----------------");
  console.log(`🔹 Body (Len): ${bodyString.length}`);
  console.log(`🔹 Nonce: ${nonce}`);
  console.log(`🔹 Timestamp: ${timestamp}`);
  console.log(`🔹 Payload Signé: ${signaturePayload}`);
  console.log(`🔹 Signature: ${signature}`);
  console.log("-----------------------------------------------------");

  const headersToSend = new Headers();
  // Noms exacts des headers Postman
  headersToSend.set("X-Nonce", nonce);
  headersToSend.set("X-Timestamp", timestamp);
  headersToSend.set("X-Signature", signature); // Postman envoie X-Signature, pas Signature
  
  headersToSend.set("Accept", "application/json");

  // Transfert des headers (Authorization Bearer, etc.)
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower !== "host" && lower !== "connection" && lower !== "content-length") {
      headersToSend.set(key, value);
    }
  });

  const cookieStore = await cookies();
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