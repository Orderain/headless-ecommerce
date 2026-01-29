"use client";
import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import {
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from "@/lib/cartUtils";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load cart items
    setCartItems(getCartItems());
    setLoading(false);

    // Listen for cart updates
    const handleCartUpdate = () => {
      setCartItems(getCartItems());
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const handleQuantityChange = (productId, variantId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItemQuantity(productId, variantId, newQuantity);
  };

  const handleRemoveItem = (productId, variantId) => {
    removeFromCart(productId, variantId);
  };

  const handleClearCart = () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      clearCart();
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.details?.price || 0);
      return total + price * item.unit_qty;
    }, 0);
  };

  const subtotal = calculateSubtotal();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
        {/* Header */}
        <div className="bg-linear-to-r from-[#2C0741] via-[#4B2050] to-[#6348A6] text-white py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm font-medium text-purple-200 hover:text-white transition-colors mb-4"
            >
              <ChevronLeft size={18} /> Back to Home
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
              Shopping Cart
            </h1>
          </div>
        </div>

        {/* Empty Cart */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <ShoppingBag size={80} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Add some products to get started!
          </p>
          <Link
            href="/all-mobiles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#2C0741] to-[#6348A6] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
      {/* Header */}
      <div className="bg-linear-to-r from-[#2C0741] via-[#4B2050] to-[#6348A6] text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-purple-200 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft size={18} /> Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            Shopping Cart
          </h1>
          <p className="text-purple-200 text-sm sm:text-base">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>
      </div>

      {/* Cart Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Cart Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Cart Items</h2>
                <button
                  onClick={handleClearCart}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear Cart
                </button>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div
                    key={`${item.product_id}-${item.variant_id || "simple"}`}
                    className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link
                        href={`/product/${item.details?.slug || item.product_id}`}
                        className="shrink-0"
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={item.details?.image || "/placeholder.png"}
                            alt={item.details?.name || "Product"}
                            width={96}
                            height={96}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.details?.slug || item.product_id}`}
                          className="block"
                        >
                          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 hover:text-purple-600 transition-colors">
                            {item.details?.name || "Product"}
                          </h3>
                        </Link>
                        {item.details?.variantName && (
                          <p className="text-xs text-gray-500 mb-2">
                            Variant: {item.details.variantName}
                          </p>
                        )}
                        <p className="text-lg font-bold text-purple-600">
                          Rs {parseFloat(item.details?.price || 0).toFixed(2)}
                        </p>

                        {/* Quantity Controls - Mobile */}
                        <div className="flex items-center gap-3 mt-3 sm:hidden">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.product_id,
                                  item.variant_id,
                                  item.unit_qty - 1
                                )
                              }
                              disabled={item.unit_qty <= 1}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-4 py-2 font-semibold text-sm">
                              {item.unit_qty}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.product_id,
                                  item.variant_id,
                                  item.unit_qty + 1
                                )
                              }
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveItem(item.product_id, item.variant_id)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Quantity Controls - Desktop */}
                      <div className="hidden sm:flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.product_id,
                                item.variant_id,
                                item.unit_qty - 1
                              )
                            }
                            disabled={item.unit_qty <= 1}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus size={18} />
                          </button>
                          <span className="px-6 py-2 font-semibold">
                            {item.unit_qty}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.product_id,
                                item.variant_id,
                                item.unit_qty + 1
                              )
                            }
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            handleRemoveItem(item.product_id, item.variant_id)
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {/* Item Total - Desktop */}
                      <div className="hidden sm:block text-right">
                        <p className="text-sm text-gray-500 mb-1">Total</p>
                        <p className="text-lg font-bold text-gray-800">
                          Rs{" "}
                          {(
                            parseFloat(item.details?.price || 0) * item.unit_qty
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Item Total - Mobile */}
                    <div className="sm:hidden mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                      <p className="text-sm text-gray-500">Item Total:</p>
                      <p className="text-lg font-bold text-gray-800">
                        Rs{" "}
                        {(
                          parseFloat(item.details?.price || 0) * item.unit_qty
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    Rs {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax & Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Estimated Total</span>
                  <span className="text-purple-600">
                    Rs {subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full py-3 bg-linear-to-r from-[#2C0741] to-[#6348A6] text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight size={20} />
              </button>

              <Link
                href="/all-mobiles"
                className="block text-center mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
