import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { actions, getDB, useDB } from "@/lib/store";
import { dt } from "@/lib/format";
import { Btn, Field, PageHeader, Panel } from "@/components/app/kit";

export const Route = createFileRoute("/_app/parametres")({ head: () => ({ meta: [{ title: "Logicielle Motors" }] }), component: Par });

function Par() {
  const { settings } = useDB();
  const [s, setS] = useState({ ...settings, categories: settings.categories.join(", "), expenseCategories: settings.expenseCategories.join(", ") });
  const run = (fn: () => void, m: string) => { try { fn(); toast.success(m); } catch (e) { toast.error((e as Error).message); } };
  const split = (x: string) => x.split(",").map((v) => v.trim()).filter(Boolean);
  const backup = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(getDB())], { type: "application/json" })); a.download = `sauvegarde_${new Date().toISOString().slice(0, 10)}.json`; a.click(); };
  const restore = (file?: File) => { if (!file || !confirm("Remplacer toutes les données actuelles ?")) return; file.text().then((t) => run(() => actions.restore(JSON.parse(t)), "Données restaurées")); };
  const auto = actions.autoBackupInfo();
  return (<>
    <PageHeader title="Paramètres" />
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Magasin et compte">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (!s.username.trim() || s.password.length < 4) { toast.error("Identifiant requis, mot de passe ≥ 4 caractères"); return; } run(() => actions.saveSettings({ ...s, categories: split(s.categories), expenseCategories: split(s.expenseCategories) }), "Paramètres enregistrés"); }}>
          <Field label="Nom du magasin"><input className="field" value={s.shopName} onChange={(e) => setS({ ...s, shopName: e.target.value })} /></Field>
          <Field label="Adresse"><input className="field" value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} /></Field>
          <Field label="Téléphone"><input className="field" value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} /></Field>
          <Field label="Langue / Fiteny"><select className="field" value={s.language} onChange={(e) => setS({ ...s, language: e.target.value as "fr" | "mg" })}><option value="fr">Français</option><option value="mg">Malagasy</option></select></Field>
          <Field label="Identifiant"><input className="field" value={s.username} onChange={(e) => setS({ ...s, username: e.target.value })} /></Field>
          <Field label="Mot de passe"><input className="field" type="password" value={s.password} onChange={(e) => setS({ ...s, password: e.target.value })} /></Field>
          <Field label="Catégories de produits (séparées par des virgules)"><textarea className="field !h-24 py-2" value={s.categories} onChange={(e) => setS({ ...s, categories: e.target.value })} /></Field>
          <Field label="Catégories de dépenses"><input className="field" value={s.expenseCategories} onChange={(e) => setS({ ...s, expenseCategories: e.target.value })} /></Field>
          <div className="flex justify-end"><Btn>Enregistrer</Btn></div>
        </form>
      </Panel>
      <Panel title="Sauvegarde et restauration">
        <div className="space-y-4 text-sm">
          <Btn className="w-full" onClick={backup}>Télécharger une sauvegarde</Btn>
          <label className="block"><span className="text-xs text-muted-foreground">Restaurer depuis un fichier</span><input type="file" accept=".json" className="field mt-1 py-2" onChange={(e) => restore(e.target.files?.[0])} /></label>
          <p className="text-muted-foreground">Sauvegarde automatique : {auto ? dt(auto) : "aucune"}</p>
          <Btn variant="ghost" className="w-full" disabled={!auto} onClick={() => confirm("Restaurer la sauvegarde automatique ?") && run(() => actions.restoreAuto(), "Restauré")}>Restaurer la sauvegarde automatique</Btn>
          <Btn variant="danger" className="w-full" onClick={() => confirm("Effacer toutes les données (produits, ventes…) ?") && run(() => actions.reset(), "Données effacées")}>Réinitialiser les données</Btn>
        </div>
      </Panel>
    </div>
  </>);
}
