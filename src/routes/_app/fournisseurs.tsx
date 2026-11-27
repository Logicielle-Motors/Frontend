import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { actions, useDB, type Supplier } from "@/lib/store";
import { ar, dt, errorText, tx } from "@/lib/format";
import { Btn, Empty, Field, Modal, PageHeader, Panel } from "@/components/app/kit";

export const Route = createFileRoute("/_app/fournisseurs")({ head: () => ({ meta: [{ title: "Logicielle Motors" }] }), component: Sup });
type F = Omit<Supplier, "id" | "createdAt"> & { id?: string };

function Sup() {
  const d = useDB();
  const language = d.settings.language;
  const msg = (fr: string, mg: string) => tx(language, fr, mg);
  const [f, setF] = useState<F | null>(null);
  const [rec, setRec] = useState<{ supplierId: string; productId: string; qty: number; unitCost: number; upd: boolean } | null>(null);
  const run = (fn: () => void, success: string) => { try { fn(); toast.success(success); return true; } catch (e) { toast.error(errorText(e, language)); return false; } };
  return (<>
    <PageHeader title={msg("Fournisseurs", "Mpamatsy")} actions={<><Btn variant="ghost" onClick={() => setRec({ supplierId: d.suppliers[0]?.id ?? "", productId: d.products[0]?.id ?? "", qty: 1, unitCost: d.products[0]?.buyPrice ?? 0, upd: true })}><Truck className="size-4" />{msg("Réception", "Fandraisana entana")}</Btn><Btn onClick={() => setF({ name: "", phone: "", email: "", address: "", note: "" })}><Plus className="size-4" />{msg("Nouveau", "Vaovao")}</Btn></>} />
    <Panel>
      {d.suppliers.length ? <div className="overflow-x-auto"><table className="table-pro w-full"><thead><tr><th>{msg("Nom", "Anarana")}</th><th>{msg("Téléphone", "Finday")}</th><th>{msg("Adresse", "Adiresy")}</th><th>{msg("Achats", "Fividianana")}</th><th></th></tr></thead><tbody>
        {d.suppliers.map((s) => <tr key={s.id}><td className="font-medium">{s.name}</td><td>{s.phone}</td><td>{s.address}</td><td>{ar(d.purchases.filter((p) => p.supplierId === s.id).reduce((a, p) => a + p.qty * p.unitCost, 0))}</td>
          <td className="text-right whitespace-nowrap"><button className="p-1.5 text-primary" title={msg("Modifier", "Hanova")} onClick={() => setF({ ...s })}><Pencil className="size-4" /></button><button className="p-1.5 text-destructive" title={msg("Supprimer", "Hamafa")} onClick={() => confirm(msg(`Supprimer ${s.name} ?`, `Hofafana ve ny ${s.name} ?`)) && run(() => actions.deleteSupplier(s.id), msg("Supprimé", "Voafafa"))}><Trash2 className="size-4" /></button></td></tr>)}
      </tbody></table></div> : <Empty text={msg("Aucun fournisseur", "Tsy misy mpamatsy")} />}
    </Panel>
    <Panel title={msg("Dernières réceptions", "Fandraisana entana farany")} className="mt-6">
      {d.purchases.length ? <table className="table-pro w-full"><thead><tr><th>{msg("Date", "Daty")}</th><th>{msg("Fournisseur", "Mpamatsy")}</th><th>{msg("Produit", "Entana")}</th><th>{msg("Qté", "Isa")}</th><th>{msg("Coût", "Sarany")}</th></tr></thead><tbody>
        {d.purchases.slice(0, 30).map((p) => <tr key={p.id}><td>{dt(p.date, language)}</td><td>{d.suppliers.find((s) => s.id === p.supplierId)?.name ?? "—"}</td><td>{p.productName}</td><td>{p.qty}</td><td>{ar(p.qty * p.unitCost)}</td></tr>)}
      </tbody></table> : <Empty text={msg("Aucune réception", "Mbola tsy nisy fandraisana entana")} />}
    </Panel>
    <Modal open={!!f} onClose={() => setF(null)} title={f?.id ? msg("Modifier le fournisseur", "Hanova ny mpamatsy") : msg("Nouveau fournisseur", "Mpamatsy vaovao")}>
      {f && <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (run(() => actions.saveSupplier(f), msg("Fournisseur enregistré", "Voatahiry ny mpamatsy"))) setF(null); }}>
        {(["name", "phone", "email", "address", "note"] as const).map((k) => <Field key={k} label={{ name: msg("Nom *", "Anarana *"), phone: msg("Téléphone", "Finday"), email: "Email", address: msg("Adresse", "Adiresy"), note: msg("Note", "Fanamarihana") }[k]}><input className="field" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></Field>)}
        <div className="flex justify-end"><Btn>{msg("Enregistrer", "Tehirizo")}</Btn></div>
      </form>}
    </Modal>
    <Modal open={!!rec} onClose={() => setRec(null)} title={msg("Réception de marchandise", "Fandraisana entana")}>
      {rec && <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (run(() => actions.receivePurchase(rec.supplierId, rec.productId, rec.qty, rec.unitCost, rec.upd), msg("Stock mis à jour", "Nohavaozina ny tahiry"))) setRec(null); }}>
        <Field label={msg("Fournisseur", "Mpamatsy")}><select className="field" value={rec.supplierId} onChange={(e) => setRec({ ...rec, supplierId: e.target.value })}>{d.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
        <Field label={msg("Produit", "Entana")}><select className="field" value={rec.productId} onChange={(e) => setRec({ ...rec, productId: e.target.value, unitCost: d.products.find((p) => p.id === e.target.value)?.buyPrice ?? 0 })}>{d.products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.ref})</option>)}</select></Field>
        <Field label={msg("Quantité", "Isan'ny entana")}><input className="field" type="number" min={1} value={rec.qty} onChange={(e) => setRec({ ...rec, qty: Number(e.target.value) })} /></Field>
        <Field label={msg("Prix d'achat unitaire (Ar)", "Vidin'ny fividianana isan'ny iray (Ar)")}><input className="field" type="number" min={0} value={rec.unitCost} onChange={(e) => setRec({ ...rec, unitCost: Number(e.target.value) })} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={rec.upd} onChange={(e) => setRec({ ...rec, upd: e.target.checked })} />{msg("Mettre à jour le prix d'achat du produit", "Havaozy ny vidin'ny fividianana an'ilay entana")}</label>
        <div className="flex justify-end"><Btn>{msg("Valider la réception", "Hamarino ny fandraisana")}</Btn></div>
      </form>}
    </Modal>
  </>);
}
