const TZ = "Indian/Antananarivo";
export const ar = (n: number) => `${new Intl.NumberFormat("fr-FR").format(Math.round(n)).replace(/\u202f/g, " ")} Ar`;
export const dt = (iso: string) => new Date(iso).toLocaleString("fr-FR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
export const dOnly = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { timeZone: TZ });
export const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const endOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
export const toInputDate = (d: Date) => { const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
export function downloadCSV(name: string, rows: (string | number)[][]) {
  const csv = "\ufeff" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = name; a.click();
}
