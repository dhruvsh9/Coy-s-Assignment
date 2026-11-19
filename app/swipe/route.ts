import { connection, NextResponse } from "next/server";

import { store, StoreError } from "@/lib/store";
import type { SwipeDirection } from "@/lib/types";

type SwipeBody = {
  profileId?: unknown;
  direction?: unknown;
};

export async function POST(request: Request) {
  await connection();

  let body: SwipeBody;

  try {
    body = (await request.json()) as SwipeBody;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const { profileId, direction } = body;

  if (typeof profileId !== "string" || profileId.trim().length === 0) {
    return NextResponse.json(
      { error: "`profileId` is required." },
      { status: 400 },
    );
  }

  if (direction !== "like" && direction !== "pass") {
    return NextResponse.json(
      { error: "`direction` must be either `like` or `pass`." },
      { status: 400 },
    );
  }

  try {
    const result = await store.swipe(
      profileId.trim(),
      direction as SwipeDirection,
    );

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof StoreError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    console.error("POST /swipe failed", error);
    return NextResponse.json(
      { error: "Could not save that swipe." },
      { status: 500 },
    );
  }
}
