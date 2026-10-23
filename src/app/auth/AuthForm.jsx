"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm({ initialError, initialMode, nextPath }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState(
    initialError
      ? { type: "error", message: initialError }
      : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback(null);

    if (mode === "sign-up") {
      if (!fullName.trim()) {
        setFeedback({ type: "error", message: "Enter your full name." });
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setFeedback({ type: "error", message: "Enter a valid email address." });
        return;
      }

      if (password.length < 8) {
        setFeedback({
          type: "error",
          message: "Choose a password with at least 8 characters.",
        });
        return;
      }

      if (password !== confirmPassword) {
        setFeedback({ type: "error", message: "Your passwords do not match." });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      if (mode === "sign-up") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setFeedback({ type: "error", message: error.message });
        } else if (data.session) {
          router.replace(nextPath);
          router.refresh();
        } else {
          setFeedback({
            type: "success",
            message: "Check your email for a confirmation link to finish creating your account.",
          });
          setMode("sign-in");
          setPassword("");
          setConfirmPassword("");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setFeedback({ type: "error", message: error.message });
        } else {
          router.replace(nextPath);
          router.refresh();
        }
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Authentication could not be completed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSignUp = mode === "sign-up";
  const nextParam =
    nextPath !== "/products" ? `next=${encodeURIComponent(nextPath)}` : "";
  const authSwitchHref = isSignUp
    ? `/auth${nextParam ? `?${nextParam}` : ""}`
    : `/auth?mode=sign-up${nextParam ? `&${nextParam}` : ""}`;

  return (
    <section className="mx-auto max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
        Your Gifterra account
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-950">
        {isSignUp ? "Create an account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        {isSignUp
          ? "Create an account to make every gift more personal."
          : "Sign in to your account with your email and password."}
      </p>

      <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
        {isSignUp ? (
          <div>
            <label
              htmlFor="full-name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Full name
            </label>
            <input
              autoComplete="name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              id="full-name"
              maxLength={120}
              onChange={(event) => setFullName(event.target.value)}
              required
              type="text"
              value={fullName}
            />
          </div>
        ) : null}

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email address
          </label>
          <input
            autoComplete="email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <input
            autoComplete={isSignUp ? "new-password" : "current-password"}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            id="password"
            minLength={isSignUp ? 8 : undefined}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          {isSignUp ? (
              <p className="mt-2 text-xs text-slate-500">Use at least 8 characters.</p>
            ) : null}
          </div>

          {isSignUp ? (
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>
              <input
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                id="confirm-password"
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                type="password"
                value={confirmPassword}
              />
            </div>
          ) : null}

        {feedback ? (
          <p
            aria-live="polite"
            className={`rounded-xl px-4 py-3 text-sm ${
              feedback.type === "error"
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-800"
            }`}
            role={feedback.type === "error" ? "alert" : "status"}
          >
            {feedback.message}
          </p>
        ) : null}

        <button
          className="w-full rounded-full bg-cyan-600 px-5 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting
            ? "Please wait..."
            : isSignUp
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {isSignUp ? "Already have an account?" : "New to Gifterra?"}{" "}
        <Link
          className="font-semibold text-cyan-700 hover:text-cyan-800"
          href={authSwitchHref}
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </section>
  );
}
