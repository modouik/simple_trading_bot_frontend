import { ACCESS_TOKEN_SKEW_SECONDS } from "./constants";

let accessToken: string | null = null;
let expiresAt: number | null = null;

export const setTokens = (token: string, expiresInSeconds: number) => {
  accessToken = token;
  expiresAt =
    Date.now() + expiresInSeconds * 1000 - ACCESS_TOKEN_SKEW_SECONDS * 1000;
};

export const clearTokens = () => {
  accessToken = null;
  expiresAt = null;
};

export const getAccessToken = () => accessToken;

export const isAccessTokenExpired = () => {
  if (!accessToken || !expiresAt) return true;
  return Date.now() >= expiresAt;
};
