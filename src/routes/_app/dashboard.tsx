import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, ShoppingBag, Coins, PiggyBank, Receipt, Wallet, Boxes, Package, AlertTriangle, RefreshCw, Hash, Layers } from "lucide-react";
import { computeStats, useDB } from "@/lib/store";
import { ar, endOfDay, startOfDay } from "@/lib/format";
import { PageHeader, Panel, Stat } from "@/components/app/kit";

export const Route = createFileRoute("/_app/dashboard")({ head: () => ({ meta: [{ title: "Logicielle Motors" }] }), component: Dashboard });

export const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10 }, formatter: (v: number) => ar(v) };

function Dashboard() {
  const d = useDB();
  const all = computeStats(d, new Date(0), new Date(8.64e15));
  const today = computeStats(d, startOfDay(), endOfDay());
  const stockValue = d.products.reduce((s, p) => s + p.qty * p.buyPrice, 0);
  const out = d.products.filter((p) => p.qty <= 0);
  const low = d.products.filter((p) => p.qty > 0 && p.qty <= p.minQty);
  const series = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const day = new Date(); day.setDate(day.getDate() - (13 - i));
    const s = computeStats(d, startOfDay(day), endOfDay(day));
    return { jour: day.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), Ventes: s.revenue, Bénéfice: s.net, Dépenses: s.expenses };
  }), [d]);
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Vue d'ensemble de votre magasin en temps réel" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        <Stat label="Chiffre d'affaires total" value={ar(all.revenue)} icon={<TrendingUp className="size-4" />} />
        <Stat label="Ventes du jour" value={ar(today.revenue)} icon={<ShoppingBag className="size-4" />} tone="accent" hint={`${today.sales} vente(s)`} />
        <Stat label="Bénéfice brut" value={ar(all.gross)} icon={<Coins className="size-4" />} tone="success" />
        <Stat label="Bénéfice net" value={ar(all.net)} icon={<PiggyBank className="size-4" />} tone={all.net >= 0 ? "success" : "destructive"} />
        <Stat label="Dépenses du jour" value={ar(today.expenses)} icon={<Receipt className="size-4" />} tone="warning" />
        <Stat label="Total des dépenses" value={ar(all.expenses)} icon={<Wallet className="size-4" />} tone="warning" />
        <Stat label="Valeur du stock" value={ar(stockValue)} icon={<Boxes className="size-4" />} hint="au prix d'achat" />
        <Stat label="Produits en stock" value={String(d.products.filter((p) => p.qty > 0).length)} icon={<Package className="size-4" />} tone="accent" />
        <Stat label="En rupture" value={String(out.length)} icon={<AlertTriangle className="size-4" />} tone="destructive" />
        <Stat label="À réapprovisionner" value={String(low.length)} icon={<RefreshCw className="size-4" />} tone="warning" />
        <Stat label="Ventes effectuées" value={String(all.sales)} icon={<Hash className="size-4" />} />
        <Stat label="Pièces vendues" value={String(all.pieces)} icon={<Layers className="size-4" />} tone="accent" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Évolution des ventes et bénéfices (14 jours)">
          <div className="h-72"><ResponsiveContainer><AreaChart data={series}>
            <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--chart-1)" stopOpacity={0.6} /><stop offset="1" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--chart-3)" stopOpacity={0.5} /><stop offset="1" stopColor="var(--chart-3)" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" /><XAxis dataKey="jour" stroke="var(--muted-foreground)" fontSize={11} /><YAxis stroke="var(--muted-foreground)" fontSize={11} width={70} />
            <Tooltip {...tip} /><Legend />
            <Area dataKey="Ventes" stroke="var(--chart-1)" fill="url(#g1)" strokeWidth={2} /><Area dataKey="Bénéfice" stroke="var(--chart-3)" fill="url(#g2)" strokeWidth={2} />
          </AreaChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Ventes vs dépenses">
          <div className="h-72"><ResponsiveContainer><BarChart data={series}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" /><XAxis dataKey="jour" stroke="var(--muted-foreground)" fontSize={11} /><YAxis stroke="var(--muted-foreground)" fontSize={11} width={70} />
            <Tooltip {...tip} /><Legend /><Bar dataKey="Ventes" fill="var(--chart-2)" radius={[6, 6, 0, 0]} /><Bar dataKey="Dépenses" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
          </BarChart></ResponsiveContainer></div>
        </Panel>
      </div>
      {(out.length > 0 || low.length > 0) && (
        <Panel title="Alertes de stock" className="mt-6">
          <div className="flex flex-wrap gap-2">
            {out.map((p) => <span key={p.id} className="rounded-lg bg-destructive/15 px-3 py-1.5 text-sm text-destructive">{p.name} — rupture</span>)}
            {low.map((p) => <span key={p.id} className="rounded-lg bg-warning/15 px-3 py-1.5 text-sm text-warning">{p.name} — {p.qty} restant(s)</span>)}
          </div>
        </Panel>
      )}
    </>
  );
}
