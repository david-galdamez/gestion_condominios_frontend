import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sin permiso" };

export default function SinPermisoPage() {
  return (
    <div className="mx-auto mt-16 flex w-full max-w-sm flex-col gap-4 rounded-xl border border-zinc-200 p-8 text-center dark:border-zinc-800">
      <h1 className="text-xl font-semibold">
        No tienes permiso para esta acción
      </h1>
      <Link
        href="/"
        className="rounded-md bg-foreground px-4 py-2 font-medium text-background"
      >
        Ir a Inicio
      </Link>
    </div>
  );
}
