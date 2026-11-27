import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { actions, getDB, useDB } from "@/lib/store";
import { dt, errorText, tx } from "@/lib/format";
import { Btn, Field, PageHeader, Panel } from "@/components/app/kit";
import { LanguageToggle } from "@/components/app/LanguageToggle";

export const Route = createFileRoute("/_app/parametres")({ head: () => ({ meta: [{ title: "Logicielle Motors" }] }), component: Par });

function Par() {
  const { settings } = useDB();
  const language = settings.language;
  const msg = (fr: string, mg: string) => tx(language, fr, mg);
  const [s, setS] = useState({ ...settings, categories: settings.categories.join(", "), expenseCategories: settings.expenseCategories.join(", ") });
  const run = (fn: () => void, success: string) => { try { fn(); toast.success(success); } catch (e) { toast.error(errorText(e, language)); } };
  const split = (x: string) => x.split(",").map((v) => v.trim()).filter(Boolean);
  const backup = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(getDB())], { type: "application/json" })); a.download = `sauvegarde_${new Date().toISOString().slice(0, 10)}.json`; a.click(); };
  const restore = (file?: File) => { if (!file || !confirm(msg("Remplacer toutes les données actuelles ?", "Hosoloina avokoa ve ny angona rehetra ?"))) return; file.text().then((t) => run(() => actions.restore(JSON.parse(t)), msg("Données restaurées", "Naverina ny angona"))); };
  const auto = actions.autoBackupInfo();
  return (<>
    <PageHeader title={msg("Paramètres", "Fikirana")} />
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title={msg("Magasin et compte", "Fivarotana sy kaonty")}>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (!s.username.trim() || s.password.length < 4) { toast.error(msg("Identifiant requis, mot de passe ≥ 4 caractères", "Ilaina ny solon'anarana, ary tsy maintsy misy tarehintsoratra 4 farafahakeliny ny tenimiafina")); return; } run(() => actions.saveSettings({ ...s, language, categories: split(s.categories), expenseCategories: split(s.expenseCategories) }), msg("Paramètres enregistrés", "Voatahiry ny fikirana")); }}>
          <Field label={msg("Nom du magasin", "Anaran'ny fivarotana")}><input className="field" value={s.shopName} onChange={(e) => setS({ ...s, shopName: e.target.value })} /></Field>
          <Field label={msg("Adresse", "Adiresy")}><input className="field" value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} /></Field>
          <Field label={msg("Téléphone", "Finday")}><input className="field" value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} /></Field>
          <Field label={msg("Langue", "Fiteny")}><LanguageToggle language={language} label={msg("Choisir la langue", "Fidio ny fiteny")} onChange={(language) => { setS({ ...s, language }); actions.saveSettings({ language }); }} /></Field>
          <Field label={msg("Identifiant", "Solon'anarana")}><input className="field" value={s.username} onChange={(e) => setS({ ...s, username: e.target.value })} /></Field>
          <Field label={msg("Mot de passe", "Tenimiafina")}><input className="field" type="password" value={s.password} onChange={(e) => setS({ ...s, password: e.target.value })} /></Field>
          <Field label={msg("Catégories de produits (séparées par des virgules)", "Sokajin'entana (saraho amin'ny faingo)")}><textarea className="field !h-24 py-2" value={s.categories} onChange={(e) => setS({ ...s, categories: e.target.value })} /></Field>
          <Field label={msg("Catégories de dépenses", "Sokajin'ny fandaniana")}><input className="field" value={s.expenseCategories} onChange={(e) => setS({ ...s, expenseCategories: e.target.value })} /></Field>
          <div className="flex justify-end"><Btn>{msg("Enregistrer", "Tehirizo")}</Btn></div>
        </form>
      </Panel>
      <Panel title={msg("Sauvegarde et restauration", "Fitahirizana sy famerenana angona")}>
        <div className="space-y-4 text-sm">
          <Btn className="w-full" onClick={backup}>{msg("Télécharger une sauvegarde", "Hisintona ny rakitra fitahirizana")}</Btn>
          <label className="block"><span className="text-xs text-muted-foreground">{msg("Restaurer depuis un fichier", "Mamerina avy amin'ny rakitra")}</span><input type="file" accept=".json" className="field mt-1 py-2" onChange={(e) => restore(e.target.files?.[0])} /></label>
          <p className="text-muted-foreground">{msg("Sauvegarde automatique", "Fitahirizana mandeha ho azy")} : {auto ? dt(auto, language) : msg("aucune", "tsy misy")}</p>
          <Btn variant="ghost" className="w-full" disabled={!auto} onClick={() => confirm(msg("Restaurer la sauvegarde automatique ?", "Haverina ve ny fitahirizana mandeha ho azy ?")) && run(() => actions.restoreAuto(), msg("Restauré", "Naverina"))}>{msg("Restaurer la sauvegarde automatique", "Avereno ny fitahirizana mandeha ho azy")}</Btn>
          <Btn variant="danger" className="w-full" onClick={() => confirm(msg("Effacer toutes les données (produits, ventes…) ?", "Fafana avokoa ve ny angona (entana, varotra…) ?")) && run(() => actions.reset(), msg("Données effacées", "Voafafa ny angona"))}>{msg("Réinitialiser les données", "Fafao ny angona rehetra")}</Btn>
        </div>
      </Panel>
    </div>
  </>);
}
