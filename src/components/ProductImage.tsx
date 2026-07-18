"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  src: string | null;
  alt: string;
  className?: string;
};

export default function ProductImage({ src, alt, className = "" }: Props) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <svg viewBox="0 0 24 24" className={className}>
        <rect width="24" height="24" fill="#f3f4f6" />
        <path
          d="M8 10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm8 6l-3-4-3 3.72V19h10v-7zm4-11H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
          fill="#d1d5db"
        />
      </svg>
    );
  }

  if (src.startsWith("data:")) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${!loaded ? "bg-slate-200" : ""}`}
      loading="lazy"
      onLoad={() => setLoaded(true)}
    />
  );
}