"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

const TURNSTILE_SCRIPT =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: string;
          size?: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: (error?: unknown) => void;
        }
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

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
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const [scriptReady, setScriptReady] = useState(false);
  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;

  const renderWidget = () => {
    const win = typeof window !== "undefined" ? window : null;
    const turnstile = win?.turnstile;
    const container = containerRef.current;
    if (!turnstile || !container || !siteKey) return;

    if (widgetIdRef.current) {
      try {
        turnstile.remove(widgetIdRef.current);
      } catch {
        // ignore
      }
      widgetIdRef.current = null;
    }

    widgetIdRef.current = turnstile.render(container, {
      sitekey: siteKey,
      theme,
      size,
      callback: (token: string) => {
        if (token) onVerifyRef.current(token);
      },
      "expired-callback": () => {
        onExpireRef.current?.();
      },
      "error-callback": () => {
        onExpireRef.current?.();
      },
    });
  };

  // Call turnstile.render() directly when script is ready. Do not use turnstile.ready()
  // when the script is loaded with async/defer (Next.js Script uses async loading).
  useEffect(() => {
    if (!siteKey || !scriptReady || !containerRef.current) return;
    renderWidget();
    return () => {
      const w = window as Window & { turnstile?: Window["turnstile"] };
      if (widgetIdRef.current && w.turnstile) {
        try {
          w.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, scriptReady]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src={TURNSTILE_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div
        ref={containerRef}
        className={className}
        style={{ minHeight: size === "compact" ? 60 : 65 }}
        aria-label="Verification captcha"
      />
    </>
  );
}
