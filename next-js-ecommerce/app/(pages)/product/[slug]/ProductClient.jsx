"use client";
import React, { useState } from "react";
import WhatsAppButton from "@/components/WhatsappBtn";
import Toast from "@/components/Toast";
import {
  Clock,
  Smartphone,
  CheckCircle,
  ChevronLeft,
  Package,
  ShoppingCart,
} from "lucide-react";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { addToCart } from "@/lib/cartUtils";

const inter = Inter({ subsets: ["latin"] });

export default function ProductClient({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0
      ? product.variants[0]
      : null,
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setSelectedImage(0);
  };

  const handleAddToCart = () => {
    if (currentStock <= 0) return;

    const hasVariants = product.variants && product.variants.length > 0;

    if (hasVariants && selectedVariant) {
      // Add product with selected variant
      addToCart(product.id, selectedVariant.id, 1, {
        name: product.name,
        image: currentImages[0] || product.images?.[0],
        price: currentPrice,
        slug: product.slug,
        variantName: selectedVariant.name,
      });
    } else if (!hasVariants) {
      // Add simple product
      addToCart(product.id, null, 1, {
        name: product.name,
        image: product.images?.[0],
        price: currentPrice,
        slug: product.slug,
      });
    }

    // Show toast notification
    setShowToast(true);
  };

  const currentPrice = selectedVariant?.price || product?.price || "0.00";
  const currentStock = selectedVariant?.quantity || product?.quantity || 0;
  const currentImages = selectedVariant?.image
    ? [selectedVariant.image]
    : product?.images || [];

  const isDeal = product.discount !== null;

  return (
    <div
      className={`min-h-screen bg-gray-50 flex flex-col items-center py-4 sm:py-10 px-2 xs:px-4 sm:px-6 lg:px-8 ${inter.className}`}
    >
      {/* BACK BUTTON */}
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
          {/* LEFT: IMAGE SECTION */}
          <div className="lg:col-span-5 p-4 xs:p-8 sm:p-12 bg-white flex flex-col items-center justify-center relative min-h-75 xs:min-h-[400px] lg:min-h-full">
            {isDeal && (
              <div className="absolute top-4 left-4 xs:top-6 xs:left-6 bg-linear-to-r from-[#2C0741] to-[#6348A6] text-white text-[10px] xs:text-xs font-bold px-3 py-1.5 xs:px-4 xs:py-2 rounded-full shadow-lg flex items-center gap-2 z-10">
                <Clock size={14} className="animate-pulse" />
                SPECIAL OFFER
              </div>
            )}

            {/* Main Image */}
            <div className="relative w-full h-auto max-w-62.5 xs:max-w-[320px] lg:max-w-full">
              <Image
                src={currentImages[selectedImage] || "/placeholder.png"}
                alt={product.name}
                width={500}
                height={500}
                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Image Thumbnails */}
            {currentImages.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {currentImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 xs:w-20 xs:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-purple-600 scale-105"
                        : "border-gray-200 hover:border-purple-400"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS SECTION */}
          <div className="lg:col-span-7 p-5 xs:p-8 sm:p-10 md:p-14 bg-linear-to-br from-[#2C0741] via-[#4B2050] to-[#171127] text-white flex flex-col justify-center">
            {/* BRAND & NAME */}
            <div className="mb-4 xs:mb-6">
              <span className="text-purple-400 font-bold uppercase tracking-widest text-[10px] xs:text-xs lg:text-sm">
                {product.prod_categories_names?.[0] || "Product"}
              </span>
              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl 2xl:text-5xl font-extrabold mt-1 xs:mt-2 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* VARIANTS SECTION */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-purple-300 font-bold text-xs xs:text-sm lg:text-base mb-3">
                  Select Variant
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantSelect(variant)}
                      className={`px-4 py-2 rounded-lg text-xs xs:text-sm font-medium transition-all ${
                        selectedVariant?.id === variant.id
                          ? "bg-purple-600 text-white shadow-lg scale-105"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
                {selectedVariant && (
                  <p className="text-xs text-gray-400 mt-2">
                    SKU: {selectedVariant.sku}
                  </p>
                )}
              </div>
            )}

            {/* PRICING BLOCK */}
            <div className="flex flex-wrap items-end gap-3 xs:gap-5 mb-6 xs:mb-8">
              <div className="flex flex-col">
                <span className="text-gray-400 text-[10px] xs:text-xs uppercase font-bold tracking-tighter">
                  Current Price
                </span>
                <span className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-white leading-none">
                  {product.currency_icon} {currentPrice}
                </span>
              </div>

              {isDeal && product.discount && (
                <div className="flex flex-col pb-0.5 opacity-60">
                  <span className="text-gray-400 text-[9px] xs:text-[10px] uppercase font-bold">
                    {product.discount}% OFF
                  </span>
                  <span className="text-sm xs:text-base sm:text-xl font-bold line-through decoration-red-500 decoration-2">
                    {product.currency_icon}{" "}
                    {(
                      parseFloat(currentPrice) /
                      (1 - parseFloat(product.discount) / 100)
                    ).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* CONTENT AREA */}
            <div className="space-y-5 xs:space-y-8 mb-8 xs:mb-10">
              {/* Tags/Features */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-purple-300 font-bold text-xs xs:text-sm lg:text-base mb-3">
                    <Smartphone size={16} /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5 xs:gap-2">
                    {product.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-white/10 border border-white/10 px-2.5 py-1 xs:px-3 xs:py-1.5 rounded-lg text-[10px] xs:text-xs sm:text-sm whitespace-nowrap"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-purple-300 font-bold text-xs xs:text-sm lg:text-base mb-2">
                  Description
                </h3>
                <p className="text-gray-300 leading-relaxed text-xs xs:text-sm sm:text-base 2xl:text-lg max-w-2xl">
                  {product.description ||
                    "Premium high-performance product with cutting-edge technology and sleek design."}
                </p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 font-bold text-xs xs:text-sm sm:text-base">
                {currentStock > 0 ? (
                  <>
                    <CheckCircle
                      size={16}
                      className="xs:w-5 xs:h-5 text-emerald-400"
                    />
                    <span className="text-emerald-400">
                      Ready in Stock ({currentStock} available)
                    </span>
                  </>
                ) : (
                  <>
                    <Package size={16} className="xs:w-5 xs:h-5 text-red-400" />
                    <span className="text-red-400">Currently Out of Stock</span>
                  </>
                )}
              </div>

              {/* Weight */}
              {product.weight_in_g && (
                <div className="text-xs text-gray-400">
                  Weight: {product.weight_in_g} {product.unit}
                </div>
              )}
            </div>

            {/* ACTION SECTION */}
            <div className="mt-auto w-full space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`w-full py-3 xs:py-4 rounded-lg font-bold text-sm xs:text-base transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${
                  currentStock > 0
                    ? "bg-white text-[#822A63] hover:shadow-xl"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                <ShoppingCart size={20} className="xs:w-6 xs:h-6" />
                {currentStock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
              <div className="transform active:scale-95 transition-transform duration-200">
                <WhatsAppButton
                  name={
                    selectedVariant
                      ? `${product.name} - ${selectedVariant.name}`
                      : product.name
                  }
                  price={currentPrice}
                />
              </div>
              <p className="text-center text-gray-400 text-[8px] xs:text-[10px] mt-4 uppercase tracking-[0.2em] opacity-80">
                Inquiry Response time: Under 5 mins
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={
            selectedVariant
              ? `${product.name} - ${selectedVariant.name}`
              : product.name
          }
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
