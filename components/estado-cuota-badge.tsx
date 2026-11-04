import type { EstadoCuota } from "@/lib/types/estado-cuenta";

const ESTILOS: Record<EstadoCuota, { label: string; clase: string }> = {
  PENDIENTE: {
    label: "Pendiente",
    clase: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  VENCIDA: {
    label: "Vencida",
    clase: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
  PAGADA: {
    label: "Pagada",
    clase:
      "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  },
};

export function EstadoCuotaBadge({ estado }: { estado: EstadoCuota }) {
  const e = ESTILOS[estado] ?? { label: estado, clase: "bg-zinc-100" };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${e.clase}`}
    >
      {e.label}
    </span>
  );
}
