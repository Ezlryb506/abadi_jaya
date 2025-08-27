"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import ResponsiveImageBox from "@/components/ui/ResponsiveImageBox";
import type { ImageProps } from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
  quality?: number;
  placeholder?: ImageProps['placeholder'];
  blurDataURL?: string;
  className?: string;
  containerClassName?: string;
  imageClassName?: string;
};

export default function ImageZoomLightbox({
  src,
  alt,
  sizes,
  priority,
  unoptimized,
  quality,
  placeholder,
  blurDataURL,
  className,
  containerClassName,
  imageClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [animate, setAnimate] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const lastTapRef = useRef<number>(0);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const isPinchingRef = useRef(false);
  const pinchStartRef = useRef({ dist: 0, zoom: 1, panX: 0, panY: 0, centerX: 0, centerY: 0 });
  // Momentum state
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const lastMoveRef = useRef<{ x: number; y: number; t: number }>({ x: 0, y: 0, t: 0 });
  const inertiaRafRef = useRef<number | null>(null);

  const openLightbox = useCallback(() => {
    setOpen(true);
    setZoom(1);
  }, []);

  const closeLightbox = useCallback(() => {
    setOpen(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
  }, [closeLightbox]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onKey]);

  // Helpers to clamp pan within bounds
  const clampPan = useCallback((px: number, py: number) => {
    const c = containerRef.current;
    const img = imgRef.current;
    if (!c || !img) return { x: 0, y: 0 };
    const containerW = c.clientWidth;
    const containerH = c.clientHeight;
    const baseW = img.clientWidth; // unscaled
    const baseH = img.clientHeight; // unscaled
    const scaledW = baseW * zoom;
    const scaledH = baseH * zoom;
    const maxX = Math.max(0, (scaledW - containerW) / 2);
    const maxY = Math.max(0, (scaledH - containerH) / 2);
    return { x: Math.max(-maxX, Math.min(maxX, px)), y: Math.max(-maxY, Math.min(maxY, py)) };
  }, [zoom]);

  // Utils: get offset from container center for an event client point
  const getCenterOffset = useCallback((clientX: number, clientY: number) => {
    const c = containerRef.current;
    if (!c) return { cx: 0, cy: 0 };
    const rect = c.getBoundingClientRect();
    const cx = clientX - (rect.left + rect.width / 2);
    const cy = clientY - (rect.top + rect.height / 2);
    return { cx, cy };
  }, []);

  // Handle wheel zoom with a non-passive native listener to allow preventDefault, plus zoom-to-cursor
  useEffect(() => {
    if (!open || !containerRef.current) return;
    const el = containerRef.current;
    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => {
        const next = Math.max(1, Math.min(3, parseFloat((z + delta).toFixed(2))));
        // adjust pan to keep cursor point stable
        const { cx, cy } = getCenterOffset(e.clientX, e.clientY);
        if (next !== z) {
          const scaleChange = next / z - 1;
          setPan((p) => clampPan(p.x - cx * scaleChange, p.y - cy * scaleChange));
        }
        return next;
      });
      // wheel zoom: no animation for precision
      setAnimate(false);
    };
    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheelNative);
    };
  }, [open, getCenterOffset, clampPan]);

  // Reset pan when zoom back to 1
  useEffect(() => {
    if (zoom === 1) setPan({ x: 0, y: 0 });
  }, [zoom]);

  

  // Re-clamp pan when zoom changes or on resize
  useEffect(() => {
    const handle = () => setPan((p) => clampPan(p.x, p.y));
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [clampPan]);

  // Drag to pan when zoomed in
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Helper: apply zoom to target around a client point with optional short animation
  const applyZoomAtPoint = useCallback(
    (targetZoom: number, clientX: number, clientY: number, withAnimation = true) => {
      targetZoom = Math.max(1, Math.min(3, targetZoom));
      setZoom((current) => {
        const { cx, cy } = getCenterOffset(clientX, clientY);
        const scaleChange = targetZoom / current - 1;
        setPan((p) => clampPan(p.x - cx * scaleChange, p.y - cy * scaleChange));
        return targetZoom;
      });
      if (withAnimation) {
        setAnimate(true);
        window.setTimeout(() => setAnimate(false), 220);
      }
    },
    [clampPan, getCenterOffset]
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();
    // stop any ongoing inertia
    if (inertiaRafRef.current) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }
    // track pointers for pinch
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 2) {
      // begin pinch
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy) || 1;
      const centerX = (pts[0].x + pts[1].x) / 2;
      const centerY = (pts[0].y + pts[1].y) / 2;
      isPinchingRef.current = true;
      pinchStartRef.current = { dist, zoom, panX: pan.x, panY: pan.y, centerX, centerY };
      return;
    }

    // double-tap detection for touch/pen only (hindari konflik dengan mouse onDoubleClick)
    if (e.pointerType !== 'mouse') {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        const targetZoom = zoom === 1 ? 2 : 1;
        applyZoomAtPoint(targetZoom, e.clientX, e.clientY, true);
      }
      lastTapRef.current = now;
    }

    if (zoom === 1) return; // don't start drag if not zoomed
    isDragging.current = true;
    setDragging(true);
    containerRef.current.setPointerCapture(e.pointerId);
    start.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    lastMoveRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    velocityRef.current = { vx: 0, vy: 0 };
  }, [zoom, pan.x, pan.y, applyZoomAtPoint]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();
    // update pointer location
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    // pinch handling
    if (pointersRef.current.size >= 2 && isPinchingRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy) || 1;
      const { dist: startDist, zoom: startZoom, panX, panY, centerX, centerY } = pinchStartRef.current;
      const rawZoom = (dist / startDist) * startZoom;
      const nextZoom = Math.max(1, Math.min(3, parseFloat(rawZoom.toFixed(3))));
      const { cx, cy } = getCenterOffset(centerX, centerY);
      const scaleChange = nextZoom / startZoom - 1;
      // adjust pan from original pan to keep pinch center
      const newPan = clampPan(panX - cx * scaleChange, panY - cy * scaleChange);
      setZoom(nextZoom);
      setPan(newPan);
      return;
    }
    // drag to pan
    if (!isDragging.current) return;
    const now = performance.now();
    const dxDrag = e.clientX - start.current.x;
    const dyDrag = e.clientY - start.current.y;
    const next = clampPan(start.current.panX + dxDrag, start.current.panY + dyDrag);
    setPan(next);
    // compute velocity (px/ms)
    const dt = Math.max(1, now - lastMoveRef.current.t);
    const vx = (e.clientX - lastMoveRef.current.x) / dt;
    const vy = (e.clientY - lastMoveRef.current.y) / dt;
    velocityRef.current = { vx, vy };
    lastMoveRef.current = { x: e.clientX, y: e.clientY, t: now };
  }, [clampPan, getCenterOffset]);

  const onPointerUp = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      isPinchingRef.current = false;
    }
    isDragging.current = false;
    setDragging(false);
    try { containerRef.current.releasePointerCapture(e.pointerId); } catch {}
    // start inertia after drag end if zoomed
    if (zoom > 1) {
      const friction = 0.92; // decay per frame
      const minSpeed = 0.02; // px/ms threshold
      let lastTime = performance.now();
      const step = () => {
        const now = performance.now();
        const dt = Math.min(32, now - lastTime); // clamp dt to avoid jumps
        lastTime = now;
        let { vx, vy } = velocityRef.current;
        // convert velocity px/ms to displacement in this frame
        const moveX = vx * dt;
        const moveY = vy * dt;
        setPan((p) => {
          const candidate = { x: p.x + moveX, y: p.y + moveY };
          const clamped = clampPan(candidate.x, candidate.y);
          // if hitting bounds, damp respective velocity
          if (clamped.x !== candidate.x) vx *= 0.4;
          if (clamped.y !== candidate.y) vy *= 0.4;
          return clamped;
        });
        // apply friction
        vx *= friction;
        vy *= friction;
        velocityRef.current = { vx, vy };
        const speed = Math.hypot(vx, vy);
        if (speed < minSpeed) {
          if (inertiaRafRef.current) cancelAnimationFrame(inertiaRafRef.current);
          inertiaRafRef.current = null;
          return;
        }
        inertiaRafRef.current = requestAnimationFrame(step);
      };
      // only start if there is meaningful velocity
      if (Math.hypot(velocityRef.current.vx, velocityRef.current.vy) >= minSpeed) {
        if (inertiaRafRef.current) cancelAnimationFrame(inertiaRafRef.current);
        inertiaRafRef.current = requestAnimationFrame(step);
      }
    }
  };

  // cancel inertia on unmount or when lightbox closes
  useEffect(() => {
    if (!open && inertiaRafRef.current) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }
    return () => {
      if (inertiaRafRef.current) {
        cancelAnimationFrame(inertiaRafRef.current);
        inertiaRafRef.current = null;
      }
    };
  }, [open]);

  return (
    <div className={clsx("group relative", className)}>
      {/* Hint overlay */}
      <button
        type="button"
        aria-label="Perbesar gambar"
        onClick={openLightbox}
        className="absolute z-30 right-3 bottom-3 rounded-full bg-black/50 text-white text-xs px-3 py-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition focus:opacity-100"
      >
        <span className="mr-1">🔍</span> Perbesar
      </button>

      {/* Display image with dynamic aspect ratio */}
      <ResponsiveImageBox
        src={src}
        alt={alt}
        sizes={sizes}
        priority={priority}
        unoptimized={unoptimized}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        containerClassName={clsx("rounded-xl z-0", containerClassName)}
        imageClassName={clsx("pointer-events-none", imageClassName)}
      />

      {/* Lightbox */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col"
        >
          <div className="flex items-center justify-between p-3 md:p-4 text-white">
            <div className="text-sm opacity-80">Klik dan drag untuk geser. Scroll untuk zoom.</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, parseFloat((z - 0.2).toFixed(2))))}
                className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
                aria-label="Perkecil"
              >
                −
              </button>
              <span className="min-w-[56px] text-center text-sm">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, parseFloat((z + 0.2).toFixed(2))))}
                className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
                aria-label="Perbesar"
              >
                +
              </button>
              <button
                type="button"
                onClick={closeLightbox}
                className="ml-2 px-3 py-1 rounded bg-white/10 hover:bg-white/20"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative flex-1 overflow-hidden touch-none overscroll-none select-none"
            onDragStart={(e) => e.preventDefault()}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onDoubleClick={(e) => {
              // toggle zoom around cursor for mouse
              e.preventDefault();
              if (!containerRef.current) return;
              const targetZoom = zoom === 1 ? 2 : 1;
              applyZoomAtPoint(targetZoom, e.clientX, e.clientY, true);
            }}
          >
            <div
              className="min-h-full min-w-full flex items-center justify-center p-4"
              style={{ cursor: dragging ? "grabbing" : zoom > 1 ? "grab" : "default" }}
            >
              <div
                className="relative"
                style={{
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: animate && !dragging ? "transform 200ms cubic-bezier(0.2, 0, 0, 1)" : "none",
                }}
              >
                {/* gunakan tag img biasa agar tidak mengganggu zoom transform next/image wrapper */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={src}
                  alt={alt}
                  className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow pointer-events-none select-none"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
