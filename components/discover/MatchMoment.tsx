"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart, X } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";

import { currentUser } from "@/lib/current-user";
import type { Match } from "@/lib/types";

const confettiColors = ["#D95645", "#E9A8A0", "#87987B", "#E4C36A", "#211C17"];
const confetti = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  left: (index * 37 + 9) % 100,
  delay: (index % 7) * 0.17,
  drift: ((index % 5) - 2) * 32,
  spin: 180 + (index % 6) * 80,
  color: confettiColors[index % confettiColors.length],
  round: index % 3 === 0,
}));

type MatchMomentProps = {
  match: Match;
  onClose: () => void;
  onViewMatches: () => void;
};

export function MatchMoment({
  match,
  onClose,
  onViewMatches,
}: MatchMomentProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[80] grid place-items-center overflow-hidden bg-[#16120f]/65 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-title"
      onClick={onClose}
    >
      <div className="pointer-events-none absolute inset-0">
        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="confetti-piece absolute top-0 block"
            style={
              {
                left: `${piece.left}%`,
                width: piece.round ? "7px" : "5px",
                height: piece.round ? "7px" : "14px",
                borderRadius: piece.round ? "999px" : "2px",
                backgroundColor: piece.color,
                "--delay": `${piece.delay}s`,
                "--drift": `${piece.drift}px`,
                "--spin": `${piece.spin}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 27 }}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-[390px] overflow-hidden rounded-[2.25rem] border border-white/70 bg-paper px-6 pt-7 pb-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.35)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close match message"
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-ink/6 text-ink/50 transition-colors hover:bg-ink/10 hover:text-ink"
        >
          <X size={17} aria-hidden="true" />
        </button>

        <p className="text-[10px] font-bold tracking-[0.3em] text-coral uppercase">
          It&apos;s a match
        </p>

        <div className="relative mx-auto mt-6 h-36 w-full max-w-[250px]">
          <motion.div
            initial={{ rotate: -10, x: -12, opacity: 0 }}
            animate={{ rotate: -7, x: 0, opacity: 1 }}
            transition={{ delay: 0.12, type: "spring", stiffness: 220 }}
            className="absolute top-2 left-3 h-[112px] w-[92px] overflow-hidden rounded-[1.5rem] border-[3px] border-paper bg-paper-deep shadow-xl"
          >
            <Image
              src={match.profile.photo}
              alt={`Portrait of ${match.profile.name}`}
              fill
              sizes="100px"
              className="object-cover"
              unoptimized
            />
          </motion.div>

          <motion.div
            initial={{ rotate: 10, x: 12, opacity: 0 }}
            animate={{ rotate: 6, x: 0, opacity: 1 }}
            transition={{ delay: 0.18, type: "spring", stiffness: 220 }}
            className="absolute top-3 right-3 h-[112px] w-[92px] overflow-hidden rounded-[1.5rem] border-[3px] border-paper bg-paper-deep shadow-xl"
          >
            <Image
              src={currentUser.photo}
              alt={`Portrait of ${currentUser.name}`}
              fill
              sizes="100px"
              className="object-cover"
              unoptimized
            />
          </motion.div>

          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.32, type: "spring", stiffness: 360 }}
            className="absolute top-[46px] left-1/2 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-paper bg-coral text-white shadow-lg"
          >
            <Heart size={20} fill="currentColor" aria-hidden="true" />
          </motion.span>
        </div>

        <h2
          id="match-title"
          className="font-display mt-5 text-[2.5rem] leading-[0.95] font-semibold tracking-[-0.045em]"
        >
          You and {match.profile.name}
          <br />
          liked each other.
        </h2>

        <p className="mx-auto mt-3 max-w-[17rem] text-[13px] leading-5 text-muted">
          Some connections are worth a second look. This one is mutual.
        </p>

        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-paper transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Keep swiping
          </button>
          <button
            type="button"
            onClick={onViewMatches}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-white/50 px-6 text-sm font-semibold text-ink transition-colors hover:bg-white/80"
          >
            View matches
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>

        <p className="mt-4 text-[10px] font-medium tracking-[0.03em] text-muted/80">
          Only mutual likes are ever revealed.
        </p>
      </motion.section>
    </motion.div>
  );
}
