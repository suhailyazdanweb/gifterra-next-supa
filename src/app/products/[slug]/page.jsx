import { notFound } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import ProductDetailPage from "./ProductDetailPage";
import { mapProductRecord } from "@/lib/products";
import { createClient } from "@/lib/supabase/server";

export default async function ProductDetailRoute({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!error && !data) {
    notFound();
  }

  return (
    <AppLayout>
      {error ? (
        <p className="rounded-2xl bg-red-50 p-5 text-sm text-red-700" role="alert">
          Product could not be loaded: {error.message}
        </p>
      ) : (
        <ProductDetailPage product={mapProductRecord(data)} />
      )}
    </AppLayout>
  );
}
