"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-10">
      <h1 className="font-heading text-2xl">La bandeja no ha podido cargar</h1>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button type="button" onClick={reset} className="w-fit">
        Reintentar
      </Button>
    </main>
  );
}
