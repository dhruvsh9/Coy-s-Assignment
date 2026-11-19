import { connection, NextResponse } from "next/server";

import { store } from "@/lib/store";
import type { MatchesResponse } from "@/lib/types";

export async function GET() {
  await connection();

  try {
    const matches = await store.getMatches();
    const body: MatchesResponse = { matches };

    return NextResponse.json(body, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GET /matches failed", error);
    return NextResponse.json(
      { error: "Could not load matches." },
      { status: 500 },
    );
  }
}
