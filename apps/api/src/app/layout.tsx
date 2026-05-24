import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "HyperVoice - AI Voice Keyboard",
  description:
    "Dictate naturally in English, Bangla, or Hindi. HyperVoice cleans filler words, fixes grammar, and types for you in any app.",
  openGraph: {
    title: "HyperVoice",
    description: "AI-powered voice keyboard for Android",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}

