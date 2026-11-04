import "server-only";
import { redirect } from "next/navigation";
import { getSessionUser, type Rol } from "@/lib/session";

// Exige sesión y uno de los roles indicados. Devuelve el usuario.
export async function requireRol(...roles: Rol[]) {
  const user = await getSessionUser();
  if (!user) redirect("/api/sesion/expirada");
  if (!roles.includes(user.rol)) redirect("/sin-permiso");
  return user;
}
