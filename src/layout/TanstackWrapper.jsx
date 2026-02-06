"use client";
import { useState } from "react";
import { QueryClientProvider, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import SettingProvider from "@/helper/settingContext/SettingProvider";
import AccountProvider from "@/helper/accountContext/AccountProvider";
import BadgeProvider from "@/helper/badgeContext/BadgeProvider";
import CartProvider from "@/helper/cartContext/CartProvider";
import { CookiesProvider } from "react-cookie";
import CategoryProvider from "@/helper/categoryContext/CategoryProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { ModeProvider } from "@/context/ModeContext";

const TanstackWrapper = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={children.dehydratedState}>
        <ThemeProvider>
          <CookiesProvider defaultSetOptions>
            <SettingProvider>
              <AccountProvider>
                <BadgeProvider>
                  <CategoryProvider>
                    <ModeProvider>
                      <CartProvider>{children}</CartProvider>
                    </ModeProvider>
                  </CategoryProvider>
                </BadgeProvider>
              </AccountProvider>
            </SettingProvider>
          </CookiesProvider>
        </ThemeProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
};

export default TanstackWrapper;

