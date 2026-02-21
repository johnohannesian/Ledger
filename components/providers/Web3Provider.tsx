"use client";

/**
 * Web3Provider — Client-side wrapper for RainbowKit + Wagmi + TanStack Query.
 *
 * Must be a client component ("use client") and wrap the entire app tree.
 * RainbowKit's built-in dark theme is overridden to match tash's design system.
 */

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/web3";
import { colors } from "@/lib/theme";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

/** tash-branded RainbowKit theme override */
const tashTheme = darkTheme({
  accentColor: colors.green,
  accentColorForeground: colors.textInverse,
  borderRadius: "medium",
  fontStack: "system",
  overlayBlur: "small",
});

// Further override specific tokens to match tash's exact palette
tashTheme.colors.modalBackground = colors.surface;
tashTheme.colors.modalBorder = colors.border;
tashTheme.colors.menuItemBackground = colors.surfaceRaised;
tashTheme.colors.profileForeground = colors.surfaceRaised;
tashTheme.colors.selectedOptionBorder = colors.green;
tashTheme.colors.connectButtonBackground = colors.surface;
tashTheme.colors.connectButtonText = colors.textPrimary;

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={tashTheme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
