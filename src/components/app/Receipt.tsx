import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import type { Sale } from "@/lib/store";
import { useDB } from "@/lib/store";
import { ar, dt } from "@/lib/format";
import { Btn, Modal } from "./kit";

function ReceiptBody({ sale }: { sale: Sale }) {
  const { settings } = useDB();
  return (
    <div className="space-y-3 text-sm">
      <div className="text-center">
        <p className="text-lg font-bold">{settings.shopName}</p>
        <p className="text-xs opacity-70">{settings.address}</p>
        <p className="text-xs opacity-70">{settings.phone}</p>
      </div>
      <div className="flex justify-between border-y border-dashed border-border py-2 text-xs">
        <span>N° {sale.number}</span><span>{dt(sale.date)}</span>
      </div>
      {sale.status === "annulee" && <p className="text-center font-bold">*** VENTE ANNULÉE ***</p>}
      <table className="w-full text-xs">
        <thead><tr className="text-left"><th>Article</th><th className="text-right">Qté</th><th className="text-right">P.U.</th><th className="text-right">Sous-total</th></tr></thead>
        <tbody>{sale.items.map((l) => (
          <tr key={l.productId}><td className="py-1">{l.name}</td><td className="text-right">{l.qty}</td><td className="text-right">{ar(l.unitPrice)}</td><td className="text-right">{ar(l.qty * l.unitPrice)}</td></tr>
        ))}</tbody>
      </table>
      <div className="space-y-1 border-t border-dashed border-border pt-2">
        <div className="flex justify-between font-bold"><span>TOTAL</span><span>{ar(sale.total)}</span></div>
        <div className="flex justify-between"><span>Montant reçu</span><span>{ar(sale.received)}</span></div>
        <div className="flex justify-between font-semibold"><span>Monnaie rendue</span><span>{ar(sale.change)}</span></div>
      </div>
      <p className="pt-2 text-center text-xs opacity-70">Merci de votre visite !</p>
    </div>
  );
}

export function ReceiptModal({ sale, onClose }: { sale: Sale | null; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const print = (fmt: "a4" | "80mm") => { document.body.dataset.print = fmt; setTimeout(() => window.print(), 50); };
  return (
    <>
      <Modal open={!!sale} onClose={onClose} title="Facture">
        {sale && <div className="rounded-lg bg-background/60 p-4"><ReceiptBody sale={sale} /></div>}
        <div className="flex flex-wrap justify-end gap-2">
          <Btn variant="ghost" onClick={() => print("80mm")}><Printer className="size-4" />Ticket 80 mm</Btn>
          <Btn onClick={() => print("a4")}><Printer className="size-4" />Imprimer (A4)</Btn>
        </div>
      </Modal>
      {mounted && sale && createPortal(<div className="print-area"><ReceiptBody sale={sale} /></div>, document.body)}
    </>
  );
}
