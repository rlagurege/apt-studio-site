"use client";

import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { tattoos } from "@/content/tattoos";
import Image from "next/image";

const SLIDES_MIN = 6;

function getSlideImageUrls(): string[] {
  const urls = tattoos.map((t) => t.imageUrl);
  if (urls.length === 0) urls.push("/hero-cover.png");
  while (urls.length < SLIDES_MIN) {
    urls.push(...urls);
  }
  return urls.slice(0, SLIDES_MIN);
}

export default function SideSlideshow() {
  const slideUrls = useMemo(getSlideImageUrls, []);

  return (
    <>
      <div className="side-slideshow left pointer-events-none">
        <Swiper
          className="leftSwiper !h-full"
          direction="vertical"
          loop
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          speed={6000}
          slidesPerView={3}
          spaceBetween={10}
          allowTouchMove={false}
          modules={[Autoplay]}
        >
          {slideUrls.map((url, i) => (
            <SwiperSlide key={`left-${i}`} className="!h-[calc((100vh-20px)/3)]">
              <div className="relative h-full w-full">
                <Image src={url} alt="" fill className="object-cover" unoptimized sizes="180px" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="side-slideshow right pointer-events-none">
        <Swiper
          className="rightSwiper !h-full"
          direction="vertical"
          loop
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            reverseDirection: true,
          }}
          speed={6000}
          slidesPerView={3}
          spaceBetween={10}
          allowTouchMove={false}
          modules={[Autoplay]}
        >
          {slideUrls.map((url, i) => (
            <SwiperSlide key={`right-${i}`} className="!h-[calc((100vh-20px)/3)]">
              <div className="relative h-full w-full">
                <Image src={url} alt="" fill className="object-cover" unoptimized sizes="180px" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}
