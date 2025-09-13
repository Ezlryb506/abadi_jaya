'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fetchPriority?: 'auto' | 'high' | 'low';
  quality?: number;
  containerClassName?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  sizes,
  priority = false,
  fetchPriority = 'auto',
  quality = 60,
  containerClassName = '',
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`${containerClassName} ${fill ? 'absolute inset-0' : ''} flex items-center justify-center bg-orange-50 text-5xl`}>
        🧰
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        priority={priority}
        fetchPriority={fetchPriority}
        quality={quality}
        onError={() => setImageError(true)}
      />
    </div>
  );
}
