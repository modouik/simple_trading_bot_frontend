"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getApiMode, setApiMode } from "@/lib/auth/apiClient";

export type AppMode = "TESTNET" | "PRODUCTION";

type ModeContextValue = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
};

const STORAGE_KEY = "app_mode";

const ModeContext = createContext<ModeContextValue | undefined>(undefined);

export const ModeProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [mode, setModeState] = useState<AppMode>("PRODUCTION");

  // Bootstrap depuis localStorage / env au montage client
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(STORAGE_KEY) as AppMode | null;
    const initial: AppMode =
      stored === "TESTNET" || stored === "PRODUCTION"
        ? stored
        : getApiMode();

    setModeState(initial);
    setApiMode(initial);
  }, []);

  const updateMode = (next: AppMode) => {
    setModeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    setApiMode(next);
    // Recharger les données avec le nouveau mode
    queryClient.invalidateQueries();
  };

  const value = useMemo(
    () => ({
      mode,
      setMode: updateMode,
    }),
    [mode]
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
};

export const useMode = (): ModeContextValue => {
  const ctx = useContext(ModeContext);
  if (!ctx) {
    throw new Error("useMode must be used within ModeProvider");
  }
  return ctx;
};

