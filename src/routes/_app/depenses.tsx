import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { actions, useDB, type Expense } from "@/lib/store";
import { ar, dOnly, errorText, toInputDate, tx } from "@/lib/format";
import { Btn, Empty, Field, Modal, PageHeader, Panel } from "@/components/app/kit";

export const Route = createFileRoute("/_app/depenses")({ head: () => ({ meta: [{ title: "Logicielle Motors" }] }), component: Dep });
type F = Omit<Expense, "id"> & { id?: string };

function Dep() {
  const d = useDB();
  const language = d.settings.language;
  const msg = (fr: string, mg: string) => tx(language, fr, mg);
  const [f, setF] = useState<F | null>(null);
  const run = (fn: () => void, success: string) => { try { fn(); toast.success(success); return true; } catch (e) { toast.error(errorText(e, language)); return false; } };
  const total = d.expenses.reduce((a, e) => a + e.amount, 0);
  return (<>
    <PageHeader title={msg("Dépenses", "Fandaniana")} subtitle={`${msg("Total", "Fitambarany")} : ${ar(total)}`} actions={<Btn onClick={() => setF({ description: "", category: d.settings.expenseCategories[0] ?? "", amount: 0, date: new Date().toISOString() })}><Plus className="size-4" />{msg("Nouvelle dépense", "Fandaniana vaovao")}</Btn>} />
    <Panel>
      {d.expenses.length ? <table className="table-pro w-full"><thead><tr><th>{msg("Date", "Daty")}</th><th>{msg("Description", "Fanazavana")}</th><th>{msg("Catégorie", "Sokajy")}</th><th>{msg("Montant", "Vola")}</th><th></th></tr></thead><tbody>
        {d.expenses.map((e) => <tr key={e.id}><td>{dOnly(e.date, language)}</td><td>{e.description}</td><td>{e.category}</td><td>{ar(e.amount)}</td>
          <td className="text-right whitespace-nowrap"><button className="p-1.5 text-primary" title={msg("Modifier", "Hanova")} onClick={() => setF({ ...e })}><Pencil className="size-4" /></button><button className="p-1.5 text-destructive" title={msg("Supprimer", "Hamafa")} onClick={() => confirm(msg("Supprimer cette dépense ?", "Hofafana ve ity fandaniana ity ?")) && run(() => actions.deleteExpense(e.id), msg("Supprimée", "Voafafa"))}><Trash2 className="size-4" /></button></td></tr>)}
      </tbody></table> : <Empty text={msg("Aucune dépense", "Mbola tsy nisy fandaniana")} />}
    </Panel>
    <Modal open={!!f} onClose={() => setF(null)} title={f?.id ? msg("Modifier la dépense", "Hanova ny fandaniana") : msg("Nouvelle dépense", "Fandaniana vaovao")}>
      {f && <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (run(() => actions.saveExpense(f), msg("Dépense enregistrée", "Voatahiry ny fandaniana"))) setF(null); }}>
        <Field label={msg("Description *", "Fanazavana *")}><input className="field" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <Field label={msg("Catégorie", "Sokajy")}><select className="field" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{d.settings.expenseCategories.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label={msg("Montant (Ar) *", "Vola (Ar) *")}><input className="field" type="number" min={0} value={f.amount} onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} /></Field>
        <Field label={msg("Date", "Daty")}><input className="field" type="date" value={toInputDate(new Date(f.date))} onChange={(e) => setF({ ...f, date: new Date(e.target.value + "T12:00:00").toISOString() })} /></Field>
        <div className="flex justify-end"><Btn>{msg("Enregistrer", "Tehirizo")}</Btn></div>
      </form>}
    </Modal>
  </>);
}
