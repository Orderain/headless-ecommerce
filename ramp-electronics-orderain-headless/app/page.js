import Hero from "@/components/Hero";
import DealContinueMarquee from "@/components/ui/DealContinueMarquee";
import TagProductsServer from "@/components/TagProductsServer";
import SaleCounter from "@/components/SaleCounter";

// Use ISR with revalidation instead of force-dynamic
export const revalidate = 60; // Revalidate every 60 seconds

export default function HomePage() {
  return (
    <>
      <DealContinueMarquee />
      <Hero />
      <SaleCounter />
      <TagProductsServer
        tagId={60}
        shopId={process.env.NEXT_PUBLIC_SHOP_ID}
        title="Hot Deals"
      />
      <TagProductsServer
        tagId={57}
        shopId={process.env.NEXT_PUBLIC_SHOP_ID}
        title="Featured Products"
      />
    </>
  );
}
