import React from "react";
import ProductClient from "./ProductClient";

// Use ISR with revalidation
export const revalidate = 60; // Revalidate every 60 seconds

const shopId =
  process.env.NEXT_PUBLIC_SHOP_ID || "9f75b2e1-c16b-4e37-9744-de0ce877f40a";

async function getProduct(slug) {
  try {
    const apiUrl = process.env.BE_URL || process.env.NEXT_PUBLIC_BE_URL;

    const url = `${apiUrl}/get-product/${shopId}/${slug}?image_mode=detailed`;

    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; YourApp/1.0)",
      },
    });

    console.log("Fetch response status:", res.status);
    if (!res.ok) {
      console.error(
        `Failed to fetch product: ${res.status} ${res.statusText} for URL: ${url}`,
      );
      return null;
    }

    const data = await res.json();

    if (data.status === "success" && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Product not found
          </h2>
          <a
            href="/"
            className="text-purple-600 mt-4 inline-block hover:underline"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return <ProductClient product={product} />;
}

// Generate static params for common products (optional, improves performance)
export async function generateStaticParams() {
  // You can fetch popular products here to pre-render them
  // For now, return empty array to generate on-demand
  return [];
}
