import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
let search = "";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(search),
}));

import { FiltrosForm } from "./filtros-form";

const una = [{ id: "u1", codigo: "A-1" }];
const dos = [...una, { id: "u2", codigo: "B-2" }];

beforeEach(() => {
  push.mockReset();
  search = "";
});

// Los input type=date de jsdom aceptan solo valores válidos; fireEvent evita
// que userEvent normalice la entrada.
const setFecha = (label: string, v: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value: v } });

describe("FiltrosForm", () => {
  it("Aplicar navega con los params (sin pagina, que reinicia a la 1)", async () => {
    const user = userEvent.setup();
    render(<FiltrosForm unidades={una} unidadId="u1" />);
    await user.selectOptions(screen.getByLabelText("Estado"), "VENCIDA");
    setFecha("Vence desde", "2026-01-01");
    setFecha("Vence hasta", "2026-02-01");
    await user.click(screen.getByRole("button", { name: "Aplicar" }));
    expect(push).toHaveBeenCalledTimes(1);
    const url = new URL(push.mock.calls[0][0], "http://x");
    expect(url.pathname).toBe("/estado-cuenta");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      unidadId: "u1", estado: "VENCIDA", desde: "2026-01-01", hasta: "2026-02-01",
    });
    expect(url.searchParams.has("pagina")).toBe(false);
  });

  it("Aplicar sin filtros ni unidad navega a la ruta base", async () => {
    const user = userEvent.setup();
    render(<FiltrosForm unidades={[]} />);
    await user.click(screen.getByRole("button", { name: "Aplicar" }));
    expect(push).toHaveBeenCalledWith("/estado-cuenta");
  });

  it("Limpiar conserva solo unidadId", async () => {
    search = "unidadId=u1&estado=PAGADA&desde=2026-01-01";
    const user = userEvent.setup();
    render(<FiltrosForm unidades={una} unidadId="u1" />);
    expect(screen.getByLabelText("Estado")).toHaveValue("PAGADA");
    await user.click(screen.getByRole("button", { name: "Limpiar" }));
    expect(push).toHaveBeenCalledWith("/estado-cuenta?unidadId=u1");
  });

  it("Limpiar sin unidad va a la ruta base", async () => {
    const user = userEvent.setup();
    render(<FiltrosForm unidades={[]} />);
    await user.click(screen.getByRole("button", { name: "Limpiar" }));
    expect(push).toHaveBeenCalledWith("/estado-cuenta");
  });

  it("desde > hasta muestra error y no navega", async () => {
    const user = userEvent.setup();
    render(<FiltrosForm unidades={una} unidadId="u1" />);
    setFecha("Vence desde", "2026-05-10");
    setFecha("Vence hasta", "2026-05-01");
    await user.click(screen.getByRole("button", { name: "Aplicar" }));
    expect(
      screen.getByText("La fecha desde no puede ser mayor que la fecha hasta"),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("fecha inválida muestra error y no navega", async () => {
    const user = userEvent.setup();
    const { container } = render(<FiltrosForm unidades={una} unidadId="u1" />);
    // jsdom sanea el valor de input date; se fuerza una fecha imposible
    // reemplazando el tipo a text para simular un navegador sin selector.
    const desde = container.querySelector<HTMLInputElement>("#desde")!;
    desde.type = "text";
    desde.value = "2026-02-31";
    expect(desde.value).toBe("2026-02-31");
    await user.click(screen.getByRole("button", { name: "Aplicar" }));
    expect(screen.getByText("La fecha no es válida")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("el selector de unidad solo aparece con más de una unidad", () => {
    const { rerender } = render(<FiltrosForm unidades={una} unidadId="u1" />);
    expect(screen.queryByLabelText("Unidad")).not.toBeInTheDocument();
    rerender(<FiltrosForm unidades={dos} unidadId="u1" />);
    expect(screen.getByLabelText("Unidad")).toBeInTheDocument();
  });

  it("cambiar de unidad descarta los demás filtros", async () => {
    search = "unidadId=u1&estado=PAGADA&desde=2026-01-01&pagina=2";
    const user = userEvent.setup();
    render(<FiltrosForm unidades={dos} unidadId="u1" />);
    await user.selectOptions(screen.getByLabelText("Unidad"), "u2");
    expect(push).toHaveBeenCalledWith("/estado-cuenta?unidadId=u2");
  });
});
