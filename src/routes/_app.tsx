import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/Shell";
export const Route = createFileRoute("/_app")({ ssr: false, component: Shell });
