import { Link } from "@tanstack/react-router";
import { Wallet, ListPlus, BarChart3, Receipt } from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: Wallet, exact: true },
  { to: "/expenses", label: "Expenses", icon: Receipt, exact: false },
  { to: "/insights", label: "Insights", icon: BarChart3, exact: false },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="h-4 w-4" />
          </span>
          <span>Pocket</span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          {links.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <Link
          to="/budget/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <ListPlus className="h-4 w-4" /> New budget
        </Link>
      </div>
      <nav className="flex items-center justify-around border-t border-border bg-background/95 px-2 py-1.5 sm:hidden">
        {links.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact }}
            activeProps={{ className: "text-primary" }}
            className="flex flex-col items-center gap-0.5 rounded-md px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
