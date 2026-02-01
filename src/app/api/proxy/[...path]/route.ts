import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// ... (Gardez vos fonctions getBackendBaseUrl, generateNonce, generateTimestamp) ...

// 👇 CORRECTION 1 : On passe le Query String à la fonction de construction
function buildSignaturePayload(
  method: string,
  uri: string, // On passe l'URI complète (ex: /api/sessions?page=1)
  bodyString: string,
  timestamp: string,
  nonce: string
): string {
  // Le format standard est souvent : TS + NONCE + METHOD + URI + BODY
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

  // 1. Gestion du Secret
  const hmacSecret = process.env.HMAC_SECRET || "";
  if (!hmacSecret) {
    console.error("🚨 ERREUR CRITIQUE : HMAC_SECRET est vide dans Next.js !");
    return NextResponse.json({ error: "Config Error" }, { status: 500 });
  }

  // 2. Préparation de l'URL et du Query String
  const baseUrl = getBackendBaseUrl(); // Assurez-vous que ça retourne bien http://app:8000/api
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  
  // L'URI relative que Laravel voit (ex: /api/sessions ou /api/sessions?page=1)
  // ATTENTION : Vérifiez si votre Laravel attend '/api/...' ou juste '/sessions...'
  // Dans votre code précédent, vous forciez '/api/'. Je garde cette logique.
  const relativeUri = queryString 
    ? `/api/${pathSegment}?${queryString}` 
    : `/api/${pathSegment}`;

  const targetUrl = `${baseUrl.replace('/api', '')}${relativeUri}`;

  // 3. Gestion du Body (Crucial pour POST/PUT)
  let bodyString = "";
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    try {
      bodyString = await request.text();
    } catch {
      bodyString = "";
    }
  }

  // 4. Construction de la Signature
  const timestamp = generateTimestamp();
  const nonce = generateNonce();
  
  // 👇 CORRECTION ICI : On utilise relativeUri qui inclut les params
  const signaturePayload = buildSignaturePayload(
    method,
    relativeUri,
    bodyString,
    timestamp,
    nonce
  );
  
  const signature = signHmacSha256(signaturePayload, hmacSecret);

  // 🔍 LOGS DE DÉBOGAGE (À regarder dans le terminal Docker Next.js)
  console.log("---------------- HMAC DEBUG ----------------");
  console.log("SECRET (3 premiers chars):", hmacSecret.substring(0, 3) + "...");
  console.log("PAYLOAD SIGNÉ (NextJS):", signaturePayload);
  console.log("SIGNATURE GÉNÉRÉE:", signature);
  console.log("URL CIBLE:", targetUrl);
  console.log("--------------------------------------------");

  const headersToSend = new Headers();
  headersToSend.set("X-Timestamp", timestamp);
  headersToSend.set("X-Nonce", nonce);
  headersToSend.set("X-Signature", signature);
  headersToSend.set("Accept", "application/json");

  // Transfert des headers importants (Auth, etc.)
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower !== "host" && lower !== "connection" && lower !== "content-length") {
      headersToSend.set(key, value);
    }
  });

  // Gestion des cookies
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  if (cookieHeader) headersToSend.set("Cookie", cookieHeader);

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
    
    // ... (Le reste de votre code de réponse reste identique) ...
    // N'oubliez pas de remettre le code pour transférer Set-Cookie !
    
    const buffer = await backendResponse.arrayBuffer();
    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
       if (key.toLowerCase() !== 'content-encoding') responseHeaders.set(key, value);
    });

    return new NextResponse(buffer, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });

  } catch (err) {
    console.error("[proxy] Error:", err);
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}

// ... Exports GET, POST, etc.