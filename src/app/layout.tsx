import type { Metadata, Viewport } from "next";
import "./globals.css";
import { VitruvianBackdrop } from "@/components/vitruvian";
import { AuthListener } from "@/components/auth-listener";

export const metadata: Metadata = {
  title: {
    default: "Iron Milestones — The Codex of Iron",
    template: "%s · Iron Milestones",
  },
  description:
    "A strength-training tracker that turns squat, bench, and deadlift progress into an epic journey through the history of the iron game.",
  applicationName: "Iron Milestones",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#141c0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="pb-20 md:pb-8">
        <VitruvianBackdrop />
        <div className="scanlines" aria-hidden />
        <AuthListener />
        {children}
      </body>
    </html>
  );
}
