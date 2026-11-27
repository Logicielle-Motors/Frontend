import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { computeStats, useDB } from "@/lib/store";
import { ar, downloadCSV, endOfDay, startOfDay, toInputDate } from "@/lib/format";
import { Btn, Field, PageHeader, Panel, Stat } from "@/components/app/kit";
import { TrendingUp, Coins, Receipt, PiggyBank, ShoppingBag, Package } from "lucide-react";

export const Route = createFileRoute("/_app/rapports")({ head: () => ({ meta: [{ title: "Logicielle Motors" }] }), component: Rep });

function Rep() {
  const d = useDB();
  const m = new Date(); m.setDate(1);
  const [from, setFrom] = useState(toInputDate(m)); const [to, setTo] = useState(toInputDate(new Date()));
  const f = startOfDay(new Date(from)), t = endOfDay(new Date(to));
  const s = computeStats(d, f, t);
  const top = new Map<string, { name: string; qty: number; rev: number }>();
  d.sales.filter((x) => x.status === "valide" && new Date(x.date) >= f && new Date(x.date) <= t).forEach((x) => x.items.forEach((i) => { const c = top.get(i.productId) ?? { name: i.name, qty: 0, rev: 0 }; c.qty += i.qty; c.rev += i.qty * i.unitPrice; top.set(i.productId, c); }));
  const topList = [...top.values()].sort((a, b) => b.qty - a.qty).slice(0, 10);
  return (<>
    <PageHeader title="Rapports financiers" actions={<Btn variant="ghost" onClick={() => downloadCSV(`rapport_${from}_${to}.csv`, [["Indicateur", "Montant"], ["Chiffre d'affaires", s.revenue], ["Coût des ventes", s.cogs], ["Bénéfice brut", s.gross], ["Dépenses", s.expenses], ["Bénéfice net", s.net]])}>Exporter CSV</Btn>} />
    <Panel className="mb-6"><div className="flex flex-wrap gap-3">
      <Field label="Du"><input type="date" className="field" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
      <Field label="Au"><input type="date" className="field" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
    </div></Panel>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      <Stat label="Chiffre d'affaires" value={ar(s.revenue)} icon={<TrendingUp className="size-4" />} />
      <Stat label="Coût des ventes" value={ar(s.cogs)} icon={<Package className="size-4" />} tone="accent" />
      <Stat label="Bénéfice brut" value={ar(s.gross)} icon={<Coins className="size-4" />} tone="success" />
      <Stat label="Dépenses" value={ar(s.expenses)} icon={<Receipt className="size-4" />} tone="warning" />
      <Stat label="Bénéfice net" value={ar(s.net)} icon={<PiggyBank className="size-4" />} tone={s.net >= 0 ? "success" : "destructive"} />
      <Stat label="Ventes / pièces" value={`${s.sales} / ${s.pieces}`} icon={<ShoppingBag className="size-4" />} />
    </div>
    <Panel title="Produits les plus vendus" className="mt-6">
      <table className="table-pro w-full"><thead><tr><th>Produit</th><th>Quantité</th><th>CA</th></tr></thead><tbody>{topList.map((p) => <tr key={p.name}><td>{p.name}</td><td>{p.qty}</td><td>{ar(p.rev)}</td></tr>)}</tbody></table>
    </Panel>
  </>);
}
