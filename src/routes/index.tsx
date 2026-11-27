import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Logicielle Motors" },
    { name: "description", content: "Connectez-vous à votre logiciel de gestion de stock et de caisse." },
    { property: "og:title", content: "Connexion – Moto Pièces Pro" },
    { property: "og:description", content: "Gestion de stock et point de vente pour pièces moto et scooter." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [u, setU] = useState(""); const [p, setP] = useState("");
  const [show, setShow] = useState(false); const [remember, setRemember] = useState(true);
  useEffect(() => { if (auth.isLogged()) navigate({ to: "/dashboard", replace: true }); }, [navigate]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.login(u, p, remember)) { toast.success("Connexion réussie"); navigate({ to: "/dashboard" }); }
    else toast.error("Identifiant ou mot de passe incorrect");
  };
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="glass glow relative w-full max-w-sm overflow-hidden px-7 pb-24 pt-9 animate-fade-up">
        <div className="mx-auto grid size-20 place-items-center rounded-2xl bg-gradient-primary glow"><Lock className="size-9" /></div>
        <h1 className="mt-6 text-center text-2xl font-bold">Connexion</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Accédez à votre espace de gestion</p>
        <div className="mt-7 space-y-4">
          <div className="relative"><User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input className="field !h-12 !pl-10" placeholder="Nom d'utilisateur" value={u} onChange={(e) => setU(e.target.value)} autoFocus /></div>
          <div className="relative"><Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input className="field !h-12 !px-10" type={show ? "text" : "password"} placeholder="Mot de passe" value={p} onChange={(e) => setP(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Afficher">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
          <div className="flex items-center text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-primary" />Se souvenir de moi</label>
          </div>
          <button className="btn-glow h-12 w-full rounded-xl text-base font-semibold">Se connecter</button>
        </div>
        <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full" viewBox="0 0 400 100" preserveAspectRatio="none">
          <path d="M0 70 C 90 20, 180 100, 270 50 S 400 40, 400 40 V100 H0Z" fill="var(--primary)" opacity=".12" />
          <path d="M0 85 C 120 45, 220 110, 400 60 V100 H0Z" fill="var(--primary)" opacity=".2" />
        </svg>
      </form>
    </div>
  );
}
