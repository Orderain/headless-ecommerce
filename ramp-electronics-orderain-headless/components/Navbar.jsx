"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  ShoppingCart,
  Search,
  User,
  Heart,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Inter } from "next/font/google";
import { getCartItemCount } from "@/lib/cartUtils";

const inter = Inter({ subsets: ["latin"] });

const Navbar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  const shopId = process.env.NEXT_PUBLIC_SHOP_ID;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize cart count and listen for updates
  useEffect(() => {
    // Update cart count on mount
    setCartCount(getCartItemCount());

    // Listen for cart updates
    const handleCartUpdate = () => {
      setCartCount(getCartItemCount());
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        // Only close if not clicking on the mega menu
        const megaMenu = document.getElementById("search-mega-menu");
        if (megaMenu && !megaMenu.contains(e.target)) {
          setShowSearchResults(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search function
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(async () => {
      try {
        setIsSearching(true);

        const params = new URLSearchParams({
          page: "1",
          per_page: "8",
          search: searchQuery,
          sort_by: "name",
          sort_direction: "asc",
        });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BE_URL}/get-all-products/${shopId}?${params}`,
        );

        if (res.ok) {
          const data = await res.json();
          if (data.status === "success" && data.data?.data) {
            const transformedResults = data.data.data.map((item) => ({
              id: item.id,
              name: item.name,
              slug: item.slug,
              price:
                item.price === "0.00" && item.variants?.length > 0
                  ? item.variants[0].price
                  : item.price || "0.00",
              image: item.images?.[0] || "/placeholder.png",
              brand: item.prod_categories_names?.[0] || "Electronics",
            }));
            setSearchResults(transformedResults);
            setShowSearchResults(true);
          }
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce delay

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, shopId]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop All", href: "/all-mobiles" },
    { name: "Deals", href: "/deals" },
  ];

  return (
    <>
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-md py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Left: Mobile Menu & Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 -ml-2 md:hidden text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Menu size={24} />
              </button>

              <Link href="/" className="flex items-center">
                <img
                  src="/logo/ramp-loog.png"
                  alt="Store Logo"
                  className="h-8 w-auto xs:h-10 md:h-11 object-contain"
                />
              </Link>
            </div>

            {/* Middle: Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm lg:text-base font-semibold text-gray-600 hover:text-[#822A63] transition-colors group ${inter.className}`}
                >
                  {link.name}
                  <span className="absolute inset-x-4 bottom-1 h-0.5 bg-[#822A63] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                </Link>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 xs:gap-2">
              {/* Mega Search with Debouncing */}
              <div
                ref={searchRef}
                className="hidden sm:flex items-center relative group"
              >
                <Search
                  className="absolute left-3 text-gray-400 group-focus-within:text-[#822A63] transition-colors z-10"
                  size={18}
                />
                {isSearching && (
                  <Loader2
                    className="absolute right-3 text-[#822A63] animate-spin z-10"
                    size={18}
                  />
                )}
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() =>
                    searchResults.length > 0 && setShowSearchResults(true)
                  }
                  className="pl-9 pr-10 py-2 bg-gray-100/80 border-transparent focus:border-[#822A63]/30 focus:bg-white rounded-full text-sm focus:outline-none focus:ring-4 focus:ring-[#822A63]/5 w-32 lg:w-64 transition-all"
                />
              </div>

              <button className="p-2 text-gray-700 hover:text-[#822A63] hover:bg-[#822A63]/5 rounded-full transition-all hidden xs:flex">
                <Heart size={22} />
              </button>
              <button className="p-2 text-gray-700 hover:text-[#822A63] hover:bg-[#822A63]/5 rounded-full transition-all">
                <User size={22} />
              </button>
              <Link href="/cart" className="p-2 text-gray-700 hover:text-[#822A63] hover:bg-[#822A63]/5 rounded-full transition-all relative">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#822A63] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Results Mega Menu */}
      {showSearchResults && searchResults.length > 0 && (
        <div
          id="search-mega-menu"
          className="fixed left-0 right-0 top-[72px] bg-white shadow-2xl border-b border-gray-200 z-50 max-h-[80vh] overflow-y-auto"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-semibold text-gray-600 uppercase">
                Search Results ({searchResults.length})
              </p>
              <button
                onClick={() => setShowSearchResults(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    setShowSearchResults(false);
                    router.push(`/product/${product.slug}`);
                  }}
                  className="flex flex-col bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all group overflow-hidden cursor-pointer"
                >
                  <div className="relative w-full h-32 bg-gray-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 flex-1">
                    <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 group-hover:text-[#822A63] transition-colors mb-1">
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-gray-500 mb-1">
                      {product.brand}
                    </p>
                    <p className="text-sm font-bold text-[#822A63]">
                      ₹{parseFloat(product.price).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowSearchResults(false);
                  router.push(
                    `/all-mobiles?search=${encodeURIComponent(searchQuery)}`,
                  );
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2C0741] to-[#6348A6] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                View All Results <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Results Mega Menu */}
      {showSearchResults &&
        searchResults.length === 0 &&
        !isSearching &&
        searchQuery.length >= 2 && (
          <div className="fixed left-0 right-0 top-[72px] bg-white shadow-2xl border-b border-gray-200 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
              <button
                onClick={() => setShowSearchResults(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <p className="text-gray-500 text-lg">
                No products found for "{searchQuery}"
              </p>
            </div>
          </div>
        )}

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-60 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[80%] max-w-xs z-70 bg-white shadow-2xl transform transition-transform duration-500 ease-in-out md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full font-sans">
          {/* Mobile Header */}
          <div className="p-5 flex justify-between items-center border-gray-200 border-b">
            <Link href="/" className="flex items-center">
              <img
                src="/logo/brand.png"
                alt="Store Logo"
                className="h-8 w-auto xs:h-10 md:h-11 object-contain"
              />
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="group flex items-center justify-between p-4 rounded-xl transition-all hover:bg-[#822A63]/5"
              >
                <span
                  className={`text-sm xs:text-lg font-medium text-gray-700 group-hover:text-[#822A63] transition-colors ${inter.className}`}
                >
                  {link.name}
                </span>
                <ArrowRight
                  size={18}
                  className="text-[#822A63] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                />
              </Link>
            ))}
          </nav>

          {/* Mobile Footer */}
          <div className={`p-6 bg-gray-50 ${inter.className}`}>
            <div className="space-y-3">
              <Link
                href="/account"
                className="flex items-center gap-3 p-3 bg-white border-b border-gray-200"
              >
                <div className="p-2 bg-[#822A63]/10 text-[#822A63] rounded-lg">
                  <User size={18} />
                </div>
                <span className="text-sm xs:text-base font-medium text-gray-700">
                  Account
                </span>
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center gap-3 p-3 bg-white rounded-xl "
              >
                <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                  <Heart size={18} />
                </div>
                <span className="text-sm xs:text-base font-medium text-gray-700">
                  Wishlist
                </span>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
