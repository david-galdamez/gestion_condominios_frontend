"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { esFechaValida } from "@/lib/format";
import type { UnidadResumen } from "@/lib/types/estado-cuenta";

const inputClass =
  "rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-100";

// Los filtros viven en la URL porque los datos se piden en el servidor; este
// formulario solo reescribe los search params (y vuelve a pagina=1).
export function FiltrosForm({
  unidades,
  unidadId,
}: {
  unidades: UnidadResumen[];
  unidadId?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");

  function navegar(next: URLSearchParams) {
    const qs = next.toString();
    router.push(qs ? `/estado-cuenta?${qs}` : "/estado-cuenta");
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const estado = String(f.get("estado") ?? "");
    const desde = String(f.get("desde") ?? "");
    const hasta = String(f.get("hasta") ?? "");

    if ((desde && !esFechaValida(desde)) || (hasta && !esFechaValida(hasta))) {
      setError("La fecha no es válida");
      return;
    }
    if (desde && hasta && desde > hasta) {
      setError("La fecha desde no puede ser mayor que la fecha hasta");
      return;
    }
    setError("");

    const next = new URLSearchParams();
    if (unidadId) next.set("unidadId", unidadId);
    if (estado) next.set("estado", estado);
    if (desde) next.set("desde", desde);
    if (hasta) next.set("hasta", hasta);
    navegar(next);
  }

  function onLimpiar() {
    setError("");
    const next = new URLSearchParams();
    if (unidadId) next.set("unidadId", unidadId);
    navegar(next);
  }

  function onCambiarUnidad(id: string) {
    // Al cambiar de unidad se descartan los filtros: pueden no aplicar.
    setError("");
    navegar(new URLSearchParams({ unidadId: id }));
  }

  // key: al cambiar la URL (Limpiar, atrás/adelante) se reinician los campos.
  const key = params.toString();

  return (
    <div className="flex flex-col gap-4">
      {unidades.length > 1 && (
        <div className="flex flex-col gap-1">
          <label htmlFor="unidad" className="text-sm font-medium">
            Unidad
          </label>
          <select
            id="unidad"
            value={unidadId ?? ""}
            onChange={(e) => onCambiarUnidad(e.target.value)}
            className={`${inputClass} w-full sm:w-48`}
          >
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.codigo}
              </option>
            ))}
          </select>
        </div>
      )}

      <form
        key={key}
        onSubmit={onSubmit}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="estado" className="text-sm font-medium">
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            defaultValue={params.get("estado") ?? ""}
            className={inputClass}
          >
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="VENCIDA">Vencida</option>
            <option value="PAGADA">Pagada</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="desde" className="text-sm font-medium">
            Vence desde
          </label>
          <input
            id="desde"
            name="desde"
            type="date"
            defaultValue={params.get("desde") ?? ""}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="hasta" className="text-sm font-medium">
            Vence hasta
          </label>
          <input
            id="hasta"
            name="hasta"
            type="date"
            defaultValue={params.get("hasta") ?? ""}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Aplicar
        </button>
        <button
          type="button"
          onClick={onLimpiar}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
        >
          Limpiar
        </button>
      </form>

      <p aria-live="polite" className="min-h-5 text-sm text-red-600">
        {error}
      </p>
    </div>
  );
}
