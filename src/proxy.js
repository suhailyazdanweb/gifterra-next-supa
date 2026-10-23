import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname === "/auth";
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isProtectedRoute = pathname === "/cart" || pathname === "/orders";

  if (!isAuthPage && !isProtectedRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Supabase URL and publishable key must be configured.");
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });

        Object.entries(headers ?? {}).forEach(([name, value]) => {
          supabaseResponse.headers.set(name, value);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  function redirectWithSupabaseCookies(destination) {
    const redirectResponse = NextResponse.redirect(destination);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    for (const header of ["cache-control", "expires", "pragma"]) {
      const value = supabaseResponse.headers.get(header);
      if (value) {
        redirectResponse.headers.set(header, value);
      }
    }

    return redirectResponse;
  }

  if (!claims && (isProtectedRoute || isAdminRoute)) {
    const authUrl = new URL("/auth", request.url);
    if (error) {
      authUrl.searchParams.set("error", "session");
    }
    authUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return redirectWithSupabaseCookies(authUrl);
  }

  if (claims && isAdminRoute) {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || userData.user?.app_metadata?.role !== "admin") {
      return redirectWithSupabaseCookies(new URL("/products", request.url));
    }
  }

  if (claims && isAuthPage) {
    return redirectWithSupabaseCookies(new URL("/products", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/auth", "/auth/callback", "/cart", "/orders", "/admin/:path*"],
};
