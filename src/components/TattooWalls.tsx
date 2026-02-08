"use client";

import { useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { tattoos } from "@/content/tattoos";

function getSlideImages(): string[] {
  const urls = tattoos.map((t) => t.imageUrl).filter(Boolean);
  // Ensure we have at least 12 images total (6 per side) by duplicating
  // Use a deterministic shuffle for consistent but varied pattern
  const extended: string[] = [];
  while (extended.length < 12) {
    extended.push(...urls);
  }
  // Interleave images for better visual distribution
  const interleaved: string[] = [];
  for (let i = 0; i < Math.max(extended.length, 12); i++) {
    interleaved.push(extended[i % urls.length]);
  }
  return interleaved.slice(0, Math.max(12, extended.length));
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function TattooWalls({ styleKey = "modern" }: { styleKey?: string }) {
  const slideImages = useMemo(getSlideImages, []);

  useEffect(() => {
    const onScroll = () => {
      const t = window.scrollY;
      const els = document.querySelectorAll<HTMLElement>("[data-wall]");
      els.forEach((el, idx) => {
        const drift = t * (idx === 0 ? 0.02 : -0.02);
        el.style.transform = `translateY(${drift}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const reduce = prefersReducedMotion();

  // Split images between left and right walls - ensure each has at least 6
  const mid = Math.ceil(slideImages.length / 2);
  const leftImgs = slideImages.slice(0, mid);
  const rightImgs = slideImages.slice(mid);

  return (
    <>
      <aside className={`apt-wall apt-wall-left apt-style-${styleKey}`} aria-hidden="true">
        <div className="apt-wall-fx apt-smoke" />
        <div className="apt-wall-fx apt-grain" />
        <div className="apt-wall-fx apt-scanlines" />
        <div className="apt-fade apt-fade-left" />

        <div className="apt-wall-inner" data-wall>
          <Swiper
            modules={[Autoplay]}
            direction="vertical"
            loop
            slidesPerView={3}
            spaceBetween={12}
            speed={2500}
            allowTouchMove={false}
            autoplay={reduce ? false : { delay: 5000, disableOnInteraction: false }}
          >
            {leftImgs.map((src, idx) => (
              <SwiperSlide key={`left-${src}-${idx}`}>
                <div className="apt-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </aside>

      <aside className={`apt-wall apt-wall-right apt-style-${styleKey}`} aria-hidden="true">
        <div className="apt-wall-fx apt-smoke" />
        <div className="apt-wall-fx apt-grain" />
        <div className="apt-wall-fx apt-scanlines" />
        <div className="apt-fade apt-fade-right" />

        <div className="apt-wall-inner" data-wall>
          <Swiper
            modules={[Autoplay]}
            direction="vertical"
            loop
            slidesPerView={3}
            spaceBetween={12}
            speed={2500}
            allowTouchMove={false}
            autoplay={
              reduce
                ? false
                : { delay: 5000, reverseDirection: true, disableOnInteraction: false }
            }
          >
            {rightImgs.map((src, idx) => (
              <SwiperSlide key={`right-${src}-${idx}`}>
                <div className="apt-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </aside>
    </>
  );
}
