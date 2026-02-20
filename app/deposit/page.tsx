"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { colors, layout } from "@/lib/theme";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────

const PRESETS = [500, 1_000, 5_000, 10_000];

type Stage = "form" | "review" | "success";

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────

export default function DepositPage() {
  const { user, isAuthenticated, updateBalance } = useAuth();
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState<Stage>("form");

  if (!isAuthenticated || !user) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4"
        style={{ minHeight: `calc(100dvh - ${layout.chromeHeight})`, background: colors.background }}
      >
        <p className="text-[14px]" style={{ color: colors.textMuted }}>
          Sign in to deposit funds
        </p>
        <Link
          href="/"
          className="rounded-[10px] px-5 py-[10px] text-[13px] font-semibold"
          style={{ background: colors.green, color: colors.textInverse }}
        >
          Go to Market
        </Link>
      </div>
    );
  }

  const parsed = parseFloat(amount.replace(/,/g, "")) || 0;
  const isValid = parsed >= 1 && parsed <= 1_000_000;
  const newBalance = user.cashBalance + parsed;

  function handlePreset(value: number) {
    setAmount(value.toLocaleString("en-US"));
  }

  function handleInput(raw: string) {
    // Strip non-numeric except decimal
    const cleaned = raw.replace(/[^0-9.]/g, "");
    setAmount(cleaned);
  }

  function handleConfirm() {
    if (!isValid) return;
    updateBalance(parsed);
    setStage("success");
  }

  // ── Success state ─────────────────────────────────────

  if (stage === "success") {
    return (
      <div
        className="flex flex-col items-center justify-center gap-6 px-4"
        style={{ minHeight: `calc(100dvh - ${layout.chromeHeight})`, background: colors.background }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: colors.greenMuted }}
        >
          <CheckCircle2 size={32} style={{ color: colors.green }} />
        </div>

        <div className="text-center">
          <p className="text-[22px] font-bold" style={{ color: colors.textPrimary }}>
            {formatCurrency(parsed)} deposited
          </p>
          <p className="mt-[6px] text-[13px]" style={{ color: colors.textMuted }}>
            Your buying power has been updated
          </p>
        </div>

        <div
          className="w-full max-w-xs overflow-hidden rounded-[12px] border"
          style={{ borderColor: colors.border, background: colors.surface }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <span className="text-[12px]" style={{ color: colors.textMuted }}>Deposited</span>
            <span className="tabular-nums text-[13px] font-semibold" style={{ color: colors.green }}>
              +{formatCurrency(parsed)}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[12px]" style={{ color: colors.textMuted }}>New Balance</span>
            <span className="tabular-nums text-[13px] font-bold" style={{ color: colors.textPrimary }}>
              {formatCurrency(newBalance)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Link
            href="/"
            className="block w-full rounded-[12px] py-[13px] text-center text-[13px] font-semibold"
            style={{ background: colors.green, color: colors.textInverse }}
          >
            Start Trading
          </Link>
          <button
            onClick={() => { setAmount(""); setStage("form"); }}
            className="w-full rounded-[12px] py-[13px] text-[13px] font-semibold"
            style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary, background: "transparent" }}
          >
            Deposit More
          </button>
        </div>
      </div>
    );
  }

  // ── Review state ──────────────────────────────────────

  if (stage === "review") {
    return (
      <div
        className="mx-auto max-w-sm px-4 py-8"
        style={{ minHeight: `calc(100dvh - ${layout.chromeHeight})`, background: colors.background }}
      >
        <button
          onClick={() => setStage("form")}
          className="mb-6 flex items-center gap-1 text-[12px]"
          style={{ color: colors.textMuted }}
        >
          <ArrowLeft size={13} />
          Back
        </button>

        <h1 className="mb-6 text-[22px] font-bold" style={{ color: colors.textPrimary }}>
          Review Deposit
        </h1>

        <div
          className="mb-4 overflow-hidden rounded-[12px] border"
          style={{ borderColor: colors.border, background: colors.surface }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <span className="text-[12px]" style={{ color: colors.textMuted }}>Amount</span>
            <span className="tabular-nums text-[14px] font-bold" style={{ color: colors.textPrimary }}>
              {formatCurrency(parsed)}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <span className="text-[12px]" style={{ color: colors.textMuted }}>Current Balance</span>
            <span className="tabular-nums text-[13px] font-semibold" style={{ color: colors.textPrimary }}>
              {formatCurrency(user.cashBalance)}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[12px]" style={{ color: colors.textMuted }}>New Balance</span>
            <span className="tabular-nums text-[13px] font-bold" style={{ color: colors.green }}>
              {formatCurrency(newBalance)}
            </span>
          </div>
        </div>

        <p className="mb-5 text-center text-[11px]" style={{ color: colors.textMuted }}>
          This is a simulated deposit for demo purposes.
        </p>

        <button
          onClick={handleConfirm}
          className="w-full rounded-[12px] py-[14px] text-[14px] font-bold"
          style={{ background: colors.green, color: colors.textInverse }}
        >
          Confirm Deposit
        </button>
      </div>
    );
  }

  // ── Form state ────────────────────────────────────────

  return (
    <div
      className="mx-auto max-w-sm px-4 py-8"
      style={{ minHeight: `calc(100dvh - ${layout.chromeHeight})`, background: colors.background }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold" style={{ color: colors.textPrimary }}>
          Deposit Funds
        </h1>
        <p className="mt-[4px] text-[12px]" style={{ color: colors.textMuted }}>
          Add buying power to your account
        </p>
      </div>

      {/* Current balance */}
      <div
        className="mb-5 flex items-center justify-between rounded-[12px] border px-4 py-3"
        style={{ borderColor: colors.border, background: colors.surface }}
      >
        <span className="text-[12px]" style={{ color: colors.textMuted }}>Current Balance</span>
        <span className="tabular-nums text-[14px] font-bold" style={{ color: colors.textPrimary }}>
          {formatCurrency(user.cashBalance)}
        </span>
      </div>

      {/* Amount input */}
      <div className="mb-4">
        <label className="mb-[6px] block text-[10px] font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
          Amount (USD)
        </label>
        <div
          className="flex items-center overflow-hidden rounded-[12px] border px-4"
          style={{
            borderColor: parsed > 0 && isValid ? colors.green : colors.border,
            background: colors.surface,
          }}
        >
          <span className="mr-2 text-[18px] font-semibold" style={{ color: colors.textMuted }}>$</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleInput(e.target.value)}
            className="flex-1 bg-transparent py-4 text-[22px] font-bold outline-none tabular-nums"
            style={{ color: colors.textPrimary }}
          />
        </div>
        {parsed > 0 && !isValid && (
          <p className="mt-[6px] text-[11px]" style={{ color: colors.red }}>
            {parsed < 1 ? "Minimum deposit is $1.00" : "Maximum deposit is $1,000,000"}
          </p>
        )}
      </div>

      {/* Preset buttons */}
      <div className="mb-6 grid grid-cols-4 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePreset(preset)}
            className="rounded-[10px] py-[9px] text-[12px] font-semibold transition-colors"
            style={{
              background: parsed === preset ? colors.greenMuted : colors.surface,
              color: parsed === preset ? colors.green : colors.textSecondary,
              border: `1px solid ${parsed === preset ? colors.green + "66" : colors.border}`,
            }}
          >
            ${preset >= 1000 ? `${preset / 1000}K` : preset}
          </button>
        ))}
      </div>

      {/* Payment method */}
      <div className="mb-6">
        <p className="mb-[8px] text-[10px] font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
          Payment Method
        </p>
        <div
          className="flex items-center gap-3 rounded-[12px] border px-4 py-3"
          style={{ borderColor: colors.border, background: colors.surface }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]"
            style={{ background: colors.surfaceOverlay, color: colors.textSecondary }}
          >
            <CreditCard size={15} />
          </div>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>
              Demo Account
            </p>
            <p className="text-[11px]" style={{ color: colors.textMuted }}>
              Simulated funds — no real payment
            </p>
          </div>
        </div>
      </div>

      {/* New balance preview */}
      {parsed > 0 && isValid && (
        <div
          className="mb-5 flex items-center justify-between rounded-[10px] px-4 py-3"
          style={{ background: colors.greenMuted, border: `1px solid ${colors.green}33` }}
        >
          <span className="text-[12px] font-semibold" style={{ color: colors.green }}>
            New balance after deposit
          </span>
          <span className="tabular-nums text-[13px] font-bold" style={{ color: colors.green }}>
            {formatCurrency(newBalance)}
          </span>
        </div>
      )}

      {/* CTA */}
      <button
        disabled={!isValid}
        onClick={() => setStage("review")}
        className="w-full rounded-[12px] py-[14px] text-[14px] font-bold transition-opacity disabled:opacity-30"
        style={{
          background: colors.green,
          color: colors.textInverse,
        }}
      >
        {parsed > 0 && isValid ? `Deposit ${formatCurrency(parsed)}` : "Enter an amount"}
      </button>
    </div>
  );
}
