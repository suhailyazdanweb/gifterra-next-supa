"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";

export default function NavBar() {
  const router = useRouter();
  const { cartCount } = useCart();
  const [userEmail, setUserEmail] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      setIsAdmin(session?.user?.app_metadata?.role === "admin");
      setIsAuthLoading(false);
      setAuthError("");
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    setAuthError("");
    const { error } = await createClient().auth.signOut();

    if (error) {
      setAuthError(error.message);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/Gifterra-logo-svg.svg"
            alt="Gifterra logo"
            className="h-12 w-auto"
            width={180}
            height={48}
          />
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
          <Link href="/products" className="rounded-full px-4 py-2 transition hover:bg-slate-100">
            Products
          </Link>
          <Link href="/orders" className="rounded-full px-4 py-2 transition hover:bg-slate-100">
            Orders
          </Link>
          {!isAuthLoading && isAdmin ? (
            <Link href="/admin" className="rounded-full px-4 py-2 transition hover:bg-slate-100">
              Admin
            </Link>
          ) : null}
          <Link
            href="/cart"
            className="relative inline-flex items-center rounded-full bg-cyan-600 px-4 py-2 text-white transition hover:bg-cyan-700"
          >
            Cart
            <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
              {cartCount}
            </span>
          </Link>
          {!isAuthLoading && userEmail ? (
            <>
              <span className="px-2 text-sm text-slate-600">{userEmail}</span>
              <button
                className="rounded-full px-4 py-2 transition hover:bg-slate-100"
                onClick={handleSignOut}
                type="button"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="rounded-full px-4 py-2 transition hover:bg-slate-100"
            >
              Sign in
            </Link>
          )}
        </nav>
        {authError ? (
          <p className="text-sm text-red-700" role="alert">
            Could not sign out: {authError}
          </p>
        ) : null}
      </div>
    </header>
  );
}
