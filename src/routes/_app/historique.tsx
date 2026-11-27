import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Ban } from "lucide-react";
import { toast } from "sonner";
import { actions, useDB, type Sale } from "@/lib/store";
import { ar, dt, downloadCSV, errorText, tx } from "@/lib/format";
import { Badge, Btn, Empty, PageHeader, Panel } from "@/components/app/kit";
import { ReceiptModal } from "@/components/app/Receipt";

export const Route = createFileRoute("/_app/historique")({ head: () => ({ meta: [{ title: "Logicielle Motors" }] }), component: Hist });

function Hist() {
  const d = useDB();
  const language = d.settings.language;
  const msg = (fr: string, mg: string) => tx(language, fr, mg);
  const [q, setQ] = useState(""); const [view, setView] = useState<Sale | null>(null);
  const list = d.sales.filter((s) => s.number.toLowerCase().includes(q.toLowerCase()) || s.items.some((i) => i.name.toLowerCase().includes(q.toLowerCase())));
  const cancel = (s: Sale) => { const r = prompt(msg(`Motif d'annulation de ${s.number} :`, `Antony hanafoanana ny varotra ${s.number} :`)); if (!r) return; try { actions.cancelSale(s.id, r); toast.success(msg("Vente annulée, stock remis", "Nofoanana ny varotra ary naverina ny tahiry")); } catch (e) { toast.error(errorText(e, language)); } };
  return (<>
    <PageHeader title={msg("Historique des ventes", "Tantaran'ny varotra")} actions={<Btn variant="ghost" onClick={() => downloadCSV("varotra.csv", [[msg("Facture", "Faktiora"), msg("Date", "Daty"), msg("Total", "Fitambarany"), msg("Statut", "Sata")], ...list.map((s) => [s.number, dt(s.date, language), s.total, s.status === "valide" ? msg("Validée", "Voamarina") : msg("Annulée", "Nofoanana")])])}>{msg("Exporter CSV", "Hamoaka CSV")}</Btn>} />
    <Panel>
      <input className="field mb-4" placeholder={msg("Rechercher une facture ou un produit…", "Mitadiava faktiora na entana…")} value={q} onChange={(e) => setQ(e.target.value)} />
      {list.length ? <div className="overflow-x-auto"><table className="table-pro w-full"><thead><tr><th>{msg("Facture", "Faktiora")}</th><th>{msg("Date", "Daty")}</th><th>{msg("Articles", "Entana")}</th><th>{msg("Total", "Fitambarany")}</th><th>{msg("Statut", "Sata")}</th><th></th></tr></thead><tbody>
        {list.map((s) => <tr key={s.id}><td className="font-medium">{s.number}</td><td>{dt(s.date, language)}</td><td>{s.items.reduce((a, i) => a + i.qty, 0)}</td><td>{ar(s.total)}</td>
          <td>{s.status === "valide" ? <Badge tone="success">{msg("Validée", "Voamarina")}</Badge> : <Badge tone="destructive">{msg("Annulée", "Nofoanana")}</Badge>}</td>
          <td className="text-right whitespace-nowrap"><button className="p-1.5 text-primary" title={msg("Voir", "Hijery")} onClick={() => setView(s)}><Eye className="size-4" /></button>{s.status === "valide" && <button className="p-1.5 text-destructive" title={msg("Annuler", "Hanafoana")} onClick={() => cancel(s)}><Ban className="size-4" /></button>}</td></tr>)}
      </tbody></table></div> : <Empty text={msg("Aucune vente", "Mbola tsy nisy varotra")} />}
    </Panel>
    <ReceiptModal sale={view} onClose={() => setView(null)} />
  </>);
}
