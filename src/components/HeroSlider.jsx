"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ImageWithFade from "./ImageWithFade";
import useEmblaCarousel from "embla-carousel-react";

const AUTOPLAY_INTERVAL = 3500;
const RESUME_DELAY = 5000;

export default function HeroSlider({ images = [] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    skipSnaps: false,
    dragFree: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoplayTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const scrollTo = useCallback(
    (index) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const stopAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    if (!emblaApi || images.length <= 1) return;
    stopAutoplay();
    autoplayTimerRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, AUTOPLAY_INTERVAL);
  }, [emblaApi, images.length, stopAutoplay]);

  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    resumeTimerRef.current = setTimeout(() => {
      resumeTimerRef.current = null;
      startAutoplay();
    }, RESUME_DELAY);
  }, [startAutoplay]);

  const scheduleResumeRef = useRef(null);
  useEffect(() => {
    scheduleResumeRef.current = scheduleResume;
  }, [scheduleResume]);

  const globalListenerRef = useRef(null);

  const handleInteractionStart = useCallback(() => {
    stopAutoplay();
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    if (globalListenerRef.current) return;
    const onGlobalPointerEnd = () => {
      document.removeEventListener("pointerup", onGlobalPointerEnd);
      document.removeEventListener("pointercancel", onGlobalPointerEnd);
      globalListenerRef.current = null;
      scheduleResumeRef.current?.();
    };
    globalListenerRef.current = onGlobalPointerEnd;
    document.addEventListener("pointerup", onGlobalPointerEnd);
    document.addEventListener("pointercancel", onGlobalPointerEnd);
  }, [stopAutoplay]);

  const handleDotClick = useCallback(
    (index) => {
      scrollTo(index);
      stopAutoplay();
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
      scheduleResume();
    },
    [scrollTo, stopAutoplay, scheduleResume]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const initialTimer = setTimeout(() => onSelect(), 0);
    emblaApi.on("select", onSelect);
    return () => {
      clearTimeout(initialTimer);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || images.length <= 1) return;
    startAutoplay();
    return () => {
      stopAutoplay();
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
      if (globalListenerRef.current) {
        const handler = globalListenerRef.current;
        document.removeEventListener("pointerup", handler);
        document.removeEventListener("pointercancel", handler);
        globalListenerRef.current = null;
      }
    };
  }, [emblaApi, images.length, startAutoplay, stopAutoplay]);

  if (images.length === 0) {
    return (
      <section className="relative h-[220px] shrink-0 overflow-hidden bg-neutral-200">
        <div className="flex h-full items-center justify-center text-slate-400">
          Carta Chalito
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[220px] shrink-0 overflow-hidden bg-neutral-200 select-none touch-pan-y">
      <div
        className="h-full overflow-hidden"
        ref={emblaRef}
        onPointerDown={handleInteractionStart}
        onTouchStart={handleInteractionStart}
      >
        <div className="flex h-full">
          {images.map((img, idx) => (
            <div
              key={img.src + idx}
              className="min-w-0 flex-[0_0_100%]"
            >
              <ImageWithFade
                src={img.src}
                alt={img.alt}
                width={400}
                height={220}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {images.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleDotClick(idx)}
            aria-label={`Ir a imagen ${idx + 1}`}
            className={`h-2 w-2 rounded-full transition-colors ${
              idx === selectedIndex ? "bg-white" : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
