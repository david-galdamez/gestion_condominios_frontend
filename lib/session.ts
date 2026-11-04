import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";
export const USER_COOKIE = "session_user";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export type Rol = "RESIDENTE" | "ADMINISTRADOR" | "SEGURIDAD";

export type SessionUser = {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
};

const ROLES: Rol[] = ["RESIDENTE", "ADMINISTRADOR", "SEGURIDAD"];

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
  };
}

// Guarda el access token y los datos del usuario en cookies httpOnly
// (no accesibles desde JS del cliente).
// TODO: el refresh token queda fuera de alcance (pendiente).
export async function createSession(token: string, user: SessionUser) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, cookieOptions());
  cookieStore.set(USER_COOKIE, JSON.stringify(user), cookieOptions());
}

export async function getSession() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

// Devuelve el usuario de la sesión o null si no existe o es inválido.
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    const u = JSON.parse(raw);
    if (
      typeof u?.id === "string" &&
      typeof u?.email === "string" &&
      typeof u?.nombre === "string" &&
      ROLES.includes(u?.rol)
    ) {
      return { id: u.id, email: u.email, nombre: u.nombre, rol: u.rol };
    }
  } catch {
    // cookie corrupta
  }
  return null;
}

// Solo se puede llamar desde Server Actions o Route Handlers.
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(USER_COOKIE);
}
