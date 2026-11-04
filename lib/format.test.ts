import { afterEach, describe, expect, it, vi } from "vitest";
import { esFechaValida, formatFecha, formatPeriodo, formatUsd } from "./format";

describe("formatUsd", () => {
  it("usa 2 decimales y moneda USD", () => {
    const s = formatUsd(1234.5);
    expect(s).toContain("1");
    expect(s).toMatch(/234[.,]50$/);
    expect(s).toMatch(/\$|US/);
    expect(formatUsd(0)).toMatch(/0[.,]00$/);
    expect(formatUsd(10)).toMatch(/10[.,]00$/);
  });
});

describe("formatPeriodo", () => {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
    "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  it.each(meses.map((m, i) => [String(i + 1).padStart(2, "0"), m]))(
    "mes %s -> %s",
    (mm, nombre) => {
      expect(formatPeriodo(`2026-${mm}`)).toBe(`${nombre} 2026`);
    },
  );
  it("devuelve el original si el mes no existe", () => {
    expect(formatPeriodo("2026-13")).toBe("2026-13");
  });
});

describe("formatFecha", () => {
  const tzOriginal = process.env.TZ;
  afterEach(() => {
    process.env.TZ = tzOriginal;
    vi.unstubAllEnvs();
  });
  it("formatea dd/mm/aaaa", () => {
    expect(formatFecha("2026-10-10")).toBe("10/10/2026");
    expect(formatFecha("2026-01-05T00:00:00.000Z")).toBe("05/01/2026");
  });
  it.each(["America/El_Salvador", "Pacific/Kiritimati", "Pacific/Pago_Pago"])(
    "sin corrimiento con TZ=%s",
    (tz) => {
      process.env.TZ = tz;
      expect(formatFecha("2026-03-01")).toBe("01/03/2026");
      expect(formatFecha("2026-12-31")).toBe("31/12/2026");
    },
  );
});

describe("esFechaValida", () => {
  it.each(["2026-10-10", "2028-02-29", "2000-02-29", "2026-12-31", "2026-04-30"])(
    "válida: %s",
    (f) => expect(esFechaValida(f)).toBe(true),
  );
  it.each([
    "2026-02-29", "2100-02-29", "2026-02-31", "2026-04-31", "2026-13-01",
    "2026-00-10", "2026-10-00", "2026-10-32", "26-10-10", "2026/10/10",
    "2026-1-1", "", "abcd-ef-gh", "2026-10-10T00:00", " 2026-10-10",
  ])("inválida: %s", (f) => expect(esFechaValida(f)).toBe(false));
});
