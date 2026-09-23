import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono, Pinyon_Script } from "next/font/google";
import { story } from "@/story/story.config";
import "./globals.css";

// Type system (learned from Zero): elegant serif for copy, a script face for
// single "swash" capitals, a clean sans for brand/UI, mono for tiny labels.
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const script = Pinyon_Script({ variable: "--font-script", subsets: ["latin"], weight: "400" });
const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: story.brand,
  description: story.description,
};

export const viewport: Viewport = {
  themeColor: story.chapters[0].background,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${script.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
