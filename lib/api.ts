import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// Ruta que borra las cookies de sesión y redirige a /login. No se pueden
// borrar cookies durante el render de un Server Component, por eso se redirige
// a un Route Handler (excluido del proxy por el prefijo /api).
export const SESSION_EXPIRED_PATH = "/api/sesion/expirada";

// fetch autenticado contra la API del backend. Ante 401 limpia la sesión y
// redirige a /login. Los demás estados (403, 404, ...) los maneja el llamador.
export async function apiFetch(path: string, init: RequestInit = {}) {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("Falta la variable de entorno API_URL.");
  }

  const token = await getSession();
  if (!token) redirect(SESSION_EXPIRED_PATH);

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(
    new URL(path.replace(/^\//, ""), apiUrl.replace(/\/?$/, "/")),
    { ...init, headers, cache: "no-store" },
  );

  if (res.status === 401) redirect(SESSION_EXPIRED_PATH);
  return res;
}
