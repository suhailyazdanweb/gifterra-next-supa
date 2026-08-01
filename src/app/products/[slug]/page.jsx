import { notFound } from "next/navigation";
import { products } from "@/data/products";
import AppLayout from "@/components/AppLayout";
import ProductDetailPage from "./ProductDetailPage";

export default function ProductDetailRoute({ params }) {
  const product = products.find((item) => item.id === params.slug);

  if (!product) {
    notFound();
  }

  return (
    <AppLayout>
      <ProductDetailPage product={product} />
    </AppLayout>
  );
}
