import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/api", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "@/lib/api";
import { getEstadoCuenta } from "./estado-cuenta";

const mockFetch = vi.mocked(apiFetch);

const valida = {
  unidad: { id: "u1", codigo: "A-1" },
  unidades: [{ id: "u1", codigo: "A-1" }],
  saldoTotal: 50,
  datos: [],
  total: 0,
  pagina: 1,
  porPagina: 10,
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

beforeEach(() => {
  mockFetch.mockReset();
});

describe("getEstadoCuenta", () => {
  it("sin filtros no agrega query", async () => {
    mockFetch.mockResolvedValue(json(valida));
    await getEstadoCuenta({});
    expect(mockFetch).toHaveBeenCalledWith("estado-cuenta");
  });

  it("arma la query solo con params presentes", async () => {
    mockFetch.mockResolvedValue(json(valida));
    await getEstadoCuenta({ estado: "VENCIDA", desde: "2026-01-01", pagina: 2 });
    expect(mockFetch).toHaveBeenCalledWith(
      "estado-cuenta?estado=VENCIDA&desde=2026-01-01&pagina=2",
    );
  });

  it("incluye todos los params", async () => {
    mockFetch.mockResolvedValue(json(valida));
    await getEstadoCuenta({
      unidadId: "u1", estado: "PAGADA", desde: "2026-01-01", hasta: "2026-02-01", pagina: 3,
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "estado-cuenta?unidadId=u1&estado=PAGADA&desde=2026-01-01&hasta=2026-02-01&pagina=3",
    );
  });

  it("200 válido -> ok", async () => {
    mockFetch.mockResolvedValue(json(valida));
    expect(await getEstadoCuenta({})).toEqual({ status: "ok", data: valida });
  });

  it("403 -> forbidden", async () => {
    mockFetch.mockResolvedValue(json({}, 403));
    expect(await getEstadoCuenta({})).toEqual({ status: "forbidden" });
  });

  it("400 con message string", async () => {
    mockFetch.mockResolvedValue(json({ message: "Fecha mala" }, 400));
    expect(await getEstadoCuenta({})).toEqual({ status: "bad_request", message: "Fecha mala" });
  });

  it("400 con message string[]", async () => {
    mockFetch.mockResolvedValue(json({ message: ["a inválido", "b inválido"] }, 400));
    expect(await getEstadoCuenta({})).toEqual({
      status: "bad_request",
      message: "a inválido. b inválido",
    });
  });

  it("400 sin message usa mensaje genérico", async () => {
    mockFetch.mockResolvedValue(new Response("no json", { status: 400 }));
    expect(await getEstadoCuenta({})).toEqual({
      status: "bad_request",
      message: "Los filtros no son válidos.",
    });
  });

  it("500 -> error", async () => {
    mockFetch.mockResolvedValue(json({}, 500));
    expect(await getEstadoCuenta({})).toEqual({ status: "error" });
  });

  it("error de red -> error", async () => {
    mockFetch.mockRejectedValue(new TypeError("fetch failed"));
    expect(await getEstadoCuenta({})).toEqual({ status: "error" });
  });

  it("propaga el redirect de apiFetch", async () => {
    const redirectErr = Object.assign(new Error("NEXT_REDIRECT"), { digest: "NEXT_REDIRECT;x" });
    mockFetch.mockRejectedValue(redirectErr);
    await expect(getEstadoCuenta({})).rejects.toBe(redirectErr);
  });

  it("JSON con forma inesperada -> error", async () => {
    mockFetch.mockResolvedValue(json({ foo: "bar" }));
    expect(await getEstadoCuenta({})).toEqual({ status: "error" });
    mockFetch.mockResolvedValue(json({ ...valida, saldoTotal: "50" }));
    expect(await getEstadoCuenta({})).toEqual({ status: "error" });
    mockFetch.mockResolvedValue(json(null));
    expect(await getEstadoCuenta({})).toEqual({ status: "error" });
  });

  it("JSON malformado en 200 -> error", async () => {
    mockFetch.mockResolvedValue(new Response("<html>", { status: 200 }));
    expect(await getEstadoCuenta({})).toEqual({ status: "error" });
  });
});
