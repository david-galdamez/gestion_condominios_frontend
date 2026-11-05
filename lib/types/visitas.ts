export type TipoDocumento = "DUI" | "PASAPORTE";
export type EstadoAutorizacion = "VIGENTE" | "USADA" | "CANCELADA" | "VENCIDA";

export type UnidadMia = { id: string; codigo: string };

export type Autorizacion = {
  id: string;
  codigo: string;
  nombre: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  placa: string | null;
  fechaVisita: string;
  horaEstimada: string;
  estado: EstadoAutorizacion;
  unidad: UnidadMia;
};

export type NuevaAutorizacion = {
  unidadId?: string;
  nombre: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  placa?: string;
  fechaVisita: string;
  horaEstimada: string;
};
