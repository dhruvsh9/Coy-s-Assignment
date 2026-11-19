"use client";

import { Heart, RefreshCw, Sparkles } from "lucide-react";

type DeckLoadingProps = {
  message?: string;
};

export function DeckLoading({ message = "Finding people nearby" }: DeckLoadingProps) {
  return (
    <div className="flex h-full flex-col px-4">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[2rem] bg-paper-deep shadow-[0_18px_44px_rgba(43,31,22,0.12)]">
        <div className="skeleton-shimmer absolute inset-0 bg-[#e3d7c8]" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="h-9 w-36 rounded-full bg-white/40" />
          <div className="mt-3 h-3 w-28 rounded-full bg-white/30" />
          <div className="mt-4 h-3 w-full rounded-full bg-white/25" />
          <div className="mt-2 h-3 w-4/5 rounded-full bg-white/25" />
          <div className="mt-5 flex gap-2">
            <div className="h-6 w-16 rounded-full bg-white/25" />
            <div className="h-6 w-20 rounded-full bg-white/25" />
            <div className="h-6 w-14 rounded-full bg-white/25" />
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 text-ink/40">
          <Sparkles size={24} className="soft-pulse" aria-hidden="true" />
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

type DeckErrorProps = {
  onRetry: () => void;
};

export function DeckError({ onRetry }: DeckErrorProps) {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="w-full rounded-[2rem] border border-line bg-white/45 px-6 py-9 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coral-soft text-coral">
          <RefreshCw size={22} aria-hidden="true" />
        </span>
        <h2 className="font-display mt-5 text-3xl font-semibold tracking-[-0.03em]">
          A small hiccup
        </h2>
        <p className="mx-auto mt-2 max-w-[17rem] text-sm leading-6 text-muted">
          We couldn&apos;t load your discovery feed. Your saved swipes are safe.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-paper transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

type DeckEmptyProps = {
  onViewMatches: () => void;
};

export function DeckEmpty({ onViewMatches }: DeckEmptyProps) {
  return (
    <div className="flex h-full items-center justify-center px-5">
      <div className="relative w-full overflow-hidden rounded-[2rem] border border-line/80 bg-gradient-to-br from-white/70 to-paper-deep/70 px-6 py-10 text-center shadow-[0_18px_44px_rgba(43,31,22,0.08)]">
        <div className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full bg-coral-soft/70 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-[#d9e4d2]/80 blur-2xl" />

        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          <span className="soft-pulse absolute inset-0 rounded-full border border-coral/20 bg-coral-soft/70" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-paper text-coral shadow-sm">
            <Heart size={25} fill="currentColor" aria-hidden="true" />
          </span>
        </div>

        <h2 className="font-display relative mt-5 text-[2.1rem] leading-none font-semibold tracking-[-0.04em]">
          You&apos;re all
          <br />
          caught up.
        </h2>
        <p className="relative mx-auto mt-3 max-w-[17rem] text-sm leading-6 text-muted">
          No more profiles for now. The people you&apos;ve both liked are waiting
          in your matches.
        </p>

        <button
          type="button"
          onClick={onViewMatches}
          className="relative mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-paper transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Heart size={15} fill="currentColor" aria-hidden="true" />
          See matches
        </button>
      </div>
    </div>
  );
}
