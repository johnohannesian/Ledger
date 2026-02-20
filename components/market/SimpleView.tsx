"use client";

/**
 * SimpleView — Casual market browse experience.
 *
 * No order book, no limit orders, no left sidebar.
 * Select a card → see price + chart → one-tap buy or sell.
 */

import { useState } from "react";
import { TrendingUp, TrendingDown, CheckCircle, Loader2, ExternalLink, Lock } from "lucide-react";
import { colors } from "@/lib/theme";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { SparklineChart } from "./SparklineChart";
import { PriceChart } from "./PriceChart";
import type { AssetData, PricePoint, TimeRange } from "@/lib/market-data";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SimpleViewProps {
  assets: AssetData[];
  selected: AssetData;
  onSelect: (symbol: string) => void;
  flashMap: Record<string, "up" | "down">;
  sparklines: Record<string, PricePoint[]>;
  chartData: PricePoint[];
  isUp: boolean;
  range: TimeRange;
  onRangeChange: (r: TimeRange) => void;
  onRequestSignIn: () => void;
}

type TradeSide = "buy" | "sell";
type TradeStage = "idle" | TradeSide | "submitting" | "confirmed" | "error";

interface OrderResult {
  status: "queued" | "settled";
  txHash?: string;
  message?: string;
}

// ── SimpleView ────────────────────────────────────────────────────────────────

