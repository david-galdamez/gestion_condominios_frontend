"use client";

import { useState } from "react";
import { useSessionStore } from "@/lib/stores/session-store";
import type { SessionUser } from "@/lib/session";

// Hidrata el store con el usuario leído en el servidor.
export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  // Se asigna durante el primer render para que los hijos ya lo vean.
  useState(() => {
    useSessionStore.setState({ user });
  });
  return <>{children}</>;
}
