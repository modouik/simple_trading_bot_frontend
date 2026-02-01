import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Amélioration : Ne force pas HTTPS si on est en local/docker (http)
const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

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
  // NOTE: Assure-toi que Laravel signe exactement cette chaîne
  // Souvent, on inclut aussi le QueryString ici si Laravel vérifie l'URI complète
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
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const hmacSecret = process.env.HMAC_SECRET || "";
  // En prod, on veut peut-être logger l'erreur mais ne pas crasher si pas de secret (dépend de ta config)
  if (!hmacSecret) {
    console.error("[proxy] HMAC_SECRET is not set");
  }

  const baseUrl = getBackendBaseUrl();
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const targetPath = pathSegment ? `/${pathSegment}` : "";
  // Construction de l'URL cible
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
  
  // Signature uniquement si le secret est présent
  const signature = hmacSecret ? signHmacSha256(signaturePayload, hmacSecret) : "";

  const headersToSend = new Headers();
  headersToSend.set("X-Timestamp", timestamp);
  headersToSend.set("X-Nonce", nonce);
  if (signature) headersToSend.set("X-Signature", signature);
  headersToSend.set("Accept", "application/json");

  // Copie des headers importants venant du client (Authorization, Content-Type, etc.)
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    // On retire 'host' et 'connection' pour laisser fetch gérer ça
    if (lower !== "host" && lower !== "connection" && lower !== "content-length") {
       // On passe Authorization (Bearer) et le reste
       headersToSend.set(key, value); 
    }
  });

  // ✅ CORRECTION 1 : Gestion robuste des Cookies entrants
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  if (cookieHeader) {
    headersToSend.set("Cookie", cookieHeader);
  }

  const fetchOptions: RequestInit = {
    method,
    headers: headersToSend,
    cache: "no-store",
    // Important pour éviter que fetch suive les redirections automatiquement (login -> home)
    redirect: "manual", 
  };

  if (bodyString && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    fetchOptions.body = bodyString;
  }

  try {
    const backendResponse = await fetch(targetUrl, fetchOptions);
    const contentType = backendResponse.headers.get("content-type") ?? "";
    
    // On lit le buffer une seule fois
    const buffer = await backendResponse.arrayBuffer();

    // Préparation de la réponse Next.js
    const responseHeaders = new Headers();
    
    // ✅ CORRECTION 2 : Transfert de TOUS les headers pertinents (surtout Set-Cookie)
    backendResponse.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      // On exclut les headers de transport gérés par Node/Next
      if (lower !== "content-encoding" && lower !== "transfer-encoding") {
        responseHeaders.set(key, value);
      }
    });

    // Cas particulier : Set-Cookie peut nécessiter une gestion spéciale si multiple
    // Mais fetch combine souvent les headers. Next.js gère bien le Set-Cookie dans Headers maintenant.
    
    return new NextResponse(buffer, {
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

// Exports des méthodes
export async function GET(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function POST(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function PUT(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function PATCH(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function DELETE(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }