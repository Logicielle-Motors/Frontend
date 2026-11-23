import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, ShoppingCart, Package, ClipboardCheck, Truck, History, BarChart3, Wallet, Settings, LogOut, Menu, Bike } from "lucide-react";
import { auth, useDB } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pos", label: "Point de vente (POS)", icon: ShoppingCart },
  { to: "/stock", label: "Gestion du stock", icon: Package },
  { to: "/inventaire", label: "Inventaire", icon: ClipboardCheck },
  { to: "/fournisseurs", label: "Fournisseurs et appro.", icon: Truck },
  { to: "/ventes", label: "Historique des ventes", icon: History },
  { to: "/rapports", label: "Rapports financiers", icon: BarChart3 },
  { to: "/depenses", label: "Gestion des dépenses", icon: Wallet },
  { to: "/parametres", label: "Paramètres", icon: Settings },
] as const;

export function Shell() {
  const navigate = useNavigate();
  const { settings } = useDB();
  const [ok, setOk] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!auth.isLogged()) navigate({ to: "/", replace: true }); else setOk(true); }, [navigate]);
  if (!ok) return null;
  return (
    <div className="flex min-h-screen">
      <aside className={cn("fixed inset-y-0 left-0 z-40 w-64 border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center gap-3 px-5 py-6">
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-primary glow"><Bike className="size-5" /></span>
          <div className="min-w-0"><p className="truncate font-semibold">{settings.shopName}</p><p className="text-xs text-muted-foreground">Admin · Caissier</p></div>
        </div>
        <nav className="space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-gradient-primary !text-primary-foreground shadow-lg" }}>
              <Icon className="size-4" />{label}
            </Link>
          ))}
        </nav>
        <button onClick={() => { auth.logout(); navigate({ to: "/", replace: true }); }}
          className="absolute bottom-5 left-3 right-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-destructive/15 hover:text-destructive">
          <LogOut className="size-4" />Déconnexion
        </button>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-background/60 lg:hidden" onClick={() => setOpen(false)} />}
      <main className="flex-1 lg:pl-64">
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/70 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Menu"><Menu className="size-5" /></button><span className="font-medium">{settings.shopName}</span>
        </div>
        <div className="mx-auto max-w-7xl p-4 md:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
