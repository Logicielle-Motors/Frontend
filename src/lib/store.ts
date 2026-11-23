import { useSyncExternalStore } from "react";

export type Product = {
  id: string; name: string; ref: string; category: string; brand: string; model: string;
  buyPrice: number; sellPrice: number; qty: number; minQty: number; supplierId: string; createdAt: string; photo?: string;
};
export type MovementType = "entree" | "vente" | "inventaire" | "annulation" | "approvisionnement" | "creation";
export type Movement = { id: string; productId: string; productName: string; type: MovementType; delta: number; note: string; date: string };
export type SaleItem = { productId: string; name: string; ref: string; qty: number; unitPrice: number; unitCost: number };
export type Sale = {
  id: string; number: string; date: string; items: SaleItem[]; total: number; received: number; change: number;
  status: "valide" | "annulee"; cancelReason?: string; cancelDate?: string;
};
export type Expense = { id: string; description: string; category: string; amount: number; date: string };
export type Supplier = { id: string; name: string; phone: string; email: string; address: string; note: string; createdAt: string };
export type Purchase = { id: string; supplierId: string; productId: string; productName: string; qty: number; unitCost: number; date: string };
export type InventoryLine = { productId: string; name: string; theo: number; counted: number };
export type Inventory = { id: string; date: string; lines: InventoryLine[] };
export type Settings = { shopName: string; address: string; phone: string; username: string; password: string; categories: string[]; expenseCategories: string[] };
export type DB = {
  version: 1; products: Product[]; movements: Movement[]; sales: Sale[]; expenses: Expense[]; suppliers: Supplier[];
  purchases: Purchase[]; inventories: Inventory[]; settings: Settings; invoiceCounter: number;
};

const KEY = "motopos-db";
const BACKUP_KEY = "motopos-autobackup";
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export const nowISO = () => new Date().toISOString();

export const DEFAULT_CATEGORIES = ["Piston","Segment","Cylindre","Vilebrequin","Embrayage","Chaîne","Pignon","Couronne","Bougie","Filtre à air","Frein","Plaquettes de frein","Batterie","Pneus","Chambre à air","Carburateur","Pièces électriques","Accessoires moto","Pièces scooter","Pièces moto à vitesse"];

export function emptyDB(): DB {
  return {
    version: 1, products: [], movements: [], sales: [], expenses: [], suppliers: [], purchases: [], inventories: [], invoiceCounter: 0,
    settings: { shopName: "Moto Pièces Pro", address: "Antananarivo, Madagascar", phone: "+261 34 00 000 00", username: "admin", password: "admin123",
      categories: [...DEFAULT_CATEGORIES], expenseCategories: ["Loyer","Électricité","Transport","Achat de matériel","Autres dépenses"] },
  };
}

function seed(): DB {
  const d = emptyDB();
  const s1: Supplier = { id: uid(), name: "Tana Moto Distribution", phone: "+261 32 11 222 33", email: "", address: "Behoririka", note: "", createdAt: nowISO() };
  const s2: Supplier = { id: uid(), name: "Scoot Import", phone: "+261 34 55 666 77", email: "", address: "Analakely", note: "", createdAt: nowISO() };
  d.suppliers = [s1, s2];
  const mk = (name: string, ref: string, category: string, brand: string, model: string, buy: number, sell: number, qty: number, min: number, sup: Supplier): Product =>
    ({ id: uid(), name, ref, category, brand, model, buyPrice: buy, sellPrice: sell, qty, minQty: min, supplierId: sup.id, createdAt: nowISO() });
  d.products = [
    mk("Bougie NGK C7HSA", "BG-001", "Bougie", "NGK", "Scooter 50cc / 125cc", 6000, 10000, 40, 10, s1),
    mk("Kit chaîne 428H", "CH-428", "Chaîne", "DID", "Honda CG 125", 45000, 70000, 8, 3, s1),
    mk("Plaquettes de frein avant", "PF-110", "Plaquettes de frein", "Brembo", "Yamaha Mio", 12000, 20000, 15, 5, s2),
    mk("Filtre à air scooter", "FA-050", "Filtre à air", "Sym", "Sym Orbit", 8000, 15000, 2, 4, s2),
    mk("Piston complet 52mm", "PS-052", "Piston", "Kymco", "Kymco Agility", 35000, 55000, 6, 2, s2),
    mk("Batterie 12V 5Ah", "BT-12V5", "Batterie", "Yuasa", "Universel", 60000, 90000, 0, 2, s1),
  ];
  d.movements = d.products.map((p) => ({ id: uid(), productId: p.id, productName: p.name, type: "creation" as const, delta: p.qty, note: "Stock initial", date: nowISO() }));
  return d;
}

