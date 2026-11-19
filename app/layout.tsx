import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";

import { BottomNav } from "@/components/BottomNav";

import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Coy — Discover",
    template: "%s · Coy",
  },
  description:
    "A privacy-first swipe-to-discover experience. Matches only appear when the feeling is mutual.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f2ea",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable}`}>
      <body>
        <div className="app-stage">
          <div className="app-frame">
            <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
            <BottomNav />
          </div>
        </div>
      </body>
    </html>
  );
}
