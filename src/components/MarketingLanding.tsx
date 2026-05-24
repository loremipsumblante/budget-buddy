import { Link } from "@tanstack/react-router";
import { Wallet, Cloud, PiggyBank, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Cloud,
    title: "Track anywhere. Sync everywhere.",
    body: "Sign in once and your budgets follow you to every device.",
  },
  {
    icon: PiggyBank,
    title: "Know what you have left",
    body: "Daily allowance, category limits, and savings goals at a glance.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Your data is tied to your account — only you can see it.",
  },
];

export function MarketingLanding() {
  return (
    <div className="space-y-10 py-6">
      <section className="text-center space-y-4">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Wallet className="h-6 w-6" />
        </span>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Track anywhere. Sync everywhere.
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Pocket helps you set a budget, log expenses in seconds, and actually hit your savings
          goal — saved to your account so you never lose it.
        </p>
        <div className="flex justify-center gap-2 pt-2">
          <Button asChild>
            <Link to="/login">Get started</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="shadow-[var(--shadow-card)]">
            <CardContent className="p-5 space-y-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
