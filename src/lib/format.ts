const TZ = "Indian/Antananarivo";
export type Language = "fr" | "mg";
export const tx = (language: Language, fr: string, mg: string) => language === "mg" ? mg : fr;
export function errorText(error: unknown, language: Language) {
  const message = error instanceof Error ? error.message : "";
  if (language === "fr") return message || "Une erreur est survenue";
  const translations: Record<string, string> = {
    "Produit introuvable": "Tsy hita ilay entana",
    "Nom et référence obligatoires": "Tsy maintsy fenoina ny anarana sy ny laharana",
    "Cette référence existe déjà": "Efa misy io laharana io",
    "Quantité invalide": "Tsy mety ny isan'ny entana",
    "Le panier est vide": "Foana ny harona",
    "Montant reçu insuffisant": "Tsy ampy ny vola voaray",
    "Numéro de facture en double": "Efa misy io laharan'ny faktiora io",
    "Vente introuvable ou déjà annulée": "Tsy hita na efa nofoanana io varotra io",
    "Description et montant obligatoires": "Tsy maintsy fenoina ny fanazavana sy ny vola",
    "Nom obligatoire": "Tsy maintsy fenoina ny anarana",
    "Quantité ou prix invalide": "Tsy mety ny isan'ny entana na ny vidiny",
    "Fournisseur introuvable": "Tsy hita ilay mpamatsy",
    "Aucune quantité saisie": "Tsy mbola nampidirina ny isan'ny entana",
    "Fichier de sauvegarde invalide": "Tsy mety ilay rakitra fitahirizana",
    "Aucune sauvegarde automatique": "Tsy misy fitahirizana mandeha ho azy",
  };
  if (message.startsWith("Stock insuffisant pour ")) {
    const match = message.match(/^Stock insuffisant pour (.+) \(disponible : (\d+)\)$/);
    return match ? `Tsy ampy ny tahiry ho an'ny ${match[1]} (misy ${match[2]})` : "Tsy ampy ny tahiry";
  }
  return translations[message] ?? (message || "Nisy hadisoana tsy fantatra");
}
export const ar = (n: number) => `${new Intl.NumberFormat("fr-FR").format(Math.round(n)).replace(/\u202f/g, " ")} Ar`;
export const dt = (iso: string, language: Language = "fr") => new Date(iso).toLocaleString(language === "mg" ? "mg-MG" : "fr-FR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
export const dOnly = (iso: string, language: Language = "fr") => new Date(iso).toLocaleDateString(language === "mg" ? "mg-MG" : "fr-FR", { timeZone: TZ });
export const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const endOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
export const toInputDate = (d: Date) => { const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
export function downloadCSV(name: string, rows: (string | number)[][]) {
  const csv = "\ufeff" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = name; a.click();
}
