"use client";

import React, { useEffect, useState } from "react";

const SaleCounter = () => {
  const SALE_END = new Date().getTime() + 2 * 24 * 60 * 60 * 1000;

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const diff = SALE_END - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [time, setTime] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-black py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-2xl shadow-2xl text-white py-12 px-6">
          {/* Glow animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-pulse" />

          <div className="relative max-w-4xl mx-auto text-center">
            <span className="inline-block mb-3 px-4 py-1 text-xs font-semibold tracking-widest uppercase border border-white/30 rounded-full">
              Limited Time Offer
            </span>

            <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
              ⚡ 2-Day Flash Sale
            </h2>

            <p className="text-gray-400 mb-10">
              Hurry up! Sale ends soon. Don’t miss massive discounts.
            </p>

            <div className="flex justify-center gap-4 md:gap-8">
              <TimeBox label="Days" value={time.days} />
              <TimeBox label="Hours" value={time.hours} />
              <TimeBox label="Minutes" value={time.minutes} />
              <TimeBox label="Seconds" value={time.seconds} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TimeBox = ({ label, value }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white text-black w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-xl text-2xl md:text-3xl font-bold transition-all duration-500 ease-out hover:scale-110">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-2 text-xs uppercase tracking-wide text-gray-400">
        {label}
      </span>
    </div>
  );
};

export default SaleCounter;
