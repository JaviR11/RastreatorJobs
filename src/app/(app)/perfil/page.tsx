import { saveCv } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getStore } from "@/db/store";

export const instant = false;

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ guardado?: string }>;
}) {
  const params = await searchParams;
  const profile = await getStore().getProfile();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
      <h1 className="font-heading text-2xl">CV</h1>
      <p className="text-sm text-muted-foreground">
        Este texto puntúa las ofertas nuevas. Puedes corregirlo cuando cambie tu experiencia. Lo
        ya decidido conserva la versión con la que lo decidiste.
      </p>
      {params.guardado ? <p>CV guardado.</p> : null}
      <form action={saveCv} className="flex flex-col gap-3">
        <Label htmlFor="cvText">Texto del CV</Label>
        <Textarea
          id="cvText"
          name="cvText"
          defaultValue={profile.cvText}
          rows={18}
          placeholder="Pega aquí las frases reales de tu CV."
        />
        <Button type="submit" className="w-fit">
          Guardar
        </Button>
      </form>
    </main>
  );
}
