import "server-only";
import { apiFetch } from "@/lib/api";
import type {
  EstadoCuentaFiltros,
  EstadoCuentaRespuesta,
} from "@/lib/types/estado-cuenta";

export type EstadoCuentaResultado =
  | { status: "ok"; data: EstadoCuentaRespuesta }
  | { status: "forbidden" }
  | { status: "bad_request"; message: string }
  | { status: "error" };

function esRespuestaValida(x: unknown): x is EstadoCuentaRespuesta {
  const r = x as EstadoCuentaRespuesta | null;
  return (
    !!r &&
    Array.isArray(r.unidades) &&
    Array.isArray(r.datos) &&
    typeof r.saldoTotal === "number" &&
    typeof r.total === "number" &&
    typeof r.pagina === "number" &&
    typeof r.porPagina === "number"
  );
}

// Consulta el estado de cuenta. Solo envía los parámetros presentes y nunca
// lanza por fallos de red o respuestas inesperadas: los devuelve como "error".
export async function getEstadoCuenta(
  filtros: EstadoCuentaFiltros,
): Promise<EstadoCuentaResultado> {
  const query = new URLSearchParams();
  if (filtros.unidadId) query.set("unidadId", filtros.unidadId);
  if (filtros.estado) query.set("estado", filtros.estado);
  if (filtros.desde) query.set("desde", filtros.desde);
  if (filtros.hasta) query.set("hasta", filtros.hasta);
  if (filtros.pagina) query.set("pagina", String(filtros.pagina));
  const qs = query.toString();

  let res: Response;
  try {
    res = await apiFetch(`estado-cuenta${qs ? `?${qs}` : ""}`);
  } catch (e) {
    // redirect() de apiFetch (401) debe propagarse; solo se captura la red.
    if (e instanceof Error && !("digest" in e)) return { status: "error" };
    throw e;
  }

  if (res.status === 403) return { status: "forbidden" };

  if (res.status === 400) {
    const body = await res.json().catch(() => null);
    const m = body?.message;
    const message = Array.isArray(m)
      ? m.join(". ")
      : typeof m === "string"
        ? m
        : "Los filtros no son válidos.";
    return { status: "bad_request", message };
  }

  if (!res.ok) return { status: "error" };

  const body = await res.json().catch(() => null);
  if (!esRespuestaValida(body)) return { status: "error" };
  return { status: "ok", data: body };
}
