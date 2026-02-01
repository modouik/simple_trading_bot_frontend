import {
  HEADER_NONCE,
  HEADER_SIGNATURE,
  HEADER_TIMESTAMP,
  HMAC_SECRET,
} from "./constants";

const encoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const signInBrowser = async (payload: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  return toHex(signature);
};

const signInNode = async (payload: string, secret: string) => {
  const { createHmac } = await import("crypto");
  return createHmac("sha256", secret).update(payload).digest("hex");
};

export const generateNonce = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const generateTimestamp = () =>
  Math.floor(Date.now() / 1000).toString();

export const signHmac = async (body: string, nonce: string, timestamp: string) => {
  const secret = HMAC_SECRET;
  const payload = `${body}${nonce}${timestamp}`;
  if (typeof window === "undefined") {
    return signInNode(payload, secret);
  }
  return signInBrowser(payload, secret);
};

export const buildHmacHeaders = async (body: string) => {
  const nonce = generateNonce();
  const timestamp = generateTimestamp();
  const signature = await signHmac(body, nonce, timestamp);
  return {
    [HEADER_NONCE]: nonce,
    [HEADER_TIMESTAMP]: timestamp,
    [HEADER_SIGNATURE]: signature,
  };
};
