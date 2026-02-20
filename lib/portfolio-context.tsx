"use client";

/**
 * LEDGER — Portfolio Context
 *
 * Global holdings state so TradePanel and the Portfolio page
 * stay in sync. When a buy is confirmed in the TradePanel,
 * addHolding() is called and the portfolio page reflects it
 * immediately without a page reload.
 *
 * In production: hydrate from DB on login, persist on every mutation.
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { VAULT_HOLDINGS, type VaultHolding } from "@/lib/vault-data";

// ─────────────────────────────────────────────────────────
// Context type
// ─────────────────────────────────────────────────────────

interface PortfolioContextValue {
  holdings: VaultHolding[];
  /** Add a newly purchased card to the portfolio */
  addHolding: (holding: VaultHolding) => void;
  /** Remove a holding by ID (sold / withdrawn) */
  removeHolding: (id: string) => void;
  /** Partial update — e.g. change status to "listed" */
  updateHolding: (id: string, patch: Partial<VaultHolding>) => void;
}

// ─────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

// ─────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  // Start with mock vault holdings so the portfolio page isn't empty on first load
  const [holdings, setHoldings] = useState<VaultHolding[]>(VAULT_HOLDINGS);

  const addHolding = useCallback((holding: VaultHolding) => {
    setHoldings((prev) => [holding, ...prev]);
  }, []);

  const removeHolding = useCallback((id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const updateHolding = useCallback((id: string, patch: Partial<VaultHolding>) => {
    setHoldings((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...patch } : h))
    );
  }, []);

  return (
    <PortfolioContext.Provider value={{ holdings, addHolding, removeHolding, updateHolding }}>
      {children}
    </PortfolioContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used inside <PortfolioProvider>");
  return ctx;
}
