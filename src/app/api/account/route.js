import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createSessionClient } from "@/lib/supabase/server";

export async function DELETE(request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return Response.json({ error: "This request could not be verified." }, { status: 403 });
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "A confirmation is required." }, { status: 415 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "A confirmation is required." }, { status: 400 });
  }
  if (body?.confirmation !== "DELETE") {
    return Response.json({ error: "Type DELETE to confirm account removal." }, { status: 400 });
  }

  const sessionClient = await createSessionClient();
  const { data, error: authError } = await sessionClient.auth.getUser();
  if (authError || !data.user) {
    return Response.json({ error: "Sign in again before deleting your account." }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    return Response.json(
      { error: "Account deletion is not configured. Contact the site administrator." },
      { status: 503 },
    );
  }

  const adminClient = createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: profile, error: profileError } = await sessionClient
    .from("profiles")
    .select("avatar_path")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profileError) {
    return Response.json({ error: profileError.message }, { status: 500 });
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(data.user.id);
  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 });
  }

  let cleanupWarning = null;
  if (profile?.avatar_path) {
    const { error: storageError } = await adminClient.storage
      .from("gifterra-avatars")
      .remove([profile.avatar_path]);
    if (storageError) {
      cleanupWarning = "The account was deleted, but its profile image could not be removed.";
    }
  }

  return Response.json({ success: true, warning: cleanupWarning });
}
