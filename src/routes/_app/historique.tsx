import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Ban } from "lucide-react";
import { toast } from "sonner";
import { actions, useDB, type Sale } from "@/lib/store";
import { ar, dt, downloadCSV } from "@/lib/format";
import { Badge, Btn, Empty, PageHeader, Panel } from "@/components/app/kit";
import { ReceiptModal } from "@/components/app/Receipt";

export const Route = createFileRoute("/_app/historique")({ head: () => ({ meta: [{ title: "Logicielle Motors" }] }), component: Hist });

function Hist() {
  const d = useDB();
  const [q, setQ] = useState(""); const [view, setView] = useState<Sale | null>(null);
  const list = d.sales.filter((s) => s.number.toLowerCase().includes(q.toLowerCase()) || s.items.some((i) => i.name.toLowerCase().includes(q.toLowerCase())));
  const cancel = (s: Sale) => { const r = prompt(`Motif d'annulation de ${s.number} :`); if (!r) return; try { actions.cancelSale(s.id, r); toast.success("Vente annulée, stock remis"); } catch (e) { toast.error((e as Error).message); } };
  return (<>
    <PageHeader title="Historique des ventes" actions={<Btn variant="ghost" onClick={() => downloadCSV("ventes.csv", [["Facture", "Date", "Total", "Statut"], ...list.map((s) => [s.number, dt(s.date), s.total, s.status])])}>Exporter CSV</Btn>} />
    <Panel>
      <input className="field mb-4" placeholder="Rechercher une facture ou un produit…" value={q} onChange={(e) => setQ(e.target.value)} />
      {list.length ? <div className="overflow-x-auto"><table className="table-pro w-full"><thead><tr><th>Facture</th><th>Date</th><th>Articles</th><th>Total</th><th>Statut</th><th></th></tr></thead><tbody>
        {list.map((s) => <tr key={s.id}><td className="font-medium">{s.number}</td><td>{dt(s.date)}</td><td>{s.items.reduce((a, i) => a + i.qty, 0)}</td><td>{ar(s.total)}</td>
          <td>{s.status === "valide" ? <Badge tone="success">Validée</Badge> : <Badge tone="destructive">Annulée</Badge>}</td>
          <td className="text-right whitespace-nowrap"><button className="p-1.5 text-primary" title="Voir" onClick={() => setView(s)}><Eye className="size-4" /></button>{s.status === "valide" && <button className="p-1.5 text-destructive" title="Annuler" onClick={() => cancel(s)}><Ban className="size-4" /></button>}</td></tr>)}
      </tbody></table></div> : <Empty text="Aucune vente" />}
    </Panel>
    <ReceiptModal sale={view} onClose={() => setView(null)} />
  </>);
}