let db: DB | null = null;
const listeners = new Set<() => void>();
const SERVER_DB = emptyDB();

function load(): DB {
  if (db) return db;
  try {
    const raw = localStorage.getItem(KEY);
    db = raw ? { ...emptyDB(), ...(JSON.parse(raw) as DB) } : seed();
  } catch { db = seed(); }
  if (!localStorage.getItem(KEY)) localStorage.setItem(KEY, JSON.stringify(db));
  return db;
}
function persist(next: DB) {
  localStorage.setItem(KEY, JSON.stringify(next));
  const today = new Date().toDateString();
  try {
    const b = localStorage.getItem(BACKUP_KEY);
    const parsed = b ? (JSON.parse(b) as { day: string }) : null;
    if (!parsed || parsed.day !== today) localStorage.setItem(BACKUP_KEY, JSON.stringify({ day: today, date: nowISO(), data: next }));
  } catch { /* ignore */ }
}
export function getDB() { return load(); }
export function useDB(): DB {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, load, () => SERVER_DB);
}
/** Transaction: mutate a copy; if it throws nothing is saved. */
export function commit(mut: (d: DB) => void) {
  const next = structuredClone(load());
  mut(next);
  db = next;
  persist(next);
  listeners.forEach((l) => l());
}
/** For tests */
export function _setDB(d: DB) { db = d; }

function mv(d: DB, p: Product, type: MovementType, delta: number, note: string) {
  d.movements.unshift({ id: uid(), productId: p.id, productName: p.name, type, delta, note, date: nowISO() });
}
const find = (d: DB, id: string) => { const p = d.products.find((x) => x.id === id); if (!p) throw new Error("Produit introuvable"); return p; };

