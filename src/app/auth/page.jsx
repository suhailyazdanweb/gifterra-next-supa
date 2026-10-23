import AppLayout from "@/components/AppLayout";
import AuthForm from "./AuthForm";

export default async function AuthPage({ searchParams }) {
  const params = await searchParams;
  const requestedNext = params.next;
  const nextPath =
    typeof requestedNext === "string" &&
    (requestedNext.startsWith("/products") ||
      requestedNext.startsWith("/cart") ||
    requestedNext.startsWith("/orders") ||
    requestedNext.startsWith("/profile")) &&
    !requestedNext.startsWith("//")
      ? requestedNext
      : "/products";
  const initialMode = params.mode === "sign-up" ? "sign-up" : "sign-in";
  const initialError =
    params.error === "confirmation"
      ? "We couldn't verify that email link. Please request a new confirmation email and try again."
      : params.error === "session"
        ? "We couldn't verify your session. Please sign in again."
        : null;

  return (
    <AppLayout>
      <AuthForm
        initialError={initialError}
        initialMode={initialMode}
        nextPath={nextPath}
      />
    </AppLayout>
  );
}
