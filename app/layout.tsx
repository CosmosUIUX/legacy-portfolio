import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/lib/motion/provider";
import { TransitionLayout } from "@/components/transition-layout";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://legacyinteriors.com"),
  title: "Legacy Interiors and Developers — Creating Beautiful Spaces",
  description:
    "Expert interior design and development services. Timeless design, exceptional craftsmanship, and personalized service.",
  generator: "Legacy Interiors",
  alternates: {
    canonical: "https://legacyinteriors.com/",
  },
  openGraph: {
    siteName: "Legacy Interiors and Developers",
    title: "Creating Beautiful Spaces | Legacy Interiors and Developers",
    description:
      "Expert interior design and development services. Timeless design, exceptional craftsmanship, and personalized service.",
    type: "website",
    url: "https://legacyinteriors.com/",
    images: [
      {
        url: "/opengraph-image.jpg",
        alt: "Legacy Interiors and Developers — timeless design, exceptional craftsmanship",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creating Beautiful Spaces | Legacy Interiors and Developers",
    description:
      "Expert interior design and development services. Timeless design, exceptional craftsmanship, and personalized service.",
    images: [
      {
        url: "/opengraph-image.jpg",
        alt: "Legacy Interiors and Developers — timeless design, exceptional craftsmanship",
      },
    ],
    site: "@legacyinteriors",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans bg-neutral-50 text-neutral-900 overflow-x-hidden">
        <MotionProvider>
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
