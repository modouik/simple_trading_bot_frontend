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
function buildSignaturePayload(
  method: string,
  uri: string, 
  bodyString: string,
  timestamp: string,
  nonce: string
): string {
  // Format : TIMESTAMP + NONCE + METHOD + URI + BODY
  return `${timestamp}${nonce}${method.toUpperCase()}${uri}${bodyString}`;
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
  if (!hmacSecret) {
    console.error("🚨 ERREUR: HMAC_SECRET manquant dans Next.js !");
  }

  const baseUrl = getBackendBaseUrl();
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();

  // 👇 CONSTRUCTION DE L'URI RELATIVE EXACTE QUE LARAVEL VOIT
  // Si query string existe, on l'ajoute (ex: /api/sessions?page=1)
  const relativeUri = queryString 
    ? `/api/${pathSegment}?${queryString}` 
    : `/api/${pathSegment}`;

  // URL Cible pour fetch (on retire /api de baseUrl car relativeUri l'a déjà)
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

  // 👇 ON SIGNE L'URI COMPLÈTE
  const signaturePayload = buildSignaturePayload(
    method,
    relativeUri,
    bodyString,
    timestamp,
    nonce
  );
  
  const signature = hmacSecret ? signHmacSha256(signaturePayload, hmacSecret) : "";

  // 🔍 LOGS DE DÉBOGAGE (Regardez le terminal Next.js !)
  console.log("---------------- PROXY HMAC DEBUG ----------------");
  console.log(`📡 Méthode: ${method}`);
  console.log(`🔗 URL Cible: ${targetUrl}`);
  console.log(`✍️ Payload Signé: ${signaturePayload}`);
  console.log(`🔑 Signature: ${signature}`);
  console.log(`👮 Auth Header: ${request.headers.get("authorization") ? "PRÉSENT" : "MANQUANT ❌"}`);
  console.log("--------------------------------------------------");

  const headersToSend = new Headers();
  headersToSend.set("X-Timestamp", timestamp);
  headersToSend.set("X-Nonce", nonce);
  if (signature) headersToSend.set("X-Signature", signature);
  headersToSend.set("Accept", "application/json");

  // Transfert des headers importants (Token Bearer, etc.)
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
    const backendResponse = await fetch(targetUrl, fetchOptions);
    const buffer = await backendResponse.arrayBuffer();

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      // On transfère tout sauf l'encodage (géré par Next)
      if (key.toLowerCase() !== "content-encoding" && key.toLowerCase() !== "transfer-encoding") {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(buffer, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });

  } catch (err) {
    console.error("🚨 Proxy Error:", err);
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}

export async function GET(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function POST(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function PUT(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function PATCH(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }
export async function DELETE(req: NextRequest, ctx: any) { return proxyRequest(req, ctx); }