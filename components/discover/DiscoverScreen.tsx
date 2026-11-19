"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type {
  FeedResponse,
  Match,
  MatchesResponse,
  Profile,
  SwipeDirection,
  SwipeGesture,
  SwipeResponse,
} from "@/lib/types";

import { DeckEmpty, DeckError, DeckLoading } from "./DeckStates";
import { MatchMoment } from "./MatchMoment";
import { MatchesView } from "./MatchesView";
import { SwipeCard } from "./SwipeCard";

type Toast = {
  id: number;
  text: string;
  tone: "default" | "error";
};

type SwipeFailure = Error & { status?: number };

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T;
  return data;
}

async function requestDiscoveryData() {
  const [feedResponse, matchesResponse] = await Promise.all([
    fetch("/feed", { cache: "no-store" }),
    fetch("/matches", { cache: "no-store" }),
  ]);

  if (!feedResponse.ok || !matchesResponse.ok) {
    throw new Error("One or more requests failed.");
  }

  const [feedData, matchesData] = await Promise.all([
    readJson<FeedResponse>(feedResponse),
    readJson<MatchesResponse>(matchesResponse),
  ]);

  return {
    feed: feedData.profiles,
    matches: matchesData.matches,
  };
}

export function DiscoverScreen() {
  const [feed, setFeed] = useState<Profile[] | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [exitDirection, setExitDirection] = useState<SwipeGesture | null>(null);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [showMatches, setShowMatches] = useState(false);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  const toastTimer = useRef<number | null>(null);
  const toastCounter = useRef(0);

  const topProfile = feed?.[0] ?? null;

  const showToast = useCallback(
    (text: string, tone: Toast["tone"] = "default") => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }

      toastCounter.current += 1;
      setToast({ id: toastCounter.current, text, tone });
      toastTimer.current = window.setTimeout(() => {
        setToast(null);
        toastTimer.current = null;
      }, 2300);
    },
    [],
  );

  const retryLoad = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    setMatchesLoading(true);

    try {
      const data = await requestDiscoveryData();
      setFeed(data.feed);
      setMatches(data.matches);
    } catch (error) {
      console.error(error);
      setLoadError(true);
      setFeed([]);
    } finally {
      setLoading(false);
      setMatchesLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await requestDiscoveryData();

        if (cancelled) {
          return;
        }

        setFeed(data.feed);
        setMatches(data.matches);
        setLoadError(false);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);
        setLoadError(true);
        setFeed([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setMatchesLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const openMatches = useCallback(async () => {
    setShowMatches(true);
    setMatchesLoading(true);

    try {
      const response = await fetch("/matches", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Could not load matches.");
      }

      const data = await readJson<MatchesResponse>(response);
      setMatches(data.matches);
    } catch (error) {
      console.error(error);
      showToast("Couldn't refresh matches right now.", "error");
    } finally {
      setMatchesLoading(false);
    }
  }, [showToast]);

  const performSwipe = useCallback(
    async (gesture: SwipeGesture) => {
      if (!topProfile || busy) {
        return;
      }

      const direction: SwipeDirection =
        gesture === "right" ? "like" : "pass";
      const profile = topProfile;
      setBusy(true);
      setExitDirection(gesture);
      setToast(null);

      const request = fetch("/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: profile.id, direction }),
      }).then(async (response) => {
        if (!response.ok) {
          const data = await readJson<{ error?: string }>(response).catch(
            () => ({ error: undefined }),
          );
          const error = new Error(
            data.error ?? "Could not save that swipe.",
          ) as SwipeFailure;
          error.status = response.status;
          throw error;
        }

        return readJson<SwipeResponse>(response);
      });

      try {
        const [result] = await Promise.all([request, wait(280)]);

        setFeed((current) =>
          current
            ? current.filter((candidate) => candidate.id !== profile.id)
            : current,
        );
        setExitDirection(null);

        if (result.matched && result.match) {
          const match = result.match;
          setMatches((current) => [
            match,
            ...current.filter((candidate) => candidate.id !== match.id),
          ]);
          setActiveMatch(match);
        } else {
          showToast(
            direction === "like"
              ? `Liked ${profile.name}`
              : `Passed on ${profile.name}`,
          );
        }
      } catch (error) {
        console.error(error);
        setExitDirection(null);

        if ((error as SwipeFailure).status === 409) {
          setFeed((current) =>
            current
              ? current.filter((candidate) => candidate.id !== profile.id)
              : current,
          );
          showToast("That profile has already been swiped.");
        } else {
          showToast("Couldn't save that swipe. Try again.", "error");
        }
      } finally {
        setBusy(false);
      }
    },
    [busy, showToast, topProfile],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (activeMatch) {
          setActiveMatch(null);
          return;
        }
        if (showMatches) {
          setShowMatches(false);
        }
        return;
      }

      if (showMatches || activeMatch) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        void performSwipe("left");
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        void performSwipe("right");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMatch, performSwipe, showMatches]);

  function handleViewMatchesFromMoment() {
    setActiveMatch(null);
    void openMatches();
  }

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden bg-paper">
      <div className="pointer-events-none absolute -top-20 -right-24 h-56 w-56 rounded-full bg-coral-soft/60 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-28 h-52 w-52 rounded-full bg-[#dbe6d4]/70 blur-3xl" />

      <header className="relative z-10 flex shrink-0 items-center justify-between px-5 pt-4 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-[2.05rem] leading-none font-semibold tracking-[-0.055em]">
              coy
            </span>
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-coral" />
          </div>
          <p className="mt-1.5 text-[9px] font-bold tracking-[0.26em] text-muted uppercase">
            Discover
          </p>
        </div>

        <button
          type="button"
          onClick={() => void openMatches()}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-line/80 bg-white/55 pr-2.5 pl-3 text-ink shadow-[0_4px_14px_rgba(43,31,22,0.04)] backdrop-blur-md transition-colors hover:bg-white/85"
          aria-label={`View matches, ${matches.length} total`}
        >
          <Heart
            size={14}
            className="text-coral"
            fill="currentColor"
            aria-hidden="true"
          />
          <span className="text-[9.5px] font-bold tracking-[0.16em] uppercase">
            Matches
          </span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-[10px] font-semibold text-paper">
            {matches.length}
          </span>
        </button>
      </header>

      <div className="relative z-10 min-h-0 flex-1 px-4">
        {loading ? (
          <DeckLoading />
        ) : loadError ? (
          <DeckError onRetry={() => void retryLoad()} />
        ) : topProfile ? (
          <div className="relative h-full">
            <AnimatePresence initial={false}>
              {feed?.slice(0, 2).map((profile) => {
                const isTop = profile.id === topProfile.id;

                return (
                  <SwipeCard
                    key={profile.id}
                    profile={profile}
                    isTop={isTop}
                    exitDirection={isTop ? exitDirection : null}
                    disabled={busy || activeMatch !== null}
                    onSwipe={(direction) => void performSwipe(direction)}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <DeckEmpty onViewMatches={() => void openMatches()} />
        )}
      </div>

      <footer className="relative z-10 shrink-0 px-5 pt-3 pb-2.5">
        {topProfile ? (
          <>
            <div className="flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => void performSwipe("left")}
                disabled={busy || Boolean(activeMatch)}
                aria-label={`Pass on ${topProfile.name}`}
                className="flex h-[62px] w-[62px] items-center justify-center rounded-full border border-line bg-white/75 text-ink/65 shadow-[0_9px_24px_rgba(43,31,22,0.1)] backdrop-blur-sm transition-all hover:scale-105 hover:border-ink/15 hover:bg-white hover:text-ink active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X size={25} strokeWidth={1.9} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => void performSwipe("right")}
                disabled={busy || Boolean(activeMatch)}
                aria-label={`Like ${topProfile.name}`}
                className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-coral text-white shadow-[0_12px_30px_rgba(217,86,69,0.34)] transition-all hover:scale-105 hover:bg-[#cb4b3b] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Heart
                  size={27}
                  fill="currentColor"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </button>
            </div>

            <p className="mt-2 text-center text-[8.5px] font-semibold tracking-[0.18em] text-muted/75 uppercase">
              <span className="hidden sm:inline">← Pass · Like → · </span>
              Swipe or tap
            </p>
          </>
        ) : (
          <div className="h-[84px]" aria-hidden="true" />
        )}
      </footer>

      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-none absolute bottom-[6.75rem] left-1/2 z-40 -translate-x-1/2"
            role="status"
            aria-live="polite"
          >
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold shadow-lg backdrop-blur-lg ${
                toast.tone === "error"
                  ? "border-coral/20 bg-[#2a1512]/90 text-white"
                  : "border-white/50 bg-ink/90 text-paper"
              }`}
            >
              {toast.tone === "error" ? (
                <X size={12} aria-hidden="true" />
              ) : (
                <Heart
                  size={11}
                  fill="currentColor"
                  className="text-coral-soft"
                  aria-hidden="true"
                />
              )}
              {toast.text}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {activeMatch ? (
          <MatchMoment
            match={activeMatch}
            onClose={() => setActiveMatch(null)}
            onViewMatches={handleViewMatchesFromMoment}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showMatches ? (
          <MatchesView
            matches={matches}
            loading={matchesLoading}
            onClose={() => setShowMatches(false)}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
