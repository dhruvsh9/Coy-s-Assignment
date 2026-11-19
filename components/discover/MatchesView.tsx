"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Heart, ShieldCheck } from "lucide-react";
import Image from "next/image";

import type { Match } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function formatMatchDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return `Matched ${dateFormatter.format(date)}`;
}

type MatchesViewProps = {
  matches: Match[];
  loading: boolean;
  onClose: () => void;
};

export function MatchesView({ matches, loading, onClose }: MatchesViewProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex justify-center bg-[#1b1612]/35 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="matches-title"
    >
      <motion.section
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 310, damping: 34 }}
        onClick={(event) => event.stopPropagation()}
        className="flex h-dvh w-full max-w-[460px] flex-col overflow-hidden bg-paper md:my-4 md:h-[calc(100dvh-2rem)] md:rounded-[2.5rem] md:border md:border-line md:shadow-[0_30px_90px_rgba(0,0,0,0.3)]"
      >
        <header className="shrink-0 border-b border-line/70 px-5 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="Back to Discover"
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line/80 bg-white/50 text-ink/70 transition-colors hover:bg-white hover:text-ink"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-[9.5px] font-bold tracking-[0.25em] text-coral uppercase">
                Mutual connections
              </p>
              <div className="mt-1 flex items-baseline gap-2.5">
                <h2
                  id="matches-title"
                  className="font-display text-[2rem] leading-none font-semibold tracking-[-0.04em]"
                >
                  Matches
                </h2>
                {!loading ? (
                  <span className="text-xs font-medium text-muted">
                    {matches.length} {matches.length === 1 ? "person" : "people"}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-8">
          {loading ? (
            <div className="grid grid-cols-2 gap-3" aria-label="Loading matches">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[1.5rem] border border-line/70 bg-white/40 p-1.5"
                >
                  <div className="skeleton-shimmer aspect-[4/5] rounded-[1.1rem] bg-paper-deep" />
                  <div className="px-2 py-2.5">
                    <div className="h-3 w-2/3 rounded-full bg-paper-deep" />
                    <div className="mt-2 h-2.5 w-1/2 rounded-full bg-paper-deep/70" />
                  </div>
                </div>
              ))}
            </div>
          ) : matches.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {matches.map((match, index) => (
                <motion.article
                  key={match.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.045, duration: 0.26 }}
                  className="overflow-hidden rounded-[1.5rem] border border-line/70 bg-white/50 p-1.5 shadow-[0_8px_24px_rgba(43,31,22,0.06)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.1rem] bg-paper-deep">
                    <Image
                      src={match.profile.photo}
                      alt={`Portrait of ${match.profile.name}`}
                      fill
                      sizes="(max-width: 460px) 45vw, 210px"
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <span className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-paper/90 text-coral shadow-sm backdrop-blur-md">
                      <Heart
                        size={13}
                        fill="currentColor"
                        aria-hidden="true"
                      />
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                      <h3 className="font-display text-[1.35rem] leading-none font-semibold tracking-[-0.02em]">
                        {match.profile.name}
                        <span className="ml-1.5 text-base font-normal text-white/75">
                          {match.profile.age}
                        </span>
                      </h3>
                      <p className="mt-1 truncate text-[10px] font-medium text-white/70">
                        {match.profile.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-2 py-2.5">
                    <span className="truncate text-[9.5px] font-medium text-muted">
                      {formatMatchDate(match.matchedAt)}
                    </span>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[24rem] flex-col items-center justify-center text-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <span className="soft-pulse absolute inset-0 rounded-full border border-coral/20 bg-coral-soft/70" />
                <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/70 text-coral shadow-sm">
                  <Heart size={24} aria-hidden="true" />
                </span>
              </div>
              <h3 className="font-display mt-5 text-3xl font-semibold tracking-[-0.035em]">
                No matches yet
              </h3>
              <p className="mt-2 max-w-[18rem] text-sm leading-6 text-muted">
                When you and someone else both swipe right, they&apos;ll appear
                here.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-paper transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Keep discovering
              </button>
            </div>
          )}

          <div className="mt-7 flex items-start gap-2.5 rounded-2xl border border-line/70 bg-white/35 px-4 py-3.5">
            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-sage"
              aria-hidden="true"
            />
            <p className="text-[11px] leading-[1.55] text-muted">
              <span className="font-semibold text-ink/75">
                Mutual, always.
              </span>{" "}
              People show up here only after you&apos;ve both liked each other.
              We never reveal who liked you first.
            </p>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
