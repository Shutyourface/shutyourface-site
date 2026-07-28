import type { Metadata } from "next";
import type { Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHUTYOURFACE | We don't pick sides. We just pick stories.",
  description: "The day's biggest stories — from politics and world news to sports, entertainment, and history. All in one place.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "SHUTYOURFACE.COM",
    description: "The day's biggest stories — from politics and world news to sports, entertainment, and history. All in one place.",
    url: "https://www.shutyourface.com",
    siteName: "ShutYourFace.com",
    images: [
      {
        url: "https://www.shutyourface.com/syf-preview.jpg",
        width: 1500,
        height: 788,
        alt: "ShutYourFace.com — We don't pick sides. We just pick stories.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHUTYOURFACE.COM",
    description: "The day's biggest stories — from politics and world news to sports, entertainment, and history. All in one place.",
    images: ["https://www.shutyourface.com/syf-preview.jpg"],
  },
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
