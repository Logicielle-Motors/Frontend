import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart, Package } from "lucide-react";
import { toast } from "sonner";
import { actions, useDB, type Sale } from "@/lib/store";
import { ar } from "@/lib/format";
import { Btn, Empty, PageHeader, Panel } from "@/components/app/kit";
import { ReceiptModal } from "@/components/app/Receipt";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/pos")({ head: () => ({ meta: [{ title: "Point de vente – Moto Pièces Pro" }] }), component: POS });

function POS() {
  const d = useDB();
  const [q, setQ] = useState(""); const [cat, setCat] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [received, setReceived] = useState("");
  const [sale, setSale] = useState<Sale | null>(null);
  const list = useMemo(() => d.products.filter((p) => (!cat || p.category === cat) &&
    `${p.name} ${p.ref} ${p.category} ${p.brand} ${p.model}`.toLowerCase().includes(q.toLowerCase())), [d.products, q, cat]);
  const lines = Object.entries(cart).map(([id, qty]) => ({ p: d.products.find((x) => x.id === id), qty })).filter((l) => l.p);
  const total = lines.reduce((s, l) => s + l.qty * (l.p?.sellPrice ?? 0), 0);
  const rec = Number(received) || 0;
  const change = rec - total;
  const setQty = (id: string, qty: number) => {
    const p = d.products.find((x) => x.id === id); if (!p) return;
    if (qty > p.qty) { toast.error(`Stock insuffisant (disponible : ${p.qty})`); return; }
    setCart((c) => { const n = { ...c }; if (qty <= 0) delete n[id]; else n[id] = qty; return n; });
  };
  const validate = () => {
    try {
      const s = actions.createSale(lines.map((l) => ({ productId: l.p!.id, qty: l.qty })), rec);
      setSale(s); setCart({}); setReceived(""); toast.success(`Vente ${s.number} enregistrée`);
    } catch (e) { toast.error((e as Error).message); }
  };
  return (
    <>
      <PageHeader title="Point de vente" subtitle="Encaissement rapide" />
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative min-w-60 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input className="field !pl-9" placeholder="Rechercher une pièce (nom, référence, modèle…)" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <select className="field !w-auto" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">Toutes catégories</option>{d.settings.categories.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
            {list.map((p) => (
              <button key={p.id} disabled={p.qty <= 0} onClick={() => setQty(p.id, (cart[p.id] ?? 0) + 1)}
                className="glass group p-3 text-left transition hover:glow disabled:opacity-40">
                <div className="mb-2 grid aspect-[4/3] place-items-center overflow-hidden rounded-lg bg-muted">
                  {p.photo ? <img src={p.photo} alt={p.name} className="size-full object-cover" /> : <Package className="size-8 text-muted-foreground" />}
                </div>
                <p className="line-clamp-2 text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.category}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold text-gradient">{ar(p.sellPrice)}</span>
                  <span className={cn("text-xs", p.qty <= p.minQty ? "text-warning" : "text-muted-foreground")}>Stock : {p.qty}</span>
                </div>
              </button>
            ))}
          </div>
          {!list.length && <Empty text="Aucun produit trouvé" />}
        </div>
        <Panel className="h-fit xl:sticky xl:top-6" title="Panier" right={<ShoppingCart className="size-4 text-muted-foreground" />}>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {lines.map(({ p, qty }) => (
              <div key={p!.id} className="rounded-lg bg-background/50 p-3">
                <div className="flex justify-between gap-2"><p className="text-sm font-medium">{p!.name}</p>
                  <button onClick={() => setQty(p!.id, 0)} className="text-muted-foreground hover:text-destructive" aria-label="Retirer"><Trash2 className="size-4" /></button></div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button className="grid size-7 place-items-center rounded-md bg-secondary" onClick={() => setQty(p!.id, qty - 1)}><Minus className="size-3" /></button>
                    <input className="field !h-7 !w-14 !px-1 text-center" type="number" value={qty} onChange={(e) => setQty(p!.id, Number(e.target.value))} />
                    <button className="grid size-7 place-items-center rounded-md bg-secondary" onClick={() => setQty(p!.id, qty + 1)}><Plus className="size-3" /></button>
                  </div>
                  <span className="text-sm font-semibold">{ar(qty * p!.sellPrice)}</span>
                </div>
              </div>
            ))}
            {!lines.length && <Empty text="Cliquez sur un produit pour l'ajouter" />}
          </div>
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between text-lg font-semibold"><span>Total à payer</span><span className="text-gradient">{ar(total)}</span></div>
            <input className="field !h-12 text-lg" type="number" placeholder="Montant reçu (Ar)" value={received} onChange={(e) => setReceived(e.target.value)} />
            <div className={cn("flex justify-between rounded-lg p-3 font-semibold", change >= 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
              <span>Monnaie à rendre</span><span>{received ? ar(Math.max(change, 0)) : "—"}</span></div>
            {received && change < 0 && <p className="text-xs text-destructive">Il manque {ar(-change)}</p>}
            <Btn className="h-12 w-full text-base" disabled={!lines.length || rec < total} onClick={validate}>Valider la vente</Btn>
          </div>
        </Panel>
      </div>
      <ReceiptModal sale={sale} onClose={() => setSale(null)} />
    </>
  );
}
