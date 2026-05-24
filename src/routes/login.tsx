import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/lib/auth";
import { Wallet } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Pocket" },
      { name: "description", content: "Sign in to sync your budgets across devices." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Wallet className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to Pocket</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to save your budgets to your account and sync across devices.
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
