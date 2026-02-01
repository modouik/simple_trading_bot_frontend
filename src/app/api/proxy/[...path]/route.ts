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

// 👇 MODIFICATION : On passe l'URI complète (avec les ?) au lieu du path simple
// ... (Gardez les imports et les fonctions utilitaires generateNonce/Timestamp comme avant)

// 👇 CORRECTION CRITIQUE : L'ORDRE DES PARAMÈTRES
function buildSignaturePayload(
  method: string,
  uri: string,
  bodyString: string,
  timestamp: string,
  nonce: string
): string {
  // D'après votre log d'erreur, Laravel attend le Nonce en premier !
  // Ordre supposé : NONCE + TIMESTAMP + METHOD + URI + BODY
  return `${nonce}${timestamp}${method.toUpperCase()}${uri}${bodyString}`;
}

// ... (Gardez signHmacSha256 comme avant)

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  const pathSegment = pathSegments.length ? pathSegments.join("/") : "";
  const method = request.method;

  // Sécurité Method
  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const hmacSecret = process.env.HMAC_SECRET || "";
  
  const baseUrl = getBackendBaseUrl();
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();

  // 1. URI Relative (Ce que Laravel voit)
  // ATTENTION : Laravel inclut souvent le '/' initial. 
  // Si pathSegment est 'sessions', on veut '/api/sessions'
  const relativeUri = queryString 
    ? `/api/${pathSegment}?${queryString}` 
    : `/api/${pathSegment}`;

  // URL Cible physique
  const targetUrl = `${baseUrl.replace(/\/api$/, '')}${relativeUri}`;

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

  // 2. Construction de la Payload (Avec le nouvel ordre)
  const signaturePayload = buildSignaturePayload(
    method,
    relativeUri,
    bodyString,
    timestamp,
    nonce
  );
  
  const signature = hmacSecret ? signHmacSha256(signaturePayload, hmacSecret) : "";

  // 🔍 LOGS POUR COMPARER AVEC LARAVEL
  console.log("---------------- SIGNATURE DEBUG ----------------");
  console.log(`🔹 NextJS Ordre: NONCE + TIMESTAMP + METHOD + URI + BODY`);
  console.log(`🔹 Payload: ${signaturePayload}`);
  console.log(`🔹 Signature Envoyée: ${signature}`);
  console.log("-------------------------------------------------");

  const headersToSend = new Headers();
  headersToSend.set("X-Timestamp", timestamp);
  headersToSend.set("X-Nonce", nonce);
  if (signature) headersToSend.set("X-Signature", signature);
  headersToSend.set("Accept", "application/json");

  // Transfert Auth & Cookies
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

    // Gestion du 405 ou 500 provenant de Laravel
    if (backendResponse.status === 405) {
         console.error("🚨 Laravel a renvoyé 405 Method Not Allowed");
    }

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

// Exports
export async function GET(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function POST(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function PUT(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function PATCH(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function DELETE(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }