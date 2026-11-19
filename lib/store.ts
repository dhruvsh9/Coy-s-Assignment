import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import seedDatabase from "@/data/seed.json";

import type {
  Database,
  Match,
  MatchRecord,
  Profile,
  SwipeDirection,
  SwipeResponse,
} from "./types";

const DEFAULT_DATA_DIR = path.join(process.cwd(), "data");

type StoreOptions = {
  dataDir?: string;
  now?: () => string;
};

export class StoreError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "bad_request") {
    super(message);
    this.name = "StoreError";
    this.status = status;
    this.code = code;
  }
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

function assertDatabase(value: unknown): asserts value is Database {
  if (typeof value !== "object" || value === null) {
    throw new Error("Database must be an object.");
  }

  const database = value as Partial<Database>;

  if (
    !database.currentUser ||
    !Array.isArray(database.profiles) ||
    !Array.isArray(database.incomingLikes) ||
    !Array.isArray(database.swipes) ||
    !Array.isArray(database.matches)
  ) {
    throw new Error("Database is missing required collections.");
  }

  for (const profile of database.profiles) {
    if (
      typeof profile.id !== "string" ||
      typeof profile.name !== "string" ||
      typeof profile.age !== "number" ||
      typeof profile.photo !== "string" ||
      typeof profile.bio !== "string" ||
      typeof profile.city !== "string" ||
      !Array.isArray(profile.interests)
    ) {
      throw new Error("Database contains an invalid profile.");
    }
  }
}

function toMatch(database: Database, record: MatchRecord): Match | null {
  const profile = database.profiles.find(
    (candidate) => candidate.id === record.profileId,
  );

  if (!profile) {
    return null;
  }

  return {
    id: record.id,
    matchedAt: record.matchedAt,
    profile,
  };
}

export function createStore(options: StoreOptions = {}) {
  const dataDir = options.dataDir
    ? path.resolve(/* turbopackIgnore: true */ options.dataDir)
    : DEFAULT_DATA_DIR;
  const dbPath = path.join(dataDir, "db.json");
  const now = options.now ?? (() => new Date().toISOString());

  let queue: Promise<unknown> = Promise.resolve();

  function withLock<T>(operation: () => Promise<T>): Promise<T> {
    const result = queue.then(operation, operation);
    queue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  async function readSeed(): Promise<Database> {
    const seed = structuredClone(seedDatabase) as Database;
    assertDatabase(seed);
    return seed;
  }

  async function writeDatabase(database: Database): Promise<void> {
    await fs.mkdir(dataDir, { recursive: true });
    const temporaryPath = `${dbPath}.${process.pid}.${randomUUID()}.tmp`;
    const contents = `${JSON.stringify(database, null, 2)}\n`;

    await fs.writeFile(temporaryPath, contents, "utf8");

    try {
      await fs.rename(temporaryPath, dbPath);
    } catch (error) {
      await fs.rm(temporaryPath, { force: true });
      throw error;
    }
  }

  async function readDatabase(): Promise<Database> {
    try {
      const raw = await fs.readFile(dbPath, "utf8");
      const parsed: unknown = JSON.parse(raw);
      assertDatabase(parsed);
      return parsed;
    } catch (error) {
      if (!isNotFound(error)) {
        throw error;
      }

      const seed = await readSeed();
      await writeDatabase(seed);
      return seed;
    }
  }

  function matchesFor(database: Database): Match[] {
    return database.matches
      .map((record) => toMatch(database, record))
      .filter((match): match is Match => match !== null)
      .sort(
        (left, right) =>
          new Date(right.matchedAt).getTime() -
          new Date(left.matchedAt).getTime(),
      );
  }

  return {
    async getFeed(): Promise<Profile[]> {
      return withLock(async () => {
        const database = await readDatabase();
        const swipedIds = new Set(
          database.swipes.map((swipe) => swipe.profileId),
        );

        return database.profiles.filter(
          (profile) => !swipedIds.has(profile.id),
        );
      });
    },

    async getMatches(): Promise<Match[]> {
      return withLock(async () => {
        const database = await readDatabase();
        return matchesFor(database);
      });
    },

    async swipe(
      profileId: string,
      direction: SwipeDirection,
    ): Promise<SwipeResponse> {
      return withLock(async () => {
        const database = await readDatabase();
        const profile = database.profiles.find(
          (candidate) => candidate.id === profileId,
        );

        if (!profile) {
          throw new StoreError("Profile not found.", 404, "not_found");
        }

        const alreadySwiped = database.swipes.some(
          (swipe) => swipe.profileId === profileId,
        );

        if (alreadySwiped) {
          throw new StoreError(
            "That profile has already been swiped.",
            409,
            "already_swiped",
          );
        }

        const createdAt = now();

        database.swipes.push({
          id: `swipe_${randomUUID()}`,
          profileId,
          direction,
          createdAt,
        });

        if (direction !== "like") {
          await writeDatabase(database);
          return { matched: false };
        }

        const likedBack = database.incomingLikes.includes(profileId);
        let matchRecord = database.matches.find(
          (match) => match.profileId === profileId,
        );

        if (likedBack && !matchRecord) {
          matchRecord = {
            id: `match_${randomUUID()}`,
            profileId,
            matchedAt: now(),
          };
          database.matches.push(matchRecord);
        }

        await writeDatabase(database);

        if (!matchRecord) {
          return { matched: false };
        }

        const match = toMatch(database, matchRecord);
        return match ? { matched: true, match } : { matched: false };
      });
    },
  };
}

export const store = createStore();
