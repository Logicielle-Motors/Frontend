import { describe, it, expect, beforeEach } from "vitest";
import { _setDB, emptyDB, actions, getDB, computeStats, uid } from "@/lib/store";

function setup() {
  const d = emptyDB();
  d.products.push({ id: "p1", name: "Bougie", ref: "B1", category: "Bougie", brand: "", model: "", buyPrice: 6000, sellPrice: 10000, qty: 5, minQty: 1, supplierId: "", createdAt: new Date().toISOString() });
  d.suppliers.push({ id: "s1", name: "F", phone: "", email: "", address: "", note: "", createdAt: "" });
  _setDB(d);
}
const range = () => computeStats(getDB(), new Date(0), new Date(Date.now() + 1e9));

describe("règles de gestion", () => {
  beforeEach(setup);
  it("la vente calcule la monnaie à rendre", () => {
    const s = actions.createSale([{ productId: "p1", qty: 3 }], 50000);
    expect(s.total).toBe(30000); expect(s.change).toBe(20000);
  });
  it("la vente diminue le stock", () => { actions.createSale([{ productId: "p1", qty: 2 }], 20000); expect(getDB().products[0]?.qty).toBe(3); });
  it("refuse une vente au-delà du stock", () => { expect(() => actions.createSale([{ productId: "p1", qty: 6 }], 1e6)).toThrow(); expect(getDB().products[0]?.qty).toBe(5); });
  it("bénéfice net = CA - coût - dépenses", () => {
    actions.createSale([{ productId: "p1", qty: 2 }], 20000);
    actions.saveExpense({ description: "Loyer", category: "Loyer", amount: 3000, date: new Date().toISOString() });
    const st = range(); expect(st.revenue).toBe(20000); expect(st.gross).toBe(8000); expect(st.net).toBe(5000);
  });
  it("le prix d'achat historique est conservé", () => {
    actions.createSale([{ productId: "p1", qty: 1 }], 10000);
    actions.receivePurchase("s1", "p1", 10, 9000, true);
    expect(range().gross).toBe(4000); expect(getDB().products[0]?.qty).toBe(14);
  });
  it("l'annulation remet le stock", () => { const s = actions.createSale([{ productId: "p1", qty: 2 }], 20000); actions.cancelSale(s.id, "x"); expect(getDB().products[0]?.qty).toBe(5); expect(range().revenue).toBe(0); });
  it("l'inventaire corrige avec un mouvement", () => { actions.validateInventory({ p1: 4 }); expect(getDB().products[0]?.qty).toBe(4); expect(getDB().movements[0]?.delta).toBe(-1); void uid; });
});
