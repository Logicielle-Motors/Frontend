import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { actions, useDB } from "@/lib/store";
import { dt } from "@/lib/format";
import { Badge, Btn, Empty, PageHeader, Panel } from "@/components/app/kit";

export const Route = createFileRoute("/_app/inventaire")({ head: () => ({ meta: [{ title: "Inventaire – Moto Pièces Pro" }] }), component: Inv });

function Inv() {
  const d = useDB();
  const [counts, setCounts] = useState<Record<string, string>>({});
  const validate = () => {
    const c: Record<string, number> = {};
    Object.entries(counts).forEach(([k, v]) => { if (v !== "") c[k] = Number(v); });
    try { actions.validateInventory(c); setCounts({}); toast.success("Inventaire validé"); } catch (e) { toast.error((e as Error).message); }
  };
  return (<>
    <PageHeader title="Inventaire" subtitle="Saisissez les quantités comptées puis validez" actions={<Btn onClick={validate}>Valider l'inventaire</Btn>} />
    <Panel>
      {d.products.length ? <div className="overflow-x-auto"><table className="table-pro w-full"><thead><tr><th>Produit</th><th>Réf.</th><th>Théorique</th><th>Compté</th><th>Écart</th></tr></thead><tbody>
        {d.products.map((p) => { const v = counts[p.id] ?? ""; const diff = v === "" ? null : Number(v) - p.qty; return <tr key={p.id}><td>{p.name}</td><td>{p.ref}</td><td>{p.qty}</td>
          <td><input className="field !h-8 !w-24" type="number" min={0} value={v} onChange={(e) => setCounts({ ...counts, [p.id]: e.target.value })} /></td>
          <td>{diff === null ? "—" : <Badge tone={diff === 0 ? "success" : diff < 0 ? "destructive" : "warning"}>{diff > 0 ? `+${diff}` : diff}</Badge>}</td></tr>; })}
      </tbody></table></div> : <Empty text="Aucun produit" />}
    </Panel>
    <Panel title="Historique des inventaires" className="mt-6">
      {d.inventories.length ? <ul className="space-y-2 text-sm">{d.inventories.map((i) => <li key={i.id} className="flex justify-between border-b border-border pb-2"><span>{dt(i.date)}</span><span className="text-muted-foreground">{i.lines.length} produit(s) · {i.lines.filter((l) => l.counted !== l.theo).length} écart(s)</span></li>)}</ul> : <Empty text="Aucun inventaire" />}
    </Panel>
  </>);
}
