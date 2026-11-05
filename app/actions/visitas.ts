"use server";

import { revalidatePath } from "next/cache";
import { hoyEnElSalvador } from "@/lib/format";
import type { Autorizacion, TipoDocumento } from "@/lib/types/visitas";
import { validarVisita, type ErroresVisita } from "@/lib/validaciones/visita";
import { cancelarAutorizacion, crearAutorizacion } from "@/lib/visitas";

export type CrearVisitaState = {
  status: "idle" | "error" | "ok";
  errores?: ErroresVisita;
  // Errores de la API (o genéricos) que se muestran arriba del formulario.
  mensajes?: string[];
  autorizacion?: Autorizacion;
};

const texto = (f: FormData, k: string) => String(f.get(k) ?? "");

export async function crearVisita(
  _prev: CrearVisitaState,
  formData: FormData,
): Promise<CrearVisitaState> {
  const campos = {
    unidadId: texto(formData, "unidadId"),
    nombre: texto(formData, "nombre").trim(),
    tipoDocumento: texto(formData, "tipoDocumento"),
    numeroDocumento: texto(formData, "numeroDocumento").trim(),
    placa: texto(formData, "placa").trim(),
    fechaVisita: texto(formData, "fechaVisita"),
    horaEstimada: texto(formData, "horaEstimada"),
  };

  // Nunca se confía en el cliente: se valida de nuevo antes de llamar a la API.
  const errores = validarVisita(campos, hoyEnElSalvador());
  if (Object.keys(errores).length > 0) return { status: "error", errores };

  const r = await crearAutorizacion({
    unidadId: campos.unidadId,
    nombre: campos.nombre,
    tipoDocumento: campos.tipoDocumento as TipoDocumento,
    numeroDocumento:
      campos.tipoDocumento === "PASAPORTE"
        ? campos.numeroDocumento.toUpperCase()
        : campos.numeroDocumento,
    ...(campos.placa ? { placa: campos.placa } : {}),
    fechaVisita: campos.fechaVisita,
    horaEstimada: campos.horaEstimada,
  });

  switch (r.status) {
    case "ok":
      revalidatePath("/visitas");
      return { status: "ok", autorizacion: r.data };
    case "bad_request":
      return { status: "error", mensajes: r.messages };
    case "forbidden":
      return { status: "error", mensajes: ["No tienes permiso para esta acción"] };
    default:
      return {
        status: "error",
        mensajes: ["No pudimos autorizar la visita. Intenta de nuevo."],
      };
  }
}

export type CancelarVisitaResultado = { ok: true } | { ok: false; error: string };

export async function cancelarVisita(id: string): Promise<CancelarVisitaResultado> {
  const r = await cancelarAutorizacion(id);
  switch (r.status) {
    case "ok":
      revalidatePath("/visitas");
      return { ok: true };
    case "conflict":
      // La lista queda desactualizada (p. ej. ya se usó): se refresca igual.
      revalidatePath("/visitas");
      return { ok: false, error: "Esta autorización ya no se puede cancelar" };
    case "not_found":
      revalidatePath("/visitas");
      return { ok: false, error: "La autorización no existe" };
    case "forbidden":
      return { ok: false, error: "No tienes permiso para esta acción" };
    default:
      return { ok: false, error: "No pudimos cancelar la autorización. Intenta de nuevo." };
  }
}
