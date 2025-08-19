"use client";

import { useState, useEffect } from 'react';

interface LocalTimeProps {
  utcTime: string;
}

export default function LocalTime({ utcTime }: LocalTimeProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Tampilkan placeholder saat render di server atau sebelum mounting
    return <span>&nbsp;</span>;
  }

    // Tambahkan 'Z' untuk menandakan bahwa ini adalah waktu UTC
  const date = new Date(utcTime + 'Z');
  const formattedTime = date.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Gunakan format 24 jam jika perlu
  });

  return <>{formattedTime}</>;
}
