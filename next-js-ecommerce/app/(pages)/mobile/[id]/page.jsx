import React from "react";
import WhatsAppButton from "@/components/WhatsappBtn";
import { Clock, Smartphone, CheckCircle, ChevronLeft } from "lucide-react";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

const ProductPage = async ({ params }) => {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/mobiles/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Product not found
          </h2>
          <Link
            href="/"
            className="text-purple-600 mt-4 inline-block hover:underline"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const mobile = await res.json();
  const isDeal = mobile.category === "deals";

  return (
    <div
      className={`min-h-screen bg-gray-50 flex flex-col items-center py-4 sm:py-10 px-2 xs:px-4 sm:px-6 lg:px-8 ${inter.className}`}
    >
      {/* BACK BUTTON - Better UX for mobile */}
      <div className="w-full max-w-6xl mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-purple-700 transition-colors"
        >
          <ChevronLeft size={18} /> Back to Shop
        </Link>
      </div>

      <div className="w-full max-w-6xl bg-white rounded-2xl xs:rounded-3xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:grid lg:grid-cols-12">
          {/* LEFT: IMAGE SECTION (Col-5 on Desktop) */}
          <div className="lg:col-span-5 p-4 xs:p-8 sm:p-12 bg-white flex items-center justify-center relative min-h-75 xs:min-h-[400px] lg:min-h-full">
            {isDeal && (
              <div className="absolute top-4 left-4 xs:top-6 xs:left-6 bg-linear-to-r from-[#2C0741] to-[#6348A6] text-white text-[10px] xs:text-xs font-bold px-3 py-1.5 xs:px-4 xs:py-2 rounded-full shadow-lg flex items-center gap-2 z-10">
                <Clock size={14} className="animate-pulse" />
                DEAL ENDS IN: {mobile.dealDuration}
              </div>
            )}
            <img
              src={mobile.image}
              alt={mobile.name}
              className="w-full h-auto max-w-62.5 xs:max-w-[320px] lg:max-w-full object-contain hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* RIGHT: DETAILS SECTION (Col-7 on Desktop) */}
          <div className="lg:col-span-7 p-5 xs:p-8 sm:p-10 md:p-14 bg-linear-to-br from-[#2C0741] via-[#4B2050] to-[#171127] text-white flex flex-col justify-center">
            {/* BRAND & NAME */}
            <div className="mb-4 xs:mb-6">
              <span className="text-purple-400 font-bold uppercase tracking-widest text-[10px] xs:text-xs lg:text-sm">
                {mobile.brand}
              </span>
              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl 2xl:text-5xl font-extrabold mt-1 xs:mt-2 leading-tight">
                {mobile.name}
              </h1>
            </div>

            {/* PRICING BLOCK - Responsive sizes */}
            <div className="flex flex-wrap items-end gap-3 xs:gap-5 mb-6 xs:mb-8">
              <div className="flex flex-col">
                <span className="text-gray-400 text-[10px] xs:text-xs uppercase font-bold tracking-tighter">
                  Current Price
                </span>
                <span className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-white leading-none">
                  Rs {mobile.price}
                </span>
              </div>

              {isDeal && mobile.oldPrice && (
                <div className="flex flex-col pb-0.5 opacity-60">
                  <span className="text-gray-400 text-[9px] xs:text-[10px] uppercase font-bold line-through">
                    Was
                  </span>
                  <span className="text-sm xs:text-base sm:text-xl font-bold line-through decoration-red-500 decoration-2">
                    Rs {mobile.oldPrice}
                  </span>
                </div>
              )}
            </div>

            {/* CONTENT AREA */}
            <div className="space-y-5 xs:space-y-8 mb-8 xs:mb-10">
              {/* Features Chips */}
              <div>
                <h3 className="flex items-center gap-2 text-purple-300 font-bold text-xs xs:text-sm lg:text-base mb-3">
                  <Smartphone size={16} /> Key Features
                </h3>
                <div className="flex flex-wrap gap-1.5 xs:gap-2">
                  {mobile.features?.map((f, i) => (
                    <span
                      key={i}
                      className="bg-white/10 border border-white/10 px-2.5 py-1 xs:px-3 xs:py-1.5 rounded-lg text-[10px] xs:text-xs sm:text-sm whitespace-nowrap"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-purple-300 font-bold text-xs xs:text-sm lg:text-base mb-2">
                  Description
                </h3>
                <p className="text-gray-300 leading-relaxed text-xs xs:text-sm sm:text-base 2xl:text-lg max-w-2xl">
                  {mobile.description ||
                    "Premium high-performance mobile device with cutting-edge technology and sleek design."}
                </p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs xs:text-sm sm:text-base">
                <CheckCircle size={16} className="xs:w-5 xs:h-5" />
                <span>
                  {mobile.stock > 0
                    ? `Ready in Stock (${mobile.stock})`
                    : "Currently Out of Stock"}
                </span>
              </div>
            </div>

            {/* ACTION SECTION */}
            <div className="mt-auto w-full">
              <div className="transform active:scale-95 transition-transform duration-200">
                <WhatsAppButton name={mobile.name} price={mobile.price} />
              </div>
              <p className="text-center text-gray-400 text-[8px] xs:text-[10px] mt-4 uppercase tracking-[0.2em] opacity-80">
                Inquiry Response time: Under 5 mins
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
