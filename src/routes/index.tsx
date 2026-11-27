import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { auth, useDB } from "@/lib/store";
import { tx } from "@/lib/format";

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
  const { settings } = useDB();
  const msg = (fr: string, mg: string) => tx(settings.language, fr, mg);
  const [u, setU] = useState(""); const [p, setP] = useState("");
  const [show, setShow] = useState(false); const [remember, setRemember] = useState(true);
  useEffect(() => { if (auth.isLogged()) navigate({ to: "/dashboard", replace: true }); }, [navigate]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.login(u, p, remember)) { toast.success(msg("Connexion réussie", "Tafiditra soa aman-tsara")); navigate({ to: "/dashboard" }); }
    else toast.error(msg("Identifiant ou mot de passe incorrect", "Diso ny solon'anarana na ny tenimiafina"));
  };
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="glass glow relative w-full max-w-sm overflow-hidden px-7 pb-24 pt-9 animate-fade-up">
        <div className="mx-auto grid size-20 place-items-center rounded-2xl bg-gradient-primary glow"><Lock className="size-9" /></div>
        <h1 className="mt-6 text-center text-2xl font-bold">{msg("Connexion", "Fidirana")}</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">{msg("Accédez à votre espace de gestion", "Midira ao amin'ny sehatra fitantanana")}</p>
        <div className="mt-7 space-y-4">
          <div className="relative"><User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input className="field !h-12 !pl-10" placeholder={msg("Nom d'utilisateur", "Solon'anarana")} value={u} onChange={(e) => setU(e.target.value)} autoFocus /></div>
          <div className="relative"><Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input className="field !h-12 !px-10" type={show ? "text" : "password"} placeholder={msg("Mot de passe", "Tenimiafina")} value={p} onChange={(e) => setP(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={show ? msg("Masquer", "Afeno") : msg("Afficher", "Asehoy")}>{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
          <div className="flex items-center text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-primary" />{msg("Se souvenir de moi", "Tsarovy aho")}</label>
          </div>
          <button className="btn-glow h-12 w-full rounded-xl text-base font-semibold">{msg("Se connecter", "Hiditra")}</button>
        </div>
        <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full" viewBox="0 0 400 100" preserveAspectRatio="none">
          <path d="M0 70 C 90 20, 180 100, 270 50 S 400 40, 400 40 V100 H0Z" fill="var(--primary)" opacity=".12" />
          <path d="M0 85 C 120 45, 220 110, 400 60 V100 H0Z" fill="var(--primary)" opacity=".2" />
        </svg>
      </form>
    </div>
  );
}
