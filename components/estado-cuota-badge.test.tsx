import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EstadoCuotaBadge } from "./estado-cuota-badge";

describe("EstadoCuotaBadge", () => {
  it.each([
    ["PENDIENTE", "Pendiente", "amber"],
    ["VENCIDA", "Vencida", "red"],
    ["PAGADA", "Pagada", "green"],
  ] as const)("%s -> %s con color %s", (estado, texto, color) => {
    render(<EstadoCuotaBadge estado={estado} />);
    const el = screen.getByText(texto);
    expect(el.className).toContain(`bg-${color}-100`);
    expect(el.className).toContain(`text-${color}-800`);
  });
});
