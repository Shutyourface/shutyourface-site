import type { Metadata } from "next";
import type { Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHUTYOUR FACE | Real News. No BS. Say Less.",
  description: "A fast retro political news aggregation front page with tabloid energy.",
};

export const viewport: Viewport = {
  width: "1500",
  initialScale: 0.25,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
