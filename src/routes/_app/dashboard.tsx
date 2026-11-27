import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, ShoppingBag, Coins, PiggyBank, Receipt, Wallet, Boxes, Package, AlertTriangle, RefreshCw, Hash, Layers } from "lucide-react";
import { computeStats, useDB } from "@/lib/store";
import { ar, endOfDay, startOfDay, tx } from "@/lib/format";
import { PageHeader, Panel, Stat } from "@/components/app/kit";

export const Route = createFileRoute("/_app/dashboard")({ head: () => ({ meta: [{ title: "Logicielle Motors" }] }), component: Dashboard });

export const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10 }, formatter: (v: number) => ar(v) };

function Dashboard() {
  const d = useDB();
  const language = d.settings.language;
  const msg = (fr: string, mg: string) => tx(language, fr, mg);
  const all = computeStats(d, new Date(0), new Date(8.64e15));
  const today = computeStats(d, startOfDay(), endOfDay());
  const stockValue = d.products.reduce((s, p) => s + p.qty * p.buyPrice, 0);
  const out = d.products.filter((p) => p.qty <= 0);
  const low = d.products.filter((p) => p.qty > 0 && p.qty <= p.minQty);
  const salesLabel = msg("Ventes", "Varotra");
  const profitLabel = msg("Bénéfice", "Tombom-barotra");
  const expensesLabel = msg("Dépenses", "Fandaniana");
  const series = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const day = new Date(); day.setDate(day.getDate() - (13 - i));
    const s = computeStats(d, startOfDay(day), endOfDay(day));
    return {
      jour: day.toLocaleDateString(language === "mg" ? "mg-MG" : "fr-FR", { day: "2-digit", month: "2-digit" }),
      [salesLabel]: s.revenue,
      [profitLabel]: s.net,
      [expensesLabel]: s.expenses,
    };
  }), [d, language, salesLabel, profitLabel, expensesLabel]);
  return (
    <>
      <PageHeader title={msg("Tableau de bord", "Tabilao ankapobeny")} subtitle={msg("Vue d'ensemble de votre magasin en temps réel", "Topimaso momba ny fivarotanao amin'izao fotoana izao")} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        <Stat label={msg("Chiffre d'affaires total", "Fitambaran'ny vola azo tamin'ny varotra")} value={ar(all.revenue)} icon={<TrendingUp className="size-4" />} />
        <Stat label={msg("Ventes du jour", "Varotra androany")} value={ar(today.revenue)} icon={<ShoppingBag className="size-4" />} tone="accent" hint={`${today.sales} ${msg("vente(s)", "varotra")}`} />
        <Stat label={msg("Bénéfice brut", "Tombom-barotra alohan'ny fandaniana")} value={ar(all.gross)} icon={<Coins className="size-4" />} tone="success" />
        <Stat label={msg("Bénéfice net", "Tombom-barotra madio")} value={ar(all.net)} icon={<PiggyBank className="size-4" />} tone={all.net >= 0 ? "success" : "destructive"} />
        <Stat label={msg("Dépenses du jour", "Fandaniana androany")} value={ar(today.expenses)} icon={<Receipt className="size-4" />} tone="warning" />
        <Stat label={msg("Total des dépenses", "Fitambaran'ny fandaniana")} value={ar(all.expenses)} icon={<Wallet className="size-4" />} tone="warning" />
        <Stat label={msg("Valeur du stock", "Sandan'ny tahiry")} value={ar(stockValue)} icon={<Boxes className="size-4" />} hint={msg("au prix d'achat", "araka ny vidin'ny fividianana")} />
        <Stat label={msg("Produits en stock", "Entana mbola misy tahiry")} value={String(d.products.filter((p) => p.qty > 0).length)} icon={<Package className="size-4" />} tone="accent" />
        <Stat label={msg("En rupture", "Lany tahiry")} value={String(out.length)} icon={<AlertTriangle className="size-4" />} tone="destructive" />
        <Stat label={msg("À réapprovisionner", "Mila fenoina indray ny tahiry")} value={String(low.length)} icon={<RefreshCw className="size-4" />} tone="warning" />
        <Stat label={msg("Ventes effectuées", "Isan'ny varotra vita")} value={String(all.sales)} icon={<Hash className="size-4" />} />
        <Stat label={msg("Pièces vendues", "Isan'ny kojakoja lafo")} value={String(all.pieces)} icon={<Layers className="size-4" />} tone="accent" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title={msg("Évolution des ventes et bénéfices (14 jours)", "Fiovan'ny varotra sy tombom-barotra (14 andro)")}>
          <div className="h-72"><ResponsiveContainer><AreaChart data={series}>
            <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--chart-1)" stopOpacity={0.6} /><stop offset="1" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--chart-3)" stopOpacity={0.5} /><stop offset="1" stopColor="var(--chart-3)" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" /><XAxis dataKey="jour" stroke="var(--muted-foreground)" fontSize={11} /><YAxis stroke="var(--muted-foreground)" fontSize={11} width={70} />
            <Tooltip {...tip} /><Legend />
            <Area dataKey={salesLabel} stroke="var(--chart-1)" fill="url(#g1)" strokeWidth={2} /><Area dataKey={profitLabel} stroke="var(--chart-3)" fill="url(#g2)" strokeWidth={2} />
          </AreaChart></ResponsiveContainer></div>
        </Panel>
        <Panel title={msg("Ventes vs dépenses", "Varotra sy fandaniana")}>
          <div className="h-72"><ResponsiveContainer><BarChart data={series}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" /><XAxis dataKey="jour" stroke="var(--muted-foreground)" fontSize={11} /><YAxis stroke="var(--muted-foreground)" fontSize={11} width={70} />
            <Tooltip {...tip} /><Legend /><Bar dataKey={salesLabel} fill="var(--chart-2)" radius={[6, 6, 0, 0]} /><Bar dataKey={expensesLabel} fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
          </BarChart></ResponsiveContainer></div>
        </Panel>
      </div>
      {(out.length > 0 || low.length > 0) && (
        <Panel title={msg("Alertes de stock", "Fampitandremana momba ny tahiry")} className="mt-6">
          <div className="flex flex-wrap gap-2">
            {out.map((p) => <span key={p.id} className="rounded-lg bg-destructive/15 px-3 py-1.5 text-sm text-destructive">{p.name} — {msg("rupture", "lany tahiry")}</span>)}
            {low.map((p) => <span key={p.id} className="rounded-lg bg-warning/15 px-3 py-1.5 text-sm text-warning">{p.name} — {p.qty} {msg("restant(s)", "sisa")}</span>)}
          </div>
        </Panel>
      )}
    </>
  );
}
