"use client";
import { useState } from "react";
import WhatsAppButton from "@/components/WhatsappBtn";
import Toast from "@/components/Toast";
import { Flame, Clock, ShoppingCart } from "lucide-react";
import { Inter } from 'next/font/google';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cartUtils";

const inter = Inter({ subsets: ['latin'] });

export default function MobileCard({ mobile }) {
  const router = useRouter();
  const inStock = mobile.stock > 0;
  const isDeal = mobile.category === "deals";
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has variants, redirect to detail page
    if (mobile.hasVariants) {
      router.push(mobile.slug ? `/product/${mobile.slug}` : `/mobile/${mobile.id}`);
    } else {
      // Add simple product to cart with details
      addToCart(mobile.id, null, 1, {
        name: mobile.name,
        image: mobile.image,
        price: mobile.price,
        slug: mobile.slug,
      });
      // Show toast notification
      setShowToast(true);
    }
  };

  return (
    <div className={`group relative flex flex-col h-full rounded-xl overflow-hidden border border-[#e5a8ec] ${inter.className}`}>
      
      {/* --- RESPONSIVE DEAL BADGE --- */}
      {isDeal && mobile.dealDuration && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-linear-to-r from-[#2C0741] to-[#6348A6] text-white 
            text-[8px] sm:text-[9px] px-3 sm:px-4 py-0.5 sm:py-1 
            rounded-b-lg shadow-md border-x border-b border-purple-400/30 flex items-center gap-1.5 whitespace-nowrap">
            <Clock size={10} className="text-purple-300 animate-pulse sm:w-2.75" />
            <span>DEAL ENDS IN: {mobile.dealDuration}</span>
          </div>
        </div>
      )}

      {/* 1. VISUAL ANCHOR (IMAGE) */}
      <div className="relative aspect-square sm:aspect-5/5 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent z-10 pointer-events-none" />
        
      <Link href={mobile.slug ? `/product/${mobile.slug}` : `/mobile/${mobile.id}`} className="block w-full h-full relative">
        <Image
        fill
          src={mobile.image}
          alt={mobile.name}
          className="w-full h-full object-contain p-4 sm:p-8 transition-transform duration-500 group-hover:scale-105"
        />

      </Link>

        {/* FLOATING CHIPS */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20">
          <span className="backdrop-blur-md bg-white/40 text-slate-900 text-[8px] sm:text-[10px] font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm border border-white/20 uppercase tracking-tighter flex items-center">
            <Flame fill="red" className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 mr-1" /> {mobile.category || "Hot Selling"}
          </span>
        </div>
      </div>

      {/* 2. PRODUCT INFO - Mobile: p-4 | Desktop: p-6 */}
      <div className="flex flex-col grow p-4 sm:p-6 bg-linear-to-br from-[#2C0741] via-[#4B2050] to-[#171127] text-white">

        <div className="space-y-0.5 sm:space-y-1 mb-1">
          <p className="text-purple-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest sm:tracking-[0.2em]">
            {mobile.brand}
          </p>
          <h2 className="text-white text-xs sm:text-sm font-normal leading-tight h-8 sm:h-10 line-clamp-2">
            {mobile.name}
          </h2>
        </div>

        {/* 3. DYNAMIC FOOTER */}
        <div className="mt-auto pt-2 border-t-[0.5px] border-slate-700 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
              Best Price
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-bold text-white">
                Rs {mobile.price}
              </span>
              
              {isDeal && mobile.oldPrice && (
                <span className="text-[10px] sm:text-[11px] text-slate-400 line-through decoration-red-500/50">
                  Rs {mobile.oldPrice}
                </span>
              )}
            </div>
          </div>

          <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border ${
            inStock 
              ? "border-emerald-500/20 bg-emerald-500/10" 
              : "bg-slate-800 border-slate-700"
          }`}>
            <span className={`text-[7px] sm:text-[8px] font-medium uppercase tracking-tight ${inStock ? "text-emerald-400" : "text-slate-500"}`}>
              {inStock ? "In Stock" : "Sold Out"}
            </span>
          </div>
        </div>

        {/* 4. BUTTON WITH HOVER EFFECT */}
        <div className="mt-3 sm:mt-4 space-y-2">
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`w-full py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${
              inStock
                ? "bg-linear-to-r from-[#822A63] to-[#6348A6] text-white hover:shadow-lg"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            <ShoppingCart size={16} className="sm:w-4.5 sm:h-4.5" />
            {mobile.hasVariants ? "Select Options" : "Add to Cart"}
          </button>
          <div className="transform transition-transform duration-300 group-hover:scale-[1.01]">
            <WhatsAppButton name={mobile.name} price={mobile.price} />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={mobile.name}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}