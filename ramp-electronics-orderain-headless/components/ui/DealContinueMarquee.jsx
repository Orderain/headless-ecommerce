"use client";
import { Flame } from "lucide-react";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function DealContinueMarquee() {
  const text = " Deal Continue • Limited Time Offer • Best Prices • Shop Now ";

  return (
    <div className="relative w-full overflow-hidden py-1  bg-[#0f0a1f] border border-white/5">
      
      {/* Glow overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-purple-700/10 via-indigo-600/20 to-purple-700/10 blur-md pointer-events-none" />

      {/* Marquee Wrapper */}
    <Link href="/deals" className="block">
      <div className="marquee-container flex whitespace-nowrap">
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className={`marquee-content px-4 text-xs sm:text-lg md:text-lg font-semibold tracking-wide ${inter.className}
              bg-linear-to-r from-[#9f7aea] via-[#b794f4] to-[#805ad5]
              bg-clip-text text-transparent`}
          >
<span className="flex items-center gap-1 text-sm md:text-base lg:text-lg font-medium">
  {/* The icon now scales from 14px (w-3.5) on mobile to 18px (md:w-4.5) on desktop */}
  <Flame 
    className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" 
    color="red" 
    fill="red" 
  /> 
  {text}
</span>        </span>
        ))}
      </div>
    
    </Link>
    </div>
  );
}