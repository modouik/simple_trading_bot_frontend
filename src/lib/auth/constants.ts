const rawBackendBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_PROD_URL ;

const withProtocol = rawBackendBaseUrl.startsWith("http")
  ? rawBackendBaseUrl
  : `https://${rawBackendBaseUrl}`;

const trimmed = withProtocol.endsWith("/")
  ? withProtocol.slice(0, -1)
  : withProtocol;

export const BACKEND_BASE_URL = trimmed.endsWith("/api")
  ? trimmed
  : `${trimmed}/api`;

/** Server-only: never use NEXT_PUBLIC_HMAC_SECRET; set HMAC_SECRET at runtime (e.g. Docker -e). */
export const HMAC_SECRET = process.env.HMAC_SECRET || "";

export const HEADER_AUTHORIZATION = "Authorization";
export const HEADER_NONCE = "X-Nonce";
export const HEADER_TIMESTAMP = "X-Timestamp";
export const HEADER_SIGNATURE = "X-Signature";

export const ACCESS_TOKEN_SKEW_SECONDS = 30;

export const REFRESH_TOKEN_COOKIE = "refresh_token";

/**
 * maxAge = durée de vie du cookie "refresh_token" dans le navigateur (en secondes).
 * Pendant cette période, le cookie est envoyé au serveur ; au-delà, le navigateur le supprime.
 * Doit être <= au TTL du refresh token côté Laravel (JWT_REFRESH_TTL en minutes, ex. 20160 = 14 jours).
 * Ici : 14 jours (aligné sur config/jwt.php refresh_ttl par défaut).
 */
const _refreshMaxAge = Number(process.env.REFRESH_TOKEN_MAX_AGE_SECONDS);
/** Valeur utilisée uniquement côté serveur (routes API) ; côté client on utilise le défaut. */
export const REFRESH_TOKEN_MAX_AGE_SECONDS =
  Number.isFinite(_refreshMaxAge) && _refreshMaxAge > 0
    ? _refreshMaxAge
    : 14 * 24 * 60 * 60; // 1209600 = 14 jours (aligné Laravel JWT_REFRESH_TTL)

/** Événement dispatché quand la session expire (refresh échoué). AuthContext écoute et redirige vers login. */
export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

/** Payload pour l’événement 402 (abonnement requis / expiré). Affiche un popup au lieu de rediriger. */
export const AUTH_SUBSCRIPTION_REQUIRED_EVENT = "auth:subscription-required";

export type SubscriptionRequiredDetail = {
  message?: string;
  redirect_url?: string;
};
