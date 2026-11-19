import type { Metadata } from "next";

import { DiscoverScreen } from "@/components/discover/DiscoverScreen";

export const metadata: Metadata = {
  title: "Discover",
  description: "Swipe through people and find a mutual match.",
};

export default function DiscoverPage() {
  return <DiscoverScreen />;
}
