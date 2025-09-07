"use client";

import { useScrollAnimation } from "@/lib/motion/hooks";
import Image from "next/image";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  parallaxOffset?: number;
}

export function ParallaxImage({
  src,
  alt,
  className,
  parallaxOffset = 12,
}: ParallaxImageProps) {
  const { ref, style } = useScrollAnimation({
    offset: ["start end", "end start"],
    transform: {
      y: [-parallaxOffset, parallaxOffset],
    },
  });

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`relative ${className}`}>
      <div style={style} className="relative w-full h-full">
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  );
}
