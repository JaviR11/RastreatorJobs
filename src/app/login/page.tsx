import { login } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const localHint =
    process.env.NODE_ENV !== "production" && !process.env.APP_PASSWORD
      ? "En local, la contraseña es bandeja-local."
      : "";

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Bandeja</CardTitle>
          <CardDescription>Entra para ver ofertas, el CV y las decisiones.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {params.error ? (
              <p className="text-sm text-destructive">La contraseña no coincide.</p>
            ) : null}
            {localHint ? <p className="text-sm text-muted-foreground">{localHint}</p> : null}
            <Button type="submit">Entrar</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
