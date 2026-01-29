"use client";
import React, { useState, useEffect, Suspense } from "react";
import MobileCard from "@/components/MobileCard";
import { Inter } from "next/font/google";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 h-80 w-full rounded-xl mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

function AllProductsContent() {
  const shopId = process.env.NEXT_PUBLIC_SHOP_ID;
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(12);

  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [tempSearchQuery, setTempSearchQuery] = useState("");

  // Initialize search from URL params
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearchQuery(urlSearch);
      setTempSearchQuery(urlSearch);
    }
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BE_URL}/get-all-product-categories/${shopId}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data.status === "success" && data.data) {
            setCategories(data.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, [shopId]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Build query params
        const params = new URLSearchParams({
          page: currentPage.toString(),
          per_page: perPage.toString(),
          sort_by: sortBy,
          sort_direction: sortDirection,
        });

        if (searchQuery) params.append("search", searchQuery);
        if (minPrice) params.append("min_price", minPrice);
        if (maxPrice) params.append("max_price", maxPrice);

        // Add selected categories
        selectedCategories.forEach((cat) => {
          params.append("category[]", cat);
        });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BE_URL}/get-all-products/${shopId}?${params}`,
        );

        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json();

        if (data.status === "success" && data.data?.data) {
          // Transform products to match MobileCard format
          const transformedProducts = data.data.data.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            price:
              item.price === "0.00" && item.variants?.length > 0
                ? item.variants[0].price
                : item.price || "0.00",
            image: item.images?.[0] || "/placeholder.png",
            brand: item.prod_categories_names?.[0] || "Electronics",
            category: item.tags?.[0] || "product",
            stock: item.quantity || 0,
            oldPrice: item.discount
              ? (
                  parseFloat(item.price) /
                  (1 - parseFloat(item.discount) / 100)
                ).toFixed(2)
              : null,
            hasVariants: item.variants && item.variants.length > 0,
          }));

          setProducts(transformedProducts);
          setTotalPages(data.data.meta?.last_page || 1);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    shopId,
    currentPage,
    perPage,
    searchQuery,
    selectedCategories,
    minPrice,
    maxPrice,
    sortBy,
    sortDirection,
  ]);

  const handleCategoryToggle = (categoryName) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName],
    );
    setCurrentPage(1); // Reset to first page
  };

  const handleSearch = () => {
    setSearchQuery(tempSearchQuery);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setTempSearchQuery("");
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
      {/* HEADER */}
      <div className="bg-linear-to-r from-[#2C0741] via-[#4B2050] to-[#6348A6] text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-purple-200 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft size={18} /> Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            All Products
          </h1>
          <p className="text-purple-200 text-sm sm:text-base">
            Browse our complete collection of{" "}
            {products.length > 0 ? `${products.length}+` : ""} premium products
          </p>
        </div>
      </div>

      {/* SEARCH BAR - Mobile/Desktop */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={tempSearchQuery}
                onChange={(e) => setTempSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-4 py-3 pl-11 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-linear-to-r from-[#2C0741] to-[#6348A6] text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Search
            </button>

            {/* Filter Toggle - Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* SIDEBAR FILTERS */}
          <aside
            className={`
            ${showFilters ? "fixed inset-0 z-50 bg-white" : "hidden"}
            lg:block lg:sticky lg:top-24 lg:w-72 lg:h-fit
            overflow-y-auto
          `}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              {/* Mobile Close Button */}
              <div className="lg:hidden flex justify-between items-center mb-4 pb-4 border-b">
                <h2 className="text-xl font-bold">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Filter Header - Desktop */}
              <div className="hidden lg:flex justify-between items-center pb-4 border-b">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <SlidersHorizontal size={20} />
                  Filters
                </h2>
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-bold mb-3 text-gray-800">Categories</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.name)}
                        onChange={() => handleCategoryToggle(category.name)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-bold mb-3 text-gray-800">Price Range</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Min Price
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Max Price
                    </label>
                    <input
                      type="number"
                      placeholder="100000"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-bold mb-3 text-gray-800">Sort By</h3>
                <select
                  value={`${sortBy}-${sortDirection}`}
                  onChange={(e) => {
                    const [newSortBy, newDirection] = e.target.value.split("-");
                    setSortBy(newSortBy);
                    setSortDirection(newDirection);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                </select>
              </div>

              {/* Apply Filters - Mobile */}
              <div className="lg:hidden pt-4 border-t">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full py-3 bg-linear-to-r from-[#2C0741] to-[#6348A6] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </aside>

          {/* PRODUCTS GRID */}
          <main className="flex-1">
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    Showing page {currentPage} of {totalPages}
                  </>
                )}
              </p>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
              >
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={48}>48 per page</option>
              </select>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                Error: {error}
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {loading
                ? Array.from({ length: perPage }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                : products.map((product) => (
                    <MobileCard key={product.id} mobile={product} />
                  ))}
            </div>

            {/* Empty State */}
            {!loading && products.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg mb-4">No products found</p>
                <button
                  onClick={handleClearFilters}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* PAGINATION */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, idx) =>
                  page === "..." ? (
                    <span key={idx} className="px-3 py-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? "bg-linear-to-r from-[#2C0741] to-[#6348A6] text-white shadow-lg"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AllProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <AllProductsContent />
    </Suspense>
  );
}
