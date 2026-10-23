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
  const [user, setUser] = useState(null);
  const [accountName, setAccountName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setAccountName(nextUser?.user_metadata?.full_name?.trim() ?? "");
      setIsAdmin(session?.user?.app_metadata?.role === "admin");
      setIsAuthLoading(false);
      setAuthError("");
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.id) return undefined;

    let isCurrent = true;
    createClient()
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error("Could not load the account name.", error);
          return;
        }

        if (isCurrent && data?.full_name?.trim()) {
          setAccountName(data.full_name.trim());
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [user]);

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
    <header className="relative z-50 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
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
          {!isAuthLoading && user ? (
            <div className="group relative">
              <button
                aria-label={`Account menu for ${accountName || "My account"}`}
                aria-haspopup="true"
                className="inline-flex max-w-64 items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-4 text-slate-800 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
                type="button"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-800">
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4.5 20a7.5 7.5 0 0 1 15 0"
                    />
                  </svg>
                </span>
                <span className="truncate">{accountName || "My account"}</span>
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:rotate-180 group-focus-within:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className="invisible absolute right-0 top-full z-50 w-56 translate-y-2 pt-2 opacity-0 transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
                  <Link
                    className="block rounded-xl px-4 py-2.5 text-sm text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-800 focus-visible:bg-cyan-50 focus-visible:outline-none"
                    href="/profile"
                  >
                    View profile
                  </Link>
                  <Link
                    className="block rounded-xl px-4 py-2.5 text-sm text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-800 focus-visible:bg-cyan-50 focus-visible:outline-none"
                    href="/profile?edit=true#personal-information"
                  >
                    Edit profile
                  </Link>
                  <Link
                    className="block rounded-xl px-4 py-2.5 text-sm text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-800 focus-visible:bg-cyan-50 focus-visible:outline-none"
                    href="/orders"
                  >
                    Your orders
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    className="block w-full rounded-xl bg-cyan-50 px-4 py-2.5 text-left text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 focus-visible:bg-cyan-100 focus-visible:outline-none"
                    onClick={handleSignOut}
                    type="button"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
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
