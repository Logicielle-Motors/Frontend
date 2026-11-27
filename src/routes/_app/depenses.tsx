import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { actions, useDB, type Expense } from "@/lib/store";
import { ar, dOnly, toInputDate } from "@/lib/format";
import { Btn, Empty, Field, Modal, PageHeader, Panel } from "@/components/app/kit";

export const Route = createFileRoute("/_app/depenses")({ head: () => ({ meta: [{ title: "Logicielle Motors" }] }), component: Dep });
type F = Omit<Expense, "id"> & { id?: string };

function Dep() {
  const d = useDB();
  const [f, setF] = useState<F | null>(null);
  const run = (fn: () => void, m: string) => { try { fn(); toast.success(m); return true; } catch (e) { toast.error((e as Error).message); return false; } };
  const total = d.expenses.reduce((a, e) => a + e.amount, 0);
  return (<>
    <PageHeader title="Dépenses" subtitle={`Total : ${ar(total)}`} actions={<Btn onClick={() => setF({ description: "", category: d.settings.expenseCategories[0] ?? "", amount: 0, date: new Date().toISOString() })}><Plus className="size-4" />Nouvelle dépense</Btn>} />
    <Panel>
      {d.expenses.length ? <table className="table-pro w-full"><thead><tr><th>Date</th><th>Description</th><th>Catégorie</th><th>Montant</th><th></th></tr></thead><tbody>
        {d.expenses.map((e) => <tr key={e.id}><td>{dOnly(e.date)}</td><td>{e.description}</td><td>{e.category}</td><td>{ar(e.amount)}</td>
          <td className="text-right whitespace-nowrap"><button className="p-1.5 text-primary" onClick={() => setF({ ...e })}><Pencil className="size-4" /></button><button className="p-1.5 text-destructive" onClick={() => confirm("Supprimer cette dépense ?") && run(() => actions.deleteExpense(e.id), "Supprimée")}><Trash2 className="size-4" /></button></td></tr>)}
      </tbody></table> : <Empty text="Aucune dépense" />}
    </Panel>
    <Modal open={!!f} onClose={() => setF(null)} title={f?.id ? "Modifier la dépense" : "Nouvelle dépense"}>
      {f && <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (run(() => actions.saveExpense(f), "Dépense enregistrée")) setF(null); }}>
        <Field label="Description *"><input className="field" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <Field label="Catégorie"><select className="field" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{d.settings.expenseCategories.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Montant (Ar) *"><input className="field" type="number" min={0} value={f.amount} onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} /></Field>
        <Field label="Date"><input className="field" type="date" value={toInputDate(new Date(f.date))} onChange={(e) => setF({ ...f, date: new Date(e.target.value + "T12:00:00").toISOString() })} /></Field>
        <div className="flex justify-end"><Btn>Enregistrer</Btn></div>
      </form>}
    </Modal>
  </>);
}
