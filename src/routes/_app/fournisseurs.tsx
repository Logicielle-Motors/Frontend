import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { actions, useDB, type Supplier } from "@/lib/store";
import { ar, dt } from "@/lib/format";
import { Btn, Empty, Field, Modal, PageHeader, Panel } from "@/components/app/kit";

export const Route = createFileRoute("/_app/fournisseurs")({ head: () => ({ meta: [{ title: "Logicielle Motors" }] }), component: Sup });
type F = Omit<Supplier, "id" | "createdAt"> & { id?: string };

function Sup() {
  const d = useDB();
  const [f, setF] = useState<F | null>(null);
  const [rec, setRec] = useState<{ supplierId: string; productId: string; qty: number; unitCost: number; upd: boolean } | null>(null);
  const run = (fn: () => void, m: string) => { try { fn(); toast.success(m); return true; } catch (e) { toast.error((e as Error).message); return false; } };
  return (<>
    <PageHeader title="Fournisseurs" actions={<><Btn variant="ghost" onClick={() => setRec({ supplierId: d.suppliers[0]?.id ?? "", productId: d.products[0]?.id ?? "", qty: 1, unitCost: d.products[0]?.buyPrice ?? 0, upd: true })}><Truck className="size-4" />Réception</Btn><Btn onClick={() => setF({ name: "", phone: "", email: "", address: "", note: "" })}><Plus className="size-4" />Nouveau</Btn></>} />
    <Panel>
      {d.suppliers.length ? <div className="overflow-x-auto"><table className="table-pro w-full"><thead><tr><th>Nom</th><th>Téléphone</th><th>Adresse</th><th>Achats</th><th></th></tr></thead><tbody>
        {d.suppliers.map((s) => <tr key={s.id}><td className="font-medium">{s.name}</td><td>{s.phone}</td><td>{s.address}</td><td>{ar(d.purchases.filter((p) => p.supplierId === s.id).reduce((a, p) => a + p.qty * p.unitCost, 0))}</td>
          <td className="text-right whitespace-nowrap"><button className="p-1.5 text-primary" onClick={() => setF({ ...s })}><Pencil className="size-4" /></button><button className="p-1.5 text-destructive" onClick={() => confirm(`Supprimer ${s.name} ?`) && run(() => actions.deleteSupplier(s.id), "Supprimé")}><Trash2 className="size-4" /></button></td></tr>)}
      </tbody></table></div> : <Empty text="Aucun fournisseur" />}
    </Panel>
    <Panel title="Dernières réceptions" className="mt-6">
      {d.purchases.length ? <table className="table-pro w-full"><thead><tr><th>Date</th><th>Fournisseur</th><th>Produit</th><th>Qté</th><th>Coût</th></tr></thead><tbody>
        {d.purchases.slice(0, 30).map((p) => <tr key={p.id}><td>{dt(p.date)}</td><td>{d.suppliers.find((s) => s.id === p.supplierId)?.name ?? "—"}</td><td>{p.productName}</td><td>{p.qty}</td><td>{ar(p.qty * p.unitCost)}</td></tr>)}
      </tbody></table> : <Empty text="Aucune réception" />}
    </Panel>
    <Modal open={!!f} onClose={() => setF(null)} title={f?.id ? "Modifier le fournisseur" : "Nouveau fournisseur"}>
      {f && <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (run(() => actions.saveSupplier(f), "Fournisseur enregistré")) setF(null); }}>
        {(["name", "phone", "email", "address", "note"] as const).map((k) => <Field key={k} label={{ name: "Nom *", phone: "Téléphone", email: "Email", address: "Adresse", note: "Note" }[k]}><input className="field" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></Field>)}
        <div className="flex justify-end"><Btn>Enregistrer</Btn></div>
      </form>}
    </Modal>
    <Modal open={!!rec} onClose={() => setRec(null)} title="Réception de marchandise">
      {rec && <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (run(() => actions.receivePurchase(rec.supplierId, rec.productId, rec.qty, rec.unitCost, rec.upd), "Stock mis à jour")) setRec(null); }}>
        <Field label="Fournisseur"><select className="field" value={rec.supplierId} onChange={(e) => setRec({ ...rec, supplierId: e.target.value })}>{d.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
        <Field label="Produit"><select className="field" value={rec.productId} onChange={(e) => setRec({ ...rec, productId: e.target.value, unitCost: d.products.find((p) => p.id === e.target.value)?.buyPrice ?? 0 })}>{d.products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.ref})</option>)}</select></Field>
        <Field label="Quantité"><input className="field" type="number" min={1} value={rec.qty} onChange={(e) => setRec({ ...rec, qty: Number(e.target.value) })} /></Field>
        <Field label="Prix d'achat unitaire (Ar)"><input className="field" type="number" min={0} value={rec.unitCost} onChange={(e) => setRec({ ...rec, unitCost: Number(e.target.value) })} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={rec.upd} onChange={(e) => setRec({ ...rec, upd: e.target.checked })} />Mettre à jour le prix d'achat du produit</label>
        <div className="flex justify-end"><Btn>Valider la réception</Btn></div>
      </form>}
    </Modal>
  </>);
}
