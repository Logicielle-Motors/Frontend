import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { actions, useDB, type Product } from "@/lib/store";
import { ar, errorText, tx } from "@/lib/format";
import { Badge, Btn, Empty, Field, Modal, PageHeader, Panel } from "@/components/app/kit";

export const Route = createFileRoute("/_app/stock")({ head: () => ({ meta: [{ title: "Logicielle Motors" }] }), component: Stock });

type Form = Omit<Product, "id" | "createdAt"> & { id?: string };
const blank = (): Form => ({ name: "", ref: "", category: "", brand: "", model: "", buyPrice: 0, sellPrice: 0, qty: 0, minQty: 1, supplierId: "" });

function Stock() {
  const d = useDB();
  const language = d.settings.language;
  const msg = (fr: string, mg: string) => tx(language, fr, mg);
  const [q, setQ] = useState(""); const [cat, setCat] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [add, setAdd] = useState<Product | null>(null); const [addQty, setAddQty] = useState(1);
  const list = d.products.filter((p) => (!cat || p.category === cat) && `${p.name} ${p.ref} ${p.brand} ${p.model}`.toLowerCase().includes(q.toLowerCase()));
  const run = (f: () => void, success: string) => { try { f(); toast.success(success); return true; } catch (e) { toast.error(errorText(e, language)); return false; } };
  const set = (k: keyof Form, v: string | number) => setForm((f) => f && { ...f, [k]: v });
  return (<>
    <PageHeader title={msg("Gestion du stock", "Fitantanana ny tahiry")} subtitle={`${d.products.length} ${msg("produit(s)", "entana")}`} actions={<Btn onClick={() => setForm(blank())}><Plus className="size-4" />{msg("Nouveau produit", "Hanampy entana")}</Btn>} />
    <Panel>
      <div className="mb-4 flex flex-wrap gap-2">
        <input className="field flex-1" placeholder={msg("Rechercher…", "Mitadiava…")} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="field !w-auto" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">{msg("Toutes les catégories", "Ny sokajy rehetra")}</option>{d.settings.categories.map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      {list.length ? <div className="overflow-x-auto"><table className="table-pro w-full"><thead><tr><th>{msg("Produit", "Entana")}</th><th>{msg("Réf.", "Laharana")}</th><th>{msg("Catégorie", "Sokajy")}</th><th>{msg("Achat", "Fividianana")}</th><th>{msg("Vente", "Fivarotana")}</th><th>{msg("Stock", "Tahiry")}</th><th></th></tr></thead><tbody>
        {list.map((p) => <tr key={p.id}><td><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.brand} {p.model}</p></td><td>{p.ref}</td><td>{p.category}</td><td>{ar(p.buyPrice)}</td><td>{ar(p.sellPrice)}</td>
          <td><Badge tone={p.qty <= 0 ? "destructive" : p.qty <= p.minQty ? "warning" : "success"}>{p.qty}</Badge></td>
          <td className="whitespace-nowrap text-right">
            <button className="p-1.5 text-success" title={msg("Ajouter du stock", "Hanampy tahiry")} onClick={() => { setAdd(p); setAddQty(1); }}><PackagePlus className="size-4" /></button>
            <button className="p-1.5 text-primary" title={msg("Modifier", "Hanova")} onClick={() => setForm({ ...p })}><Pencil className="size-4" /></button>
            <button className="p-1.5 text-destructive" title={msg("Supprimer", "Hamafa")} onClick={() => confirm(msg(`Supprimer ${p.name} ?`, `Hofafana ve ny ${p.name} ?`)) && run(() => actions.deleteProduct(p.id), msg("Produit supprimé", "Voafafa ny entana"))}><Trash2 className="size-4" /></button>
          </td></tr>)}
      </tbody></table></div> : <Empty text={msg("Aucun produit", "Tsy misy entana")} />}
    </Panel>
    <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? msg("Modifier le produit", "Hanova ny entana") : msg("Nouveau produit", "Entana vaovao")} wide>
      {form && <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); if (run(() => actions.saveProduct(form), msg("Produit enregistré", "Voatahiry ny entana"))) setForm(null); }}>
        <Field label={msg("Nom *", "Anarana *")}><input className="field" value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label={msg("Référence *", "Laharana *")}><input className="field" value={form.ref} onChange={(e) => set("ref", e.target.value)} /></Field>
        <Field label={msg("Catégorie", "Sokajy")}><input className="field" list="cats" value={form.category} onChange={(e) => set("category", e.target.value)} /><datalist id="cats">{d.settings.categories.map((c) => <option key={c} value={c} />)}</datalist></Field>
        <Field label={msg("Fournisseur", "Mpamatsy")}><select className="field" value={form.supplierId} onChange={(e) => set("supplierId", e.target.value)}><option value="">—</option>{d.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
        <Field label={msg("Marque", "Marika")}><input className="field" value={form.brand} onChange={(e) => set("brand", e.target.value)} /></Field>
        <Field label={msg("Modèle compatible", "Modely mifanaraka")}><input className="field" value={form.model} onChange={(e) => set("model", e.target.value)} /></Field>
        <Field label={msg("Prix d'achat (Ar)", "Vidin'ny fividianana (Ar)")}><input className="field" type="number" min={0} value={form.buyPrice} onChange={(e) => set("buyPrice", Number(e.target.value))} /></Field>
        <Field label={msg("Prix de vente (Ar)", "Vidin'ny fivarotana (Ar)")}><input className="field" type="number" min={0} value={form.sellPrice} onChange={(e) => set("sellPrice", Number(e.target.value))} /></Field>
        {!form.id && <Field label={msg("Quantité initiale", "Isan'ny entana voalohany")}><input className="field" type="number" min={0} value={form.qty} onChange={(e) => set("qty", Number(e.target.value))} /></Field>}
        <Field label={msg("Stock minimum", "Tahiry farany ambany")}><input className="field" type="number" min={0} value={form.minQty} onChange={(e) => set("minQty", Number(e.target.value))} /></Field>
        <div className="flex justify-end gap-2 sm:col-span-2"><Btn type="button" variant="ghost" onClick={() => setForm(null)}>{msg("Annuler", "Ajanony")}</Btn><Btn>{msg("Enregistrer", "Tehirizo")}</Btn></div>
      </form>}
    </Modal>
    <Modal open={!!add} onClose={() => setAdd(null)} title={`${msg("Ajouter du stock", "Hanampy tahiry")} – ${add?.name ?? ""}`}>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (add && run(() => actions.addStock(add.id, addQty, "Ajout manuel"), msg("Stock ajouté", "Nitombo ny tahiry"))) setAdd(null); }}>
        <Field label={msg("Quantité à ajouter", "Isan'ny entana ampiana")}><input className="field" type="number" min={1} value={addQty} onChange={(e) => setAddQty(Number(e.target.value))} /></Field>
        <div className="flex justify-end"><Btn>{msg("Valider", "Hamarino")}</Btn></div>
      </form>
    </Modal>
  </>);
}
