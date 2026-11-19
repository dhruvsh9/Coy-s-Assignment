import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createStore } from "./store";
import type { Database } from "./types";

const seedPath = path.join(process.cwd(), "data", "seed.json");
const fixedNow = "2026-11-19T12:00:00.000Z";

describe("Coy discovery store", () => {
  let dataDir: string;
  let store: ReturnType<typeof createStore>;

  beforeEach(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), "coy-discover-"));
    store = createStore({ dataDir, now: () => fixedNow });
  });

  afterEach(async () => {
    await rm(dataDir, { recursive: true, force: true });
  });

  it("seeds 30 profiles and hides the pre-swiped match from the feed", async () => {
    const seed = JSON.parse(
      await readFile(seedPath, "utf8"),
    ) as Database;

    expect(seed.profiles).toHaveLength(50);

    const feed = await store.getFeed();
    expect(feed).toHaveLength(49);
    expect(feed.map((profile) => profile.id)).not.toContain("p08");
  });

  it("does not leak incoming likes or non-mutual profiles", async () => {
    const feed = await store.getFeed();
    const matches = await store.getMatches();

    for (const profile of feed) {
      expect(profile).not.toHaveProperty("incomingLikes");
      expect(profile).not.toHaveProperty("likedYou");
    }

    expect(matches).toHaveLength(1);
    expect(matches[0]?.profile.id).toBe("p08");
    expect(matches.map((match) => match.profile.id)).not.toContain("p01");
  });

  it("records a pass without creating a match, even for a seeded liker", async () => {
    const result = await store.swipe("p03", "pass");

    expect(result.matched).toBe(false);
    expect((await store.getMatches()).map((match) => match.profile.id)).not.toContain(
      "p03",
    );
    expect((await store.getFeed()).map((profile) => profile.id)).not.toContain(
      "p03",
    );
  });

  it("creates a match only when a like is mutual", async () => {
    const noMatch = await store.swipe("p02", "like");
    expect(noMatch.matched).toBe(false);

    const match = await store.swipe("p01", "like");
    expect(match.matched).toBe(true);
    expect(match.match?.profile.id).toBe("p01");

    const matches = await store.getMatches();
    expect(matches.map((entry) => entry.profile.id)).toContain("p01");

    const feed = await store.getFeed();
    expect(feed.map((profile) => profile.id)).not.toContain("p01");
    expect(feed.map((profile) => profile.id)).not.toContain("p02");
  });

  it("persists swipes and matches across store instances", async () => {
    await store.swipe("p01", "like");

    const reloadedStore = createStore({
      dataDir,
      now: () => fixedNow,
    });

    const feed = await reloadedStore.getFeed();
    const matches = await reloadedStore.getMatches();

    expect(feed.map((profile) => profile.id)).not.toContain("p01");
    expect(matches.map((match) => match.profile.id)).toContain("p01");
  });

  it("rejects duplicate swipes", async () => {
    await store.swipe("p01", "like");

    await expect(store.swipe("p01", "pass")).rejects.toMatchObject({
      status: 409,
      code: "already_swiped",
    });
  });

  it("rejects unknown profiles", async () => {
    await expect(store.swipe("not-a-profile", "like")).rejects.toMatchObject({
      status: 404,
      code: "not_found",
    });
  });

  it("serializes concurrent swipes without losing records", async () => {
    await Promise.all([
      store.swipe("p02", "pass"),
      store.swipe("p03", "like"),
      store.swipe("p04", "pass"),
    ]);

    const feed = await store.getFeed();
    const matches = await store.getMatches();
    const feedIds = feed.map((profile) => profile.id);

    expect(feedIds).not.toContain("p02");
    expect(feedIds).not.toContain("p03");
    expect(feedIds).not.toContain("p04");
    expect(matches.map((match) => match.profile.id)).toContain("p03");
  });
});
