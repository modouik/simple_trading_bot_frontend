/**
 * Server-side verification of Cloudflare Turnstile token.
 * POST https://challenges.cloudflare.com/turnstile/v0/siteverify
 */
export async function verifyTurnstileToken(
  secret: string,
  response: string,
  remoteip?: string
): Promise<{ success: boolean; errorCodes?: string[] }> {
  const body = new URLSearchParams({
    secret,
    response,
    ...(remoteip && { remoteip }),
  });

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
  return {
    success: data.success === true,
    errorCodes: data["error-codes"],
  };
}
