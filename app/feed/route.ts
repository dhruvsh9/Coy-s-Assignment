import { connection, NextResponse } from "next/server";

import { store } from "@/lib/store";
import type { FeedResponse } from "@/lib/types";

export async function GET() {
  await connection();

  try {
    const profiles = await store.getFeed();
    const body: FeedResponse = { profiles };

    return NextResponse.json(body, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GET /feed failed", error);
    return NextResponse.json(
      { error: "Could not load the discovery feed." },
      { status: 500 },
    );
  }
}
