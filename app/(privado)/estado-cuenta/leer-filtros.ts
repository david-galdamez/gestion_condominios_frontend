import { esFechaValida } from "@/lib/format";
import {
  ESTADOS_CUOTA,
  type EstadoCuota,
  type EstadoCuentaFiltros,
} from "@/lib/types/estado-cuenta";

export type SearchParams = { [key: string]: string | string[] | undefined };

const primero = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

// Normaliza los search params: lo inválido se ignora en vez de llegar a la API.
export function leerFiltros(sp: SearchParams): EstadoCuentaFiltros {
  const estado = primero(sp.estado);
  const desde = primero(sp.desde);
  const hasta = primero(sp.hasta);
  const pagina = Number(primero(sp.pagina));
  return {
    unidadId: primero(sp.unidadId) || undefined,
    estado: ESTADOS_CUOTA.includes(estado as EstadoCuota)
      ? (estado as EstadoCuota)
      : undefined,
    desde: desde && esFechaValida(desde) ? desde : undefined,
    hasta: hasta && esFechaValida(hasta) ? hasta : undefined,
    pagina: Number.isInteger(pagina) && pagina >= 1 ? pagina : undefined,
  };
}
