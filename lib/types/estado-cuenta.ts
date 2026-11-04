export type EstadoCuota = "PENDIENTE" | "VENCIDA" | "PAGADA";

export const ESTADOS_CUOTA: EstadoCuota[] = ["PENDIENTE", "VENCIDA", "PAGADA"];

export type UnidadResumen = { id: string; codigo: string };

export type Cuota = {
  id: string;
  periodo: string; // "2026-10"
  monto: number;
  fechaVencimiento: string; // "2026-10-10"
  estado: EstadoCuota;
};

export type EstadoCuentaRespuesta = {
  unidad: UnidadResumen | null;
  unidades: UnidadResumen[];
  saldoTotal: number;
  datos: Cuota[];
  total: number;
  pagina: number;
  porPagina: number;
};

// Filtros tal como viven en la URL (todos opcionales).
export type EstadoCuentaFiltros = {
  unidadId?: string;
  estado?: EstadoCuota;
  desde?: string;
  hasta?: string;
  pagina?: number;
};
