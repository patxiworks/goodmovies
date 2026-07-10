"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DURATION = 320;

/**
 * A poster thumbnail that opens into a centered lightbox. The enlarged image
 * animates (FLIP) from the thumbnail's exact position/size out to full size,
 * and eases back into the thumbnail on close.
 */
export function PosterZoom({
  src,
  alt,
  className
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const thumbRef = useRef<HTMLImageElement>(null);
  const bigRef = useRef<HTMLImageElement>(null);
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false); // backdrop fade

  // Transform that maps the enlarged image back onto the thumbnail.
  const mapToThumb = useCallback(() => {
    const thumb = thumbRef.current;
    const big = bigRef.current;
    if (!thumb || !big) return "";
    const t = thumb.getBoundingClientRect();
    const b = big.getBoundingClientRect();
    if (!b.width || !b.height) return "";
    const scale = t.width / b.width;
    const dx = t.left + t.width / 2 - (b.left + b.width / 2);
    const dy = t.top + t.height / 2 - (b.top + b.height / 2);
    return `translate(${dx}px, ${dy}px) scale(${scale})`;
  }, []);

  // Opening: start at the thumbnail, then ease out to full size.
  useLayoutEffect(() => {
    if (!open) return;
    const big = bigRef.current;
    if (!big) return;
    const from = mapToThumb();
    big.style.transition = "none";
    big.style.transform = from;
    void big.getBoundingClientRect(); // force reflow
    requestAnimationFrame(() => {
      big.style.transition = `transform ${DURATION}ms ${EASE}`;
      big.style.transform = "translate(0, 0) scale(1)";
      setEntered(true);
    });
  }, [open, mapToThumb]);

  const close = useCallback(() => {
    const big = bigRef.current;
    if (!big) {
      setOpen(false);
      return;
    }
    setEntered(false);
    big.style.transition = `transform ${DURATION}ms ${EASE}`;
    big.style.transform = mapToThumb();
    const done = () => {
      setOpen(false);
    };
    big.addEventListener("transitionend", done, { once: true });
    setTimeout(done, DURATION + 60); // safety net
  }, [mapToThumb]);

  // Lock scroll + Escape to close while open.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={thumbRef}
        src={src}
        alt={alt}
        loading="lazy"
        onClick={() => setOpen(true)}
        className={`${className ?? ""} cursor-zoom-in transition hover:brightness-105`}
      />
      {open && (
        <div
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.8)",
            opacity: entered ? 1 : 0,
            transition: `opacity ${DURATION}ms ease`
          }}
          role="dialog"
          aria-modal="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={bigRef}
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] cursor-zoom-out rounded-lg shadow-2xl"
            style={{ transformOrigin: "center center", willChange: "transform" }}
          />
        </div>
      )}
    </>
  );
}
