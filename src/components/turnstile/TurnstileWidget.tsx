"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js";

export type TurnstileWidgetProps = {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  className?: string;
};

export function TurnstileWidget({
  siteKey,
  onVerify,
  onExpire,
  theme = "auto",
  size = "normal",
  className = "",
}: TurnstileWidgetProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [callbackId] = useState(() => Math.random().toString(36).slice(2));
  const callbackName = `__turnstile_verify_${callbackId}`;
  const expireName = `__turnstile_expire_${callbackId}`;
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;

  useEffect(() => {
    (window as unknown as Record<string, (t?: string) => void>)[callbackName] = (token: string) => {
      if (token) onVerifyRef.current(token);
    };
    (window as unknown as Record<string, () => void>)[expireName] = () => {
      onExpireRef.current?.();
    };
    return () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      delete (window as unknown as Record<string, unknown>)[expireName];
    };
  }, [callbackName, expireName]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src={TURNSTILE_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      {scriptLoaded && (
        <div
          className={className}
          data-sitekey={siteKey}
          data-callback={callbackName}
          data-expired-callback={expireName}
          data-theme={theme}
          data-size={size}
        />
      )}
    </>
  );
}
