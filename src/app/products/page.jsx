import AppLayout from "@/components/AppLayout";
import ProductPage from "./ProductPage";
import { mapProductRecord } from "@/lib/products";
import { createClient } from "@/lib/supabase/server";

export default async function ProductsRoute() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <AppLayout>
      <ProductPage
        products={(data ?? []).map(mapProductRecord)}
        loadError={error?.message ?? null}
      />
    </AppLayout>
  );
}