export const actions = {
  saveProduct(input: Omit<Product, "id" | "createdAt"> & { id?: string }) {
    commit((d) => {
      if (!input.name.trim() || !input.ref.trim()) throw new Error("Nom et référence obligatoires");
      if (d.products.some((p) => p.ref.toLowerCase() === input.ref.toLowerCase() && p.id !== input.id)) throw new Error("Cette référence existe déjà");
      if (input.id) {
        const p = find(d, input.id);
        const { qty: _q, ...rest } = input;
        Object.assign(p, rest);
      } else {
        const p: Product = { ...input, id: uid(), createdAt: nowISO() };
        d.products.unshift(p);
        mv(d, p, "creation", p.qty, "Création du produit");
      }
      if (input.category && !d.settings.categories.includes(input.category)) d.settings.categories.push(input.category);
    });
  },
  deleteProduct(id: string) { commit((d) => { d.products = d.products.filter((p) => p.id !== id); }); },
  addStock(id: string, qty: number, note: string) {
    commit((d) => { if (qty <= 0) throw new Error("Quantité invalide"); const p = find(d, id); p.qty += qty; mv(d, p, "entree", qty, note || "Ajout de stock"); });
  },
  createSale(items: { productId: string; qty: number }[], received: number): Sale {
    let sale!: Sale;
    commit((d) => {
      if (!items.length) throw new Error("Le panier est vide");
      const lines: SaleItem[] = items.map((it) => {
        const p = find(d, it.productId);
        if (it.qty <= 0) throw new Error("Quantité invalide");
        if (it.qty > p.qty) throw new Error(`Stock insuffisant pour ${p.name} (disponible : ${p.qty})`);
        return { productId: p.id, name: p.name, ref: p.ref, qty: it.qty, unitPrice: p.sellPrice, unitCost: p.buyPrice };
      });
      const total = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
      if (received < total) throw new Error("Montant reçu insuffisant");
      d.invoiceCounter += 1;
      const y = new Date().getFullYear();
      const number = `FAC-${y}-${String(d.invoiceCounter).padStart(5, "0")}`;
      if (d.sales.some((s) => s.number === number)) throw new Error("Numéro de facture en double");
      sale = { id: uid(), number, date: nowISO(), items: lines, total, received, change: received - total, status: "valide" };
      lines.forEach((l) => { const p = find(d, l.productId); p.qty -= l.qty; mv(d, p, "vente", -l.qty, number); });
      d.sales.unshift(sale);
    });
    return sale;
  },
  cancelSale(id: string, reason: string) {
    commit((d) => {
      const s = d.sales.find((x) => x.id === id);
      if (!s || s.status === "annulee") throw new Error("Vente introuvable ou déjà annulée");
      s.status = "annulee"; s.cancelReason = reason; s.cancelDate = nowISO();
      s.items.forEach((l) => { const p = d.products.find((x) => x.id === l.productId); if (p) { p.qty += l.qty; mv(d, p, "annulation", l.qty, `Annulation ${s.number}`); } });
    });
  },
  saveExpense(e: Omit<Expense, "id"> & { id?: string }) {
    commit((d) => {
      if (!e.description.trim() || e.amount <= 0) throw new Error("Description et montant obligatoires");
      if (e.id) Object.assign(d.expenses.find((x) => x.id === e.id) ?? {}, e);
      else d.expenses.unshift({ ...e, id: uid() });
    });
  },
  deleteExpense(id: string) { commit((d) => { d.expenses = d.expenses.filter((x) => x.id !== id); }); },
  saveSupplier(s: Omit<Supplier, "id" | "createdAt"> & { id?: string }) {
    commit((d) => {
      if (!s.name.trim()) throw new Error("Nom obligatoire");
      if (s.id) Object.assign(d.suppliers.find((x) => x.id === s.id) ?? {}, s);
      else d.suppliers.unshift({ ...s, id: uid(), createdAt: nowISO() });
    });
  },
  deleteSupplier(id: string) { commit((d) => { d.suppliers = d.suppliers.filter((x) => x.id !== id); }); },
  receivePurchase(supplierId: string, productId: string, qty: number, unitCost: number, updateBuyPrice: boolean) {
    commit((d) => {
      if (qty <= 0 || unitCost < 0) throw new Error("Quantité ou prix invalide");
      const p = find(d, productId);
      const sup = d.suppliers.find((x) => x.id === supplierId); if (!sup) throw new Error("Fournisseur introuvable");
      p.qty += qty; if (updateBuyPrice) p.buyPrice = unitCost;
      d.purchases.unshift({ id: uid(), supplierId, productId, productName: p.name, qty, unitCost, date: nowISO() });
      mv(d, p, "approvisionnement", qty, `Réception ${sup.name}`);
    });
  },
  validateInventory(counts: Record<string, number>) {
    commit((d) => {
      const lines: InventoryLine[] = [];
      d.products.forEach((p) => {
        const c = counts[p.id]; if (c === undefined || Number.isNaN(c)) return;
        lines.push({ productId: p.id, name: p.name, theo: p.qty, counted: c });
        const delta = c - p.qty;
        if (delta !== 0) { p.qty = c; mv(d, p, "inventaire", delta, "Correction d'inventaire"); }
      });
      if (!lines.length) throw new Error("Aucune quantité saisie");
      d.inventories.unshift({ id: uid(), date: nowISO(), lines });
    });
  },
  saveSettings(s: Partial<Settings>) { commit((d) => { Object.assign(d.settings, s); }); },
  restore(data: DB) { commit((d) => { if (!data || !Array.isArray(data.products)) throw new Error("Fichier de sauvegarde invalide"); Object.assign(d, emptyDB(), data); }); },
  restoreAuto() { const b = localStorage.getItem(BACKUP_KEY); if (!b) throw new Error("Aucune sauvegarde automatique"); actions.restore((JSON.parse(b) as { data: DB }).data); },
  autoBackupInfo(): string | null { try { const b = localStorage.getItem(BACKUP_KEY); return b ? (JSON.parse(b) as { date: string }).date : null; } catch { return null; } },
  reset() { commit((d) => { const keep = d.settings; Object.assign(d, emptyDB(), { settings: keep }); }); },
};

// ---------- Auth ----------
const SESSION = "motopos-session";
export const auth = {
  login(u: string, p: string, remember: boolean) {
    const s = load().settings;
    if (u.trim() !== s.username || p !== s.password) return false;
    (remember ? localStorage : sessionStorage).setItem(SESSION, "1");
    return true;
  },
  isLogged() { return typeof window !== "undefined" && (localStorage.getItem(SESSION) === "1" || sessionStorage.getItem(SESSION) === "1"); },
  logout() { localStorage.removeItem(SESSION); sessionStorage.removeItem(SESSION); },
};

// ---------- Calculs ----------
export type Stats = { sales: number; pieces: number; revenue: number; cogs: number; gross: number; expenses: number; net: number };
export function computeStats(d: Pick<DB, "sales" | "expenses">, from: Date, to: Date): Stats {
  const inR = (iso: string) => { const t = new Date(iso).getTime(); return t >= from.getTime() && t <= to.getTime(); };
  const sales = d.sales.filter((s) => s.status === "valide" && inR(s.date));
  const revenue = sales.reduce((a, s) => a + s.total, 0);
  const cogs = sales.reduce((a, s) => a + s.items.reduce((b, l) => b + l.qty * l.unitCost, 0), 0);
  const pieces = sales.reduce((a, s) => a + s.items.reduce((b, l) => b + l.qty, 0), 0);
  const expenses = d.expenses.filter((e) => inR(e.date)).reduce((a, e) => a + e.amount, 0);
  const gross = revenue - cogs;
  return { sales: sales.length, pieces, revenue, cogs, gross, expenses, net: gross - expenses };
}
