"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

export type ResponsiveImageBoxProps = {
  containerClassName?: string;
  imageClassName?: string;
} & Pick<ImageProps, "src" | "alt" | "sizes" | "priority" | "unoptimized" | "placeholder" | "blurDataURL" | "quality">;

export default function ResponsiveImageBox({
  src,
  alt,
  sizes,
  priority,
  unoptimized,
  quality,
  placeholder,
  blurDataURL,
  containerClassName,
  imageClassName,
}: ResponsiveImageBoxProps) {
  const [ratio, setRatio] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Fallback ratio agar layout stabil sebelum load
  const fallbackRatio = 3 / 2;
  const aspectRatio = useMemo(() => ratio ?? fallbackRatio, [ratio, fallbackRatio]);

  const onLoad = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    const w = el.naturalWidth;
    const h = el.naturalHeight;
    if (w > 0 && h > 0) {
      const r = w / h;
      setRatio(r);
      setLoaded(true);
    }
  }, []);

  // Jika gambar sudah ter-cache, event onLoad kadang tidak firing
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete) {
      onLoad();
    }
  }, [onLoad]);

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-xl transition-all duration-500 ease-out",
        containerClassName
      )}
      style={{ aspectRatio: `${aspectRatio}` }}
   >
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        className={clsx(
          "object-contain opacity-0 transition-opacity duration-500 ease-out",
          loaded && "opacity-100",
          imageClassName
        )}
        priority={priority}
        unoptimized={unoptimized}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={onLoad}
      />
    </div>
  );
}
