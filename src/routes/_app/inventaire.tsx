import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { actions, useDB } from "@/lib/store";
import { dt, errorText, tx } from "@/lib/format";
import { Badge, Btn, Empty, PageHeader, Panel } from "@/components/app/kit";

export const Route = createFileRoute("/_app/inventaire")({ head: () => ({ meta: [{ title: "Logicielle Motors" }] }), component: Inv });

function Inv() {
  const d = useDB();
  const language = d.settings.language;
  const msg = (fr: string, mg: string) => tx(language, fr, mg);
  const [counts, setCounts] = useState<Record<string, string>>({});
  const validate = () => {
    const c: Record<string, number> = {};
    Object.entries(counts).forEach(([k, v]) => { if (v !== "") c[k] = Number(v); });
    try { actions.validateInventory(c); setCounts({}); toast.success(msg("Inventaire validé", "Voamarina ny fanisana")); } catch (e) { toast.error(errorText(e, language)); }
  };
  return (<>
    <PageHeader title={msg("Inventaire", "Fanisana tahiry")} subtitle={msg("Saisissez les quantités comptées puis validez", "Ampidiro ny isan'ny entana voaisa, dia hamafiso")} actions={<Btn onClick={validate}>{msg("Valider l'inventaire", "Hamarino ny fanisana")}</Btn>} />
    <Panel>
      {d.products.length ? <div className="overflow-x-auto"><table className="table-pro w-full"><thead><tr><th>{msg("Produit", "Entana")}</th><th>{msg("Réf.", "Laharana")}</th><th>{msg("Théorique", "Isan'ny ao anaty tahiry")}</th><th>{msg("Compté", "Voaisa")}</th><th>{msg("Écart", "Elanelana")}</th></tr></thead><tbody>
        {d.products.map((p) => { const v = counts[p.id] ?? ""; const diff = v === "" ? null : Number(v) - p.qty; return <tr key={p.id}><td>{p.name}</td><td>{p.ref}</td><td>{p.qty}</td>
          <td><input className="field !h-8 !w-24" type="number" min={0} value={v} onChange={(e) => setCounts({ ...counts, [p.id]: e.target.value })} /></td>
          <td>{diff === null ? "—" : <Badge tone={diff === 0 ? "success" : diff < 0 ? "destructive" : "warning"}>{diff > 0 ? `+${diff}` : diff}</Badge>}</td></tr>; })}
      </tbody></table></div> : <Empty text={msg("Aucun produit", "Tsy misy entana")} />}
    </Panel>
    <Panel title={msg("Historique des inventaires", "Tantaran'ny fanisana")} className="mt-6">
      {d.inventories.length ? <ul className="space-y-2 text-sm">{d.inventories.map((i) => <li key={i.id} className="flex justify-between border-b border-border pb-2"><span>{dt(i.date, language)}</span><span className="text-muted-foreground">{i.lines.length} {msg("produit(s)", "entana")} · {i.lines.filter((l) => l.counted !== l.theo).length} {msg("écart(s)", "tsy fitoviana")}</span></li>)}</ul> : <Empty text={msg("Aucun inventaire", "Mbola tsy nisy fanisana")} />}
    </Panel>
  </>);
}
