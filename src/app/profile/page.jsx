import { redirect } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import ProfilePage from "@/components/ProfilePage";
import { createClient } from "@/lib/supabase/server";

export default async function ProfileRoute({ searchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/auth?next=%2Fprofile");
  }

  const user = authData.user;
  const [{ data: profile, error: profileError }, { data: addresses, error: addressesError }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
  const initialError = profileError?.message ?? addressesError?.message ?? null;

  return (
    <AppLayout>
      <ProfilePage
        initialAddresses={addresses ?? []}
        initialEditProfile={params.edit === "true"}
        initialError={initialError}
        initialProfile={{
          avatar_path: profile?.avatar_path ?? null,
          date_of_birth: profile?.date_of_birth ?? "",
          full_name:
            profile?.full_name ?? user.user_metadata?.full_name ?? "",
          phone: profile?.phone ?? "",
        }}
        user={{ email: user.email ?? "", id: user.id }}
      />
    </AppLayout>
  );
}
