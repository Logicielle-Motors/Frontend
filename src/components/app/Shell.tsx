import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, LayoutDashboard, ShoppingCart, Package, ClipboardCheck, Truck, History, BarChart3, Wallet, Settings, LogOut, Menu, Bike, Moon, Sun } from "lucide-react";
import { actions, auth, useDB } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", fr: "Tableau de bord", mg: "Tabilao", icon: LayoutDashboard },
  { to: "/pos", fr: "Point de vente (POS)", mg: "Fivarotana (POS)", icon: ShoppingCart },
  { to: "/stock", fr: "Gestion du stock", mg: "Fitantanana tahiry", icon: Package },
  { to: "/inventaire", fr: "Inventaire", mg: "Fanisana entana", icon: ClipboardCheck },
  { to: "/fournisseurs", fr: "Fournisseurs", mg: "Mpamatsy", icon: Truck },
  { to: "/historique", fr: "Historique des ventes", mg: "Tantaran'ny varotra", icon: History },
  { to: "/rapports", fr: "Rapports financiers", mg: "Tatitra ara-bola", icon: BarChart3 },
  { to: "/depenses", fr: "Dépenses", mg: "Fandaniana", icon: Wallet },
  { to: "/parametres", fr: "Paramètres", mg: "Fikirana", icon: Settings },
] as const;

export function Shell() {
  const navigate = useNavigate();
  const { settings, products } = useDB();
  const [ok, setOk] = useState(false);
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const isMg = settings.language === "mg";
  const lowStock = products.filter((p) => p.qty <= p.minQty);
  useEffect(() => { if (!auth.isLogged()) navigate({ to: "/", replace: true }); else setOk(true); }, [navigate]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);
  const [time, setTime] = useState(() => new Intl.DateTimeFormat("fr-FR", { timeZone: "Indian/Antananarivo", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(new Date()));
  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Intl.DateTimeFormat("fr-FR", { timeZone: "Indian/Antananarivo", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(new Date())), 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (!ok) return null;
  return (
    <div className="flex min-h-screen">
      <aside className={cn("fixed inset-y-0 left-0 z-40 w-64 border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center gap-3 px-5 py-6">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Bike className="size-5" /></span>
          <div className="min-w-0"><p className="truncate font-semibold">{settings.shopName}</p><p className="text-xs text-muted-foreground">{isMg ? "Mpitantana · Mpandray vola" : "Admin · Caissier"}</p></div>
        </div>
        <nav className="space-y-1 px-3">
          {NAV.map(({ to, fr, mg, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-primary !text-primary-foreground shadow-sm" }}>
              <Icon className="size-4" />{isMg ? mg : fr}
            </Link>
          ))}
        </nav>
        <button onClick={() => { auth.logout(); navigate({ to: "/", replace: true }); }}
          className="absolute bottom-5 left-3 right-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-destructive/15 hover:text-destructive">
          <LogOut className="size-4" />{isMg ? "Hivoaka" : "Déconnexion"}
        </button>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-background/60 lg:hidden" onClick={() => setOpen(false)} />}
      <main className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-border bg-background px-4 py-3 md:px-8">
          <button onClick={() => setOpen(true)} aria-label={isMg ? "Sokafy ny sakafo" : "Ouvrir le menu"} className="lg:hidden"><Menu className="size-5" /></button>
          <span className="hidden font-medium lg:block">{settings.shopName}</span>
          <time className="absolute left-1/2 -translate-x-1/2 font-semibold tabular-nums text-sm sm:text-base">{time}</time>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <label className="sr-only" htmlFor="shell-language">{isMg ? "Fiteny" : "Langue"}</label>
            <select id="shell-language" className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={settings.language}
              onChange={(e) => actions.saveSettings({ language: e.target.value as "fr" | "mg" })}>
              <option value="fr">FR</option>
              <option value="mg">MG</option>
            </select>
            <button type="button" aria-label={settings.theme === "dark" ? (isMg ? "Alefaso ny mazava" : "Activer le mode clair") : (isMg ? "Alefaso ny alina" : "Activer le mode nuit")}
              title={settings.theme === "dark" ? (isMg ? "Mode mazava" : "Mode clair") : (isMg ? "Mode alina" : "Mode nuit")}
              onClick={() => actions.saveSettings({ theme: settings.theme === "dark" ? "light" : "dark" })}
              className="grid size-9 place-items-center rounded-md border border-border hover:bg-muted">
              {settings.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <div className="relative">
              <button type="button" aria-label={isMg ? "Fampandrenesana" : "Notifications"} aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((value) => !value)}
                className="relative grid size-9 place-items-center rounded-md border border-border hover:bg-muted">
                <Bell className="size-4" />
                {lowStock.length > 0 && <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] text-white">{lowStock.length}</span>}
              </button>
              {notificationsOpen && <div className="absolute right-0 top-11 z-30 w-72 rounded-lg border border-border bg-card p-3 shadow-lg">
                <h2 className="mb-2 text-sm font-semibold">{isMg ? "Fampandrenesana" : "Notifications"}</h2>
                {lowStock.length ? <ul className="max-h-64 space-y-2 overflow-auto text-sm">
                  {lowStock.map((product) => <li key={product.id} className="rounded-md bg-muted p-2">
                    <span className="font-medium">{isMg ? "Tahiry ambany" : "Stock bas"} : </span>{product.name}
                    <span className="block text-xs text-muted-foreground">{isMg ? "Sisa" : "Restant"} : {product.qty} / {product.minQty}</span>
                  </li>)}
                </ul> : <p className="text-sm text-muted-foreground">{isMg ? "Tsy misy fampandrenesana." : "Aucune notification."}</p>}
              </div>}
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-4 md:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
