import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/**
 * Détermine l'URL de base du backend Laravel
 */
function getBackendBaseUrl(): string {
  let raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    DEFAULT_API_BASE_URL;

  // Si pas de protocole, on assume https sauf si localhost/docker (simplification)
  if (!raw.startsWith("http")) {
    raw = `https://${raw}`;
  }

  const trimmed = raw.endsWith("/") ? raw.slice(0, -1) : raw;
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

/**
 * Génère un UUID ou une chaîne aléatoire unique
 */
function generateNonce(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Timestamp actuel en secondes
 */
function generateTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

/**
 * Construit la chaîne à signer.
 * L'ORDRE EST CRITIQUE : Doit correspondre exactement à celui du Backend Laravel.
 * D'après vos logs, Laravel attend : NONCE + TIMESTAMP + METHOD + URI + BODY
 */
function buildSignaturePayload(
  method: string,
  uri: string,
  bodyString: string,
  timestamp: string,
  nonce: string
): string {
  return `${nonce}${timestamp}${method.toUpperCase()}${uri}${bodyString}`;
}

/**
 * ✅ LA FONCTION QUI MANQUAIT : Signe le payload avec le secret HMAC
 */
function signHmacSha256(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Logique principale du Proxy
 */
async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  const pathSegment = pathSegments.length ? pathSegments.join("/") : "";
  const method = request.method;

  // Vérification de la méthode
  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Récupération du Secret
  const hmacSecret = process.env.HMAC_SECRET || "";
  if (!hmacSecret) {
    console.error("🚨 ERREUR CRITIQUE : HMAC_SECRET est vide dans Next.js !");
  }

  const baseUrl = getBackendBaseUrl();
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();

  // 1. Construction de l'URI relative (ex: /api/sessions?page=1)
  const relativeUri = queryString 
    ? `/api/${pathSegment}?${queryString}` 
    : `/api/${pathSegment}`;

  // 2. URL cible réelle
  const targetUrl = `${baseUrl.replace(/\/api$/, '')}${relativeUri}`;

  // 3. Gestion du Body
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

  // 4. Signature
  const signaturePayload = buildSignaturePayload(
    method,
    relativeUri,
    bodyString,
    timestamp,
    nonce
  );
  
  const signature = hmacSecret ? signHmacSha256(signaturePayload, hmacSecret) : "";

  // --- LOGS DEBUG (A voir dans le terminal Docker) ---
  console.log("---------------- PROXY HMAC ----------------");
  console.log(`🔹 URL Cible: ${targetUrl}`);
  console.log(`🔹 Payload: ${signaturePayload}`);
  console.log(`🔹 Signature: ${signature}`);
  console.log("--------------------------------------------");

  // 5. Préparation des Headers
  const headersToSend = new Headers();
  headersToSend.set("X-Timestamp", timestamp);
  headersToSend.set("X-Nonce", nonce);
  if (signature) headersToSend.set("X-Signature", signature);
  headersToSend.set("Accept", "application/json");

  // Transfert des headers (Authorization, etc.)
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower !== "host" && lower !== "connection" && lower !== "content-length") {
      headersToSend.set(key, value);
    }
  });

  // Transfert des cookies
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
    // 6. Envoi à Laravel
    const backendResponse = await fetch(targetUrl, fetchOptions);
    const buffer = await backendResponse.arrayBuffer();

    // Gestion 405/500 spécifique
    if (backendResponse.status >= 400) {
        console.error(`🚨 Erreur Backend: ${backendResponse.status} ${backendResponse.statusText}`);
    }

    // Copie des headers de réponse
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
    console.error("🔥 Proxy Crash:", err);
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}
// Exports des méthodes Next.js
export async function GET(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function POST(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function PUT(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function PATCH(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function DELETE(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }