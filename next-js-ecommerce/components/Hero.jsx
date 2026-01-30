"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[30vh] sm:min-h-[45vh] md:min-h-[58vh] lg:h-[75vh] 2xl:h-[90vh] mt-10 md:mt-3 flex items-center justify-center px-4 sm:px-6 md:px-12 2xl:px-0">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 mx-auto w-full max-w-full overflow-hidden  ">
        <Image
          src="/images/hero.png"
          alt="Ramp Electronics Hero"
          fill
          priority
          className="object-contain w-full h-full rounded transition-transform duration-700 "
          quality={100}
        />
        {/* Optional Gradient Overlay */}
      </div>

      {/* Hero Content (empty for now) */}
      <div className="relative z-10 w-full h-full flex items-center justify-center"></div>
    </section>
  );
}
