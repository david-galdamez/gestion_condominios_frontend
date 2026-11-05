import { describe, expect, it } from "vitest";
import { leerFiltros } from "./leer-filtros";

describe("leerFiltros", () => {
  it("sin params -> todo undefined", () => {
    expect(leerFiltros({})).toEqual({
      unidadId: undefined, estado: undefined, desde: undefined, hasta: undefined, pagina: undefined,
    });
  });

  it("acepta valores válidos", () => {
    expect(
      leerFiltros({
        unidadId: "u1", estado: "PAGADA", desde: "2028-02-29", hasta: "2028-03-01", pagina: "3",
      }),
    ).toEqual({
      unidadId: "u1", estado: "PAGADA", desde: "2028-02-29", hasta: "2028-03-01", pagina: 3,
    });
  });

  it("toma el primer valor de arreglos", () => {
    expect(leerFiltros({ estado: ["VENCIDA", "PAGADA"], pagina: ["2", "5"] })).toMatchObject({
      estado: "VENCIDA", pagina: 2,
    });
  });

  it("ignora estado inválido", () => {
    expect(leerFiltros({ estado: "pagada" }).estado).toBeUndefined();
    expect(leerFiltros({ estado: "XYZ" }).estado).toBeUndefined();
  });

  it("ignora fechas imposibles o mal formadas", () => {
    const f = leerFiltros({ desde: "2026-02-31", hasta: "2026-02-29" });
    expect(f.desde).toBeUndefined();
    expect(f.hasta).toBeUndefined();
    expect(leerFiltros({ desde: "10/10/2026" }).desde).toBeUndefined();
  });

  it.each(["0", "-1", "1.5", "abc", "", "NaN"])("ignora pagina %j", (p) => {
    expect(leerFiltros({ pagina: p }).pagina).toBeUndefined();
  });
});
