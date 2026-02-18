"use client";

import { useState, useEffect } from "react";
import { colors } from "@/lib/theme";
import { formatCurrency } from "@/lib/utils";
import type { AssetData } from "@/lib/market-data";

interface TradePanelProps {
  asset: AssetData;
}

export function TradePanel({ asset }: TradePanelProps) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState(asset.price);
  const [submitted, setSubmitted] = useState(false);

  // Sync limit price when asset changes
  useEffect(() => {
    setLimitPrice(asset.price);
  }, [asset.symbol]);

  const estPrice =
    orderType === "market"
      ? side === "buy"
        ? asset.price * 1.001
        : asset.price * 0.999
      : limitPrice;

  const total = estPrice * quantity;
  const isBuy = side === "buy";
  const accent = isBuy ? colors.green : colors.red;
  const accentMuted = isBuy ? colors.greenMuted : colors.redMuted;

  function handleSubmit() {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Buy / Sell toggle */}
      <div
        className="flex rounded-[8px] p-[3px]"
        style={{ background: colors.surfaceOverlay }}
      >
        {(["buy", "sell"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className="flex-1 rounded-[6px] py-[7px] text-[12px] font-bold capitalize transition-all duration-150"
            style={{
              background:
                side === s
                  ? s === "buy"
                    ? colors.greenMuted
                    : colors.redMuted
                  : "transparent",
              color:
                side === s
                  ? s === "buy"
                    ? colors.green
                    : colors.red
                  : colors.textMuted,
              border:
                side === s
                  ? `1px solid ${s === "buy" ? colors.green + "44" : colors.red + "44"}`
                  : "1px solid transparent",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Order type */}
      <div>
        <label
          className="mb-1 block text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: colors.textMuted }}
        >
          Order Type
        </label>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value as "market" | "limit")}
          className="w-full rounded-[8px] px-3 py-2 text-[12px] font-medium"
          style={{
            background: colors.surfaceRaised,
            color: colors.textPrimary,
            border: `1px solid ${colors.border}`,
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="market">Market</option>
          <option value="limit">Limit</option>
        </select>
      </div>

      {/* Limit price */}
      {orderType === "limit" && (
        <div>
          <label
            className="mb-1 block text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: colors.textMuted }}
          >
            Limit Price
          </label>
          <input
            type="number"
            value={limitPrice}
            onChange={(e) =>
              setLimitPrice(parseFloat(e.target.value) || asset.price)
            }
            min={0}
            step={10}
            className="w-full rounded-[8px] px-3 py-2 text-[12px] tabular-nums font-medium"
            style={{
              background: colors.surfaceRaised,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
              outline: "none",
            }}
          />
        </div>
      )}

      {/* Quantity stepper */}
      <div>
        <label
          className="mb-1 block text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: colors.textMuted }}
        >
          Quantity (copies)
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-[18px] font-bold leading-none transition-colors duration-100"
            style={{
              background: colors.surfaceRaised,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
            }}
          >
            −
          </button>
          <span
            className="flex-1 text-center tabular-nums text-[18px] font-bold"
            style={{ color: colors.textPrimary }}
          >
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-[18px] font-bold leading-none transition-colors duration-100"
            style={{
              background: colors.surfaceRaised,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Summary */}
      <div
        className="rounded-[8px] p-3"
        style={{ background: colors.surfaceRaised }}
      >
        <div
          className="flex justify-between text-[11px]"
          style={{ color: colors.textMuted }}
        >
          <span>Est. Price</span>
          <span className="tabular-nums font-medium" style={{ color: colors.textSecondary }}>
            {formatCurrency(estPrice)}
          </span>
        </div>
        <div
          className="mt-2 flex items-center justify-between pt-2"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <span className="text-[12px] font-semibold" style={{ color: colors.textPrimary }}>
            Total
          </span>
          <span
            className="tabular-nums text-[15px] font-bold"
            style={{ color: colors.textPrimary }}
          >
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full rounded-[10px] py-[10px] text-[13px] font-bold transition-all duration-150 active:scale-[0.98]"
        style={{
          background: submitted ? accentMuted : accent,
          color: submitted ? accent : colors.textInverse,
          border: `1px solid ${accent}`,
        }}
      >
        {submitted
          ? "✓ Order Placed"
          : `Place ${isBuy ? "Buy" : "Sell"} Order`}
      </button>

      <p className="text-center text-[10px]" style={{ color: colors.textMuted }}>
        Paper trading · no real transactions
      </p>
    </div>
  );
}
