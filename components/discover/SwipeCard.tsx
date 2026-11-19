"use client";

import clsx from "clsx";
import {
  animate,
  motion,
  useAnimationControls,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { GraduationCap, MapPin } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

import type { Profile, SwipeGesture } from "@/lib/types";

type SwipeCardProps = {
  profile: Profile;
  isTop: boolean;
  exitDirection: SwipeGesture | null;
  disabled: boolean;
  onSwipe: (gesture: SwipeGesture) => void;
};

const SWIPE_DISTANCE = 92;
const SWIPE_VELOCITY = 520;

export function SwipeCard({
  profile,
  isTop,
  exitDirection,
  disabled,
  onSwipe,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-420, 0, 420], [-13, 0, 13]);
  const likeOpacity = useTransform(x, [28, 145], [0, 1]);
  const passOpacity = useTransform(x, [-145, -28], [1, 0]);
  const controls = useAnimationControls();

  useEffect(() => {
    if (!isTop) {
      return;
    }

    if (exitDirection) {
      void controls.start({
        x: exitDirection === "right" ? 720 : -720,
        rotate: exitDirection === "right" ? 20 : -20,
        opacity: 0,
        transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] },
      });
      return;
    }

    void controls.start({
      x: 0,
      rotate: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 420, damping: 34 },
    });
  }, [controls, exitDirection, isTop]);

  function handleDragEnd(_event: unknown, info: PanInfo) {
    if (!isTop || disabled) {
      return;
    }

    const distance = info.offset.x + info.velocity.x * 0.1;

    if (distance > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) {
      onSwipe("right");
      return;
    }

    if (distance < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) {
      onSwipe("left");
      return;
    }

    void animate(x, 0, {
      type: "spring",
      stiffness: 460,
      damping: 34,
      mass: 0.7,
    });
  }

  return (
    <motion.div
      className={clsx(
        "absolute inset-0",
        isTop ? "z-20" : "pointer-events-none z-10",
      )}
      initial={{ scale: 0.945, y: 18, opacity: 0.5 }}
      animate={{
        scale: isTop ? 1 : 0.955,
        y: isTop ? 0 : 10,
        opacity: isTop ? 1 : 0.72,
      }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={{ type: "spring", stiffness: 330, damping: 32 }}
      aria-hidden={!isTop}
    >
      <motion.article
        className={clsx(
          "relative h-full w-full touch-none overflow-hidden rounded-[2rem] bg-paper-deep select-none",
          "shadow-[0_22px_55px_rgba(43,31,22,0.22)] ring-1 ring-black/5",
          isTop && !disabled ? "cursor-grab active:cursor-grabbing" : "",
        )}
        drag={isTop && !disabled ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.92}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x, rotate }}
        animate={controls}
        aria-label={`${profile.name}, ${profile.age}. ${profile.bio}`}
      >
        <Image
          src={profile.photo}
          alt={`Portrait of ${profile.name}`}
          fill
          priority={isTop}
          sizes="(max-width: 768px) 100vw, 460px"
          className="pointer-events-none object-cover"
          draggable={false}
          unoptimized
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/28 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/20 to-transparent" />

        <motion.div
          className="absolute top-7 left-5 rotate-[-9deg] rounded-lg border-[3px] border-[#a9e6b1] px-3 py-1 text-[19px] font-extrabold tracking-[0.16em] text-[#a9e6b1]"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </motion.div>

        <motion.div
          className="absolute top-7 right-5 rotate-[9deg] rounded-lg border-[3px] border-[#ff9b8d] px-3 py-1 text-[19px] font-extrabold tracking-[0.16em] text-[#ff9b8d]"
          style={{ opacity: passOpacity }}
        >
          NOPE
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 px-5 pt-24 pb-5 text-white">
          <div className="flex items-end gap-2.5">
            <h2 className="font-display text-[2.55rem] leading-[0.92] font-semibold tracking-[-0.035em]">
              {profile.name}
            </h2>
            <span className="pb-1 text-[1.6rem] font-light text-white/90">
              {profile.age}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-medium text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={12.5} strokeWidth={2.1} aria-hidden="true" />
              {profile.city}
            </span>
            {profile.college ? (
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap
                  size={13}
                  strokeWidth={2.1}
                  aria-hidden="true"
                />
                {profile.college}
              </span>
            ) : null}
          </div>

          <p className="mt-3 line-clamp-3 max-w-[30rem] text-[13px] leading-[1.55] text-white/85">
            {profile.bio}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 4).map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-white/20 bg-white/12 px-2.5 py-1 text-[10px] font-medium tracking-[0.015em] text-white/90 backdrop-blur-md"
              >
                {interest}
              </span>
            ))}
            {profile.interests.length > 4 ? (
              <span className="rounded-full border border-white/20 bg-white/12 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-md">
                +{profile.interests.length - 4}
              </span>
            ) : null}
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}
