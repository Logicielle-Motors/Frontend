import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { computeStats, useDB } from "@/lib/store";
import { ar, downloadCSV, endOfDay, startOfDay, toInputDate, tx } from "@/lib/format";
import { Btn, Field, PageHeader, Panel, Stat } from "@/components/app/kit";
import { TrendingUp, Coins, Receipt, PiggyBank, ShoppingBag, Package } from "lucide-react";

export const Route = createFileRoute("/_app/rapports")({ head: () => ({ meta: [{ title: "Logicielle Motors" }] }), component: Rep });

function Rep() {
  const d = useDB();
  const language = d.settings.language;
  const msg = (fr: string, mg: string) => tx(language, fr, mg);
  const m = new Date(); m.setDate(1);
  const [from, setFrom] = useState(toInputDate(m)); const [to, setTo] = useState(toInputDate(new Date()));
  const f = startOfDay(new Date(from)), t = endOfDay(new Date(to));
  const s = computeStats(d, f, t);
  const top = new Map<string, { name: string; qty: number; rev: number }>();
  d.sales.filter((x) => x.status === "valide" && new Date(x.date) >= f && new Date(x.date) <= t).forEach((x) => x.items.forEach((i) => { const c = top.get(i.productId) ?? { name: i.name, qty: 0, rev: 0 }; c.qty += i.qty; c.rev += i.qty * i.unitPrice; top.set(i.productId, c); }));
  const topList = [...top.values()].sort((a, b) => b.qty - a.qty).slice(0, 10);
  return (<>
    <PageHeader title={msg("Rapports financiers", "Tatitra ara-bola")} actions={<Btn variant="ghost" onClick={() => downloadCSV(`tatitra_${from}_${to}.csv`, [[msg("Indicateur", "Sokajy"), msg("Montant", "Vola")], [msg("Chiffre d'affaires", "Vola azo tamin'ny varotra"), s.revenue], [msg("Coût des ventes", "Saran'ny entana lafo"), s.cogs], [msg("Bénéfice brut", "Tombom-barotra alohan'ny fandaniana"), s.gross], [msg("Dépenses", "Fandaniana"), s.expenses], [msg("Bénéfice net", "Tombom-barotra madio"), s.net]])}>{msg("Exporter CSV", "Hamoaka CSV")}</Btn>} />
    <Panel className="mb-6"><div className="flex flex-wrap gap-3">
      <Field label={msg("Du", "Manomboka")}><input type="date" className="field" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
      <Field label={msg("Au", "Hatramin'ny")}><input type="date" className="field" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
    </div></Panel>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      <Stat label={msg("Chiffre d'affaires", "Vola azo tamin'ny varotra")} value={ar(s.revenue)} icon={<TrendingUp className="size-4" />} />
      <Stat label={msg("Coût des ventes", "Saran'ny entana lafo")} value={ar(s.cogs)} icon={<Package className="size-4" />} tone="accent" />
      <Stat label={msg("Bénéfice brut", "Tombom-barotra alohan'ny fandaniana")} value={ar(s.gross)} icon={<Coins className="size-4" />} tone="success" />
      <Stat label={msg("Dépenses", "Fandaniana")} value={ar(s.expenses)} icon={<Receipt className="size-4" />} tone="warning" />
      <Stat label={msg("Bénéfice net", "Tombom-barotra madio")} value={ar(s.net)} icon={<PiggyBank className="size-4" />} tone={s.net >= 0 ? "success" : "destructive"} />
      <Stat label={msg("Ventes / pièces", "Varotra / kojakoja")} value={`${s.sales} / ${s.pieces}`} icon={<ShoppingBag className="size-4" />} />
    </div>
    <Panel title={msg("Produits les plus vendus", "Entana be mpivarotra indrindra")} className="mt-6">
      <table className="table-pro w-full"><thead><tr><th>{msg("Produit", "Entana")}</th><th>{msg("Quantité", "Isany")}</th><th>{msg("CA", "Vola azo")}</th></tr></thead><tbody>{topList.map((p) => <tr key={p.name}><td>{p.name}</td><td>{p.qty}</td><td>{ar(p.rev)}</td></tr>)}</tbody></table>
    </Panel>
  </>);
}
