import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
export function Panel({ children, className, title, right }: { children: ReactNode; className?: string; title?: string; right?: ReactNode }) {
  return (
    <div className={cn("glass p-5 animate-fade-up", className)}>
      {title && <div className="mb-4 flex items-center justify-between gap-2"><h2 className="font-medium">{title}</h2>{right}</div>}
      {children}
    </div>
  );
}
export function Stat({ label, value, icon, tone = "primary", hint }: { label: string; value: string; icon: ReactNode; tone?: "primary" | "accent" | "success" | "warning" | "destructive"; hint?: string }) {
  const tones = { primary: "bg-primary/15 text-primary", accent: "bg-accent/15 text-accent", success: "bg-success/15 text-success", warning: "bg-warning/15 text-warning", destructive: "bg-destructive/15 text-destructive" };
  return (
    <div className="glass p-4 animate-fade-up transition hover:glow">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <span className={cn("grid size-9 place-items-center rounded-lg", tones[tone])}>{icon}</span>
      </div>
      <p className="mt-2 text-xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return <label className={cn("block space-y-1.5", className)}><span className="text-xs text-muted-foreground">{label}</span>{children}</label>;
}
export function Btn({ children, variant = "glow", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "glow" | "ghost" | "danger" }) {
  const v = { glow: "btn-glow", ghost: "border border-border bg-secondary/60 hover:bg-secondary text-foreground", danger: "bg-destructive/90 hover:bg-destructive text-destructive-foreground" };
  return <button {...p} className={cn("inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition disabled:opacity-50", v[variant], className)}>{children}</button>;
}
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={cn("glass glow max-h-[90vh] overflow-y-auto border-border", wide ? "sm:max-w-3xl" : "sm:max-w-lg")}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
export function Badge({ children, tone = "primary" }: { children: ReactNode; tone?: "primary" | "success" | "warning" | "destructive" | "muted" }) {
  const t = { primary: "bg-primary/15 text-primary", success: "bg-success/15 text-success", warning: "bg-warning/15 text-warning", destructive: "bg-destructive/15 text-destructive", muted: "bg-muted text-muted-foreground" };
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", t[tone])}>{children}</span>;
}
export const Empty = ({ text }: { text: string }) => <p className="py-10 text-center text-sm text-muted-foreground">{text}</p>;
