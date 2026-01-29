import TagProductsClient from "./TagProductsClient";

async function getTagProducts(shopId, tagId) {
  try {
    const apiUrl =
      process.env.BE_URL ||
      process.env.NEXT_PUBLIC_BE_URL ||
      "https://dev-api.orderain.com/api/v1/headless";

    const url = `${apiUrl}/get-shop-tag/${shopId}/${tagId}`;

    const res = await fetch(url, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds instead of no-store
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; YourApp/1.0)",
      },
    });

    if (!res.ok) {
      console.error(
        `Failed to fetch tag products: ${res.status} ${res.statusText}`,
      );
      return [];
    }

    const data = await res.json();

    if (data.status === "success" && data.data?.associated_items?.data) {
      // Transform API data to match MobileCard expected format
      const transformedProducts = data.data.associated_items.data.map(
        (item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          price:
            item.price === "0.00" && item.variants.length > 0
              ? item.variants[0].price
              : item.price || "Price not available",
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
        }),
      );

      return transformedProducts;
    }

    return [];
  } catch (error) {
    console.error("Error fetching tag products:", error);
    return [];
  }
}

export default async function TagProductsServer({
  tagId,
  shopId,
  title = "Tagged Products",
}) {
  const products = await getTagProducts(shopId, tagId);

  if (products.length === 0) {
    return null; // Don't render if no products
  }

  return <TagProductsClient products={products} title={title} />;
}
