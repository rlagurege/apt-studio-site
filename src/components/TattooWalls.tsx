"use client";

import { useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { tattoos } from "@/content/tattoos";

function getSlideImages(): string[] {
  const urls = tattoos.map((t) => t.imageUrl).filter(Boolean);
  
  if (urls.length === 0) {
    return [];
  }
  
  // For seamless looping with slidesPerView={3}, we need at least 6 images per side
  // Duplicate enough times to ensure continuous slides without gaps
  // Each side needs enough slides to loop seamlessly (minimum 2x slidesPerView)
  const minSlidesPerSide = 12; // Enough for seamless looping
  const totalNeeded = minSlidesPerSide * 2; // For both sides
  
  const extended: string[] = [];
  // Keep duplicating until we have enough for seamless looping
  while (extended.length < totalNeeded) {
    extended.push(...urls);
  }
  
  // Return exactly what we need for seamless looping
  return extended.slice(0, totalNeeded);
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

  // Split images between left and right walls - ensure each has enough for seamless looping
  // Each side needs at least 12 images for smooth continuous slides
  const mid = Math.floor(slideImages.length / 2);
  const leftImgs = slideImages.slice(0, mid);
  const rightImgs = slideImages.slice(mid);
  
  // Ensure both sides have enough images (duplicate if needed)
  const minPerSide = 12;
  const leftFinal = leftImgs.length >= minPerSide 
    ? leftImgs 
    : [...leftImgs, ...leftImgs.slice(0, minPerSide - leftImgs.length)];
  const rightFinal = rightImgs.length >= minPerSide 
    ? rightImgs 
    : [...rightImgs, ...rightImgs.slice(0, minPerSide - rightImgs.length)];

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
            loop={leftFinal.length >= 6}
            loopAdditionalSlides={3}
            slidesPerView={3}
            spaceBetween={12}
            speed={2500}
            allowTouchMove={false}
            autoplay={reduce ? false : { delay: 5000, disableOnInteraction: false }}
          >
            {leftFinal.map((src, idx) => (
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
            loop={rightFinal.length >= 6}
            loopAdditionalSlides={3}
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
            {rightFinal.map((src, idx) => (
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
