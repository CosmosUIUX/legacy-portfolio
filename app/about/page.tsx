"use client";

import { Suspense, lazy } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

// Lazy load components
const AboutContent = lazy(() => import("./about-content"));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Suspense fallback={<LoadingSpinner />}>
        <AboutContent />
      </Suspense>
      <Footer />
    </main>
  );
}
