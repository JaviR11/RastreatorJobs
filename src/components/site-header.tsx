import Link from "next/link";

import { logout } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-heading text-base">
            Bandeja
          </Link>
          <Link href="/perfil" className="text-sm text-muted-foreground">
            Perfil
          </Link>
          <Link href="/?estado=later" className="text-sm text-muted-foreground">
            Luego
          </Link>
          <Link href="/?estado=apply" className="text-sm text-muted-foreground">
            Aplicadas
          </Link>
        </div>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm">
            Salir
          </Button>
        </form>
      </div>
    </header>
  );
}