export function SimpleView({
  assets,
  selected,
  onSelect,
  flashMap,
  sparklines,
  chartData,
  isUp,
  range,
  onRangeChange,
  onRequestSignIn,
}: SimpleViewProps) {
  const { user, isAuthenticated, updateBalance } = useAuth();
  const [stage, setStage] = useState<TradeStage>("idle");
  const [tradeSide, setTradeSide] = useState<TradeSide>("buy");
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState<OrderResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const accent = tradeSide === "sell" ? colors.red : colors.green;
  const total = selected.price * quantity;

  // Reset trade panel when asset changes
  function handleSelect(symbol: string) {
    onSelect(symbol);
    setStage("idle");
    setQuantity(1);
    setResult(null);
  }

  function handleTrade(side: TradeSide) {
    if (!isAuthenticated) {
      onRequestSignIn();
      return;
    }
    setTradeSide(side);
    setStage(side);
    setQuantity(1);
  }

  async function handleConfirm() {
    if (!user) return;
    const isBuy = tradeSide === "buy";
    setStage("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          tokenId: selected.tokenId,
          priceUsd: selected.price,
          isBuy,
          quantity,
          cardName: selected.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order failed");

      if (isBuy) updateBalance(-total);
      else updateBalance(total);

      setResult(data);
      setStage("confirmed");
      setTimeout(() => { setStage("idle"); setResult(null); }, 5000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStage("error");
    }
  }

  const showTradePanel = stage !== "idle";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">

      {/* ── Selected card hero ──────────────────────────── */}
      <div
        className="mb-6 overflow-hidden rounded-[16px] border"
        style={{ borderColor: colors.border, background: colors.surface }}
      >
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b px-5 py-5"
          style={{ borderColor: colors.border }}>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>
                {selected.name}
              </h1>
              <span
                className="rounded-[6px] px-2 py-[3px] text-[10px] font-bold tracking-wide"
                style={{ background: colors.greenMuted, color: colors.green, border: `1px solid ${colors.green}33` }}
              >
                PSA {selected.grade}
              </span>
            </div>
            <p className="mt-[3px] text-[12px]" style={{ color: colors.textMuted }}>
              {selected.set}
            </p>
          </div>

          <div className="text-right">
            <p
              className="tabular-nums text-[32px] font-bold leading-none tracking-tight"
              style={{ color: colors.textPrimary }}
            >
              {formatCurrency(selected.price)}
            </p>
            <div className="mt-[6px] flex items-center justify-end gap-[5px]">
              {isUp
                ? <TrendingUp size={13} strokeWidth={2.5} style={{ color: colors.green }} />
                : <TrendingDown size={13} strokeWidth={2.5} style={{ color: colors.red }} />
              }
              <span className="tabular-nums text-[13px] font-semibold"
                style={{ color: isUp ? colors.green : colors.red }}>
                {isUp ? "+" : ""}{formatCurrency(selected.change)} ({isUp ? "+" : ""}{selected.changePct.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="px-5 pt-4 pb-2">
          <PriceChart data={chartData} isUp={isUp} range={range} onRangeChange={onRangeChange} />
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 border-t" style={{ borderColor: colors.border }}>
          {[
            { label: "24H High", value: formatCurrency(selected.high24h) },
            { label: "24H Low",  value: formatCurrency(selected.low24h) },
            { label: "Vol (24H)", value: `${selected.volume24h} sales` },
          ].map((s, i) => (
            <div
              key={s.label}
              className="flex flex-col gap-[3px] px-5 py-3"
              style={{ borderRight: i < 2 ? `1px solid ${colors.borderSubtle}` : undefined }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                {s.label}
              </span>
              <span className="tabular-nums text-[13px] font-semibold" style={{ color: colors.textPrimary }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Trade panel ─────────────────────────────── */}
        {!showTradePanel && (
          <div className="flex gap-3 border-t px-5 py-4" style={{ borderColor: colors.border }}>
            {!isAuthenticated ? (
              <button
                onClick={() => onRequestSignIn()}
                className="flex flex-1 items-center justify-center gap-2 rounded-[12px] py-[13px] text-[14px] font-bold transition-all duration-150 active:scale-[0.98]"
                style={{ background: colors.green, color: colors.textInverse }}
              >
                <Lock size={14} strokeWidth={2.5} />
                Sign In to Trade
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleTrade("buy")}
                  className="flex-1 rounded-[12px] py-[13px] text-[14px] font-bold transition-all duration-150 active:scale-[0.98]"
                  style={{ background: colors.green, color: colors.textInverse }}
                >
                  Buy
                </button>
                <button
                  onClick={() => handleTrade("sell")}
                  className="flex-1 rounded-[12px] py-[13px] text-[14px] font-bold transition-all duration-150 active:scale-[0.98]"
                  style={{ background: colors.redMuted, color: colors.red, border: `1px solid ${colors.red}44` }}
                >
                  Sell
                </button>
              </>
            )}
          </div>
        )}

        {/* Submitting */}
        {stage === "submitting" && (
          <div className="flex flex-col items-center gap-3 border-t px-5 py-8 text-center"
            style={{ borderColor: colors.border }}>
            <Loader2 size={28} strokeWidth={1.5} className="animate-spin" style={{ color: colors.green }} />
            <p className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>Submitting order…</p>
          </div>
        )}

        {/* Confirmed */}
        {stage === "confirmed" && result && (
          <div className="flex flex-col items-center gap-3 border-t px-5 py-8 text-center"
            style={{ borderColor: colors.border }}>
            <CheckCircle size={32} strokeWidth={1.5} style={{ color: colors.green }} />
            <p className="text-[14px] font-bold" style={{ color: colors.textPrimary }}>Order Confirmed</p>
            <p className="text-[12px]" style={{ color: colors.textSecondary }}>
              {result.status === "settled" ? "Settled on-chain" : "In order book · awaiting match"}
            </p>
            {result.txHash && (
              <a
                href={`https://sepolia.basescan.org/tx/${result.txHash}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-medium"
                style={{ color: colors.green }}
              >
                View transaction <ExternalLink size={10} />
              </a>
            )}
          </div>
        )}

        {/* Error */}
        {stage === "error" && (
          <div className="flex flex-col items-center gap-3 border-t px-5 py-5 text-center"
            style={{ borderColor: colors.border }}>
            <p className="text-[13px] font-semibold" style={{ color: colors.red }}>{errorMsg}</p>
            <button
              onClick={() => setStage("idle")}
              className="rounded-[10px] px-4 py-[8px] text-[12px] font-semibold"
              style={{ background: colors.surfaceRaised, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Buy / Sell form */}
        {(stage === "buy" || stage === "sell") && (
          <div
            className="border-t px-5 py-5"
            style={{ borderColor: colors.border }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[12px] font-semibold" style={{ color: colors.textMuted }}>
                {tradeSide === "buy" ? "Buy" : "Sell"} · Market Price
              </span>
              <button
                onClick={() => setStage("idle")}
                className="text-[11px]"
                style={{ color: colors.textMuted }}
              >
                Cancel
              </button>
            </div>

            {/* Balance */}
            {user && (
              <div className="mb-3 flex justify-between">
                <span className="text-[11px]" style={{ color: colors.textMuted }}>Available</span>
                <span className="tabular-nums text-[11px] font-semibold" style={{ color: colors.textSecondary }}>
                  {formatCurrency(user.cashBalance)}
                </span>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-[20px] font-bold"
                style={{ background: colors.surfaceRaised, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
              >
                −
              </button>
              <span className="flex-1 text-center text-[22px] font-bold tabular-nums" style={{ color: colors.textPrimary }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-[20px] font-bold"
                style={{ background: colors.surfaceRaised, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
              >
                +
              </button>
            </div>

            {/* Total */}
            <div className="mb-4 flex items-center justify-between rounded-[10px] px-4 py-3"
              style={{ background: colors.surfaceRaised }}>
              <span className="text-[12px] font-semibold" style={{ color: colors.textPrimary }}>Total</span>
              <span className="tabular-nums text-[18px] font-bold" style={{ color: accent }}>
                {formatCurrency(total)}
              </span>
            </div>

            <button
              onClick={handleConfirm}
              disabled={tradeSide === "buy" && !!user && (user.cashBalance < total)}
              className="w-full rounded-[12px] py-[13px] text-[14px] font-bold transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: accent, color: colors.textInverse }}
            >
              {tradeSide === "buy" && user && user.cashBalance < total
                ? "Insufficient Funds"
                : `Confirm ${tradeSide === "buy" ? "Purchase" : "Sale"}`}
            </button>
          </div>
        )}
      </div>

      {/* ── Browse all cards ──────────────────────────────── */}
      <h2
        className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em]"
        style={{ color: colors.textMuted }}
      >
        All Cards
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {assets.map((asset) => {
          const assetUp = asset.change >= 0;
          const isSel = asset.symbol === selected.symbol;
          const flash = flashMap[asset.symbol];

          return (
            <button
              key={asset.symbol}
              onClick={() => handleSelect(asset.symbol)}
              className="group flex flex-col gap-3 rounded-[14px] border p-4 text-left transition-all duration-150 hover:border-[#3e3e3e]"
              style={{
                background: isSel ? colors.surface : colors.background,
                borderColor: isSel ? colors.green + "55" : colors.border,
              }}
            >
              {/* Card name + badge */}
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] font-semibold leading-snug" style={{ color: colors.textPrimary }}>
                  {asset.name}
                </p>
                <span
                  className="shrink-0 rounded-[4px] px-[6px] py-[2px] text-[9px] font-bold tracking-wide"
                  style={{ background: colors.greenMuted, color: colors.green }}
                >
                  {asset.grade}
                </span>
              </div>

              {/* Sparkline */}
              <SparklineChart
                data={sparklines[asset.symbol] ?? []}
                isUp={assetUp}
                width={100}
                height={36}
              />

              {/* Price + change */}
              <div>
                <p
                  className="tabular-nums text-[15px] font-bold"
                  style={{
                    color: flash
                      ? flash === "up" ? colors.green : colors.red
                      : colors.textPrimary,
                    transition: "color 0.35s ease",
                  }}
                >
                  {formatCurrency(asset.price, { compact: true })}
                </p>
                <p
                  className="mt-[2px] tabular-nums text-[11px] font-semibold"
                  style={{ color: assetUp ? colors.green : colors.red }}
                >
                  {assetUp ? "+" : ""}{asset.changePct.toFixed(2)}%
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
