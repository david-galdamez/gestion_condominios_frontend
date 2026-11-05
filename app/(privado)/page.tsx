import { getSessionUser } from "@/lib/session";

export default async function Home() {
  const user = await getSessionUser();
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Hola, {user?.nombre}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Bienvenido al sistema de gestión de condominios.
      </p>
    </div>
  );
}
