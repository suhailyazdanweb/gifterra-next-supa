import { redirect } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { createClient } from "@/lib/supabase/server";
import AdminProducts from "./products/AdminProducts";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || data.user?.app_metadata?.role !== "admin") {
    redirect("/products");
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AppLayout>
      <AdminProducts
        initialProducts={products ?? []}
        initialError={productsError?.message ?? null}
      />
    </AppLayout>
  );
}
