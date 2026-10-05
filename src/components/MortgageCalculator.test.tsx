import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MortgageCalculator } from "./MortgageCalculator";

describe("calculadora interactiva", () => {
  it("muestra la entrada real y recalcula al cambiar el efectivo", () => {
    render(<MortgageCalculator />);
    expect(screen.getByTestId("real-entry")).toHaveTextContent("26.508,00");
    expect(screen.getByTestId("mortgage")).toHaveTextContent("228.492");
    expect(
      screen.queryByText("Escenario de estrés al 4 % TIN"),
    ).not.toBeInTheDocument();
    fireEvent.change(
      screen.getByLabelText("Efectivo / entrada inicial disponible"),
      { target: { value: "50000" } },
    );
    expect(screen.getByTestId("real-entry")).toHaveTextContent("18.508,00");
    expect(
      screen.getByText("Escenario de estrés al 4 % TIN"),
    ).toBeInTheDocument();
  });

  it("activa el aviso y el escenario al alcanzar exactamente el 90 %", () => {
    render(<MortgageCalculator />);
    for (const [label, value] of [
      ["Comisión inmobiliaria", "0"],
      ["ITP", "0"],
      ["Gestión, tasación y otros", "0"],
      ["Precio de la vivienda", "200000"],
      ["Efectivo / entrada inicial disponible", "20000"],
    ]) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    expect(
      screen.getByText("La financiación es igual o superior al 90 %."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Escenario de estrés al 4 % TIN"),
    ).toBeInTheDocument();
  });

  it("advierte de falta de efectivo, exceso de financiación y esfuerzo", () => {
    render(<MortgageCalculator />);
    fireEvent.change(
      screen.getByLabelText("Efectivo / entrada inicial disponible"),
      { target: { value: "1000" } },
    );
    fireEvent.change(screen.getByLabelText("Sueldo neto mensual familiar"), {
      target: { value: "1000" },
    });
    expect(
      screen.getByText(
        "El efectivo disponible no cubre ni siquiera los impuestos y gastos de la operación.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("La hipoteca supera el precio de la vivienda."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "El esfuerzo hipotecario supera el 33 % de los ingresos netos familiares.",
      ),
    ).toBeInTheDocument();
  });

  it("retira resultados inválidos y permite restablecer los valores", async () => {
    const user = userEvent.setup();
    render(<MortgageCalculator />);
    await user.clear(screen.getByLabelText("Precio de la vivienda"));
    expect(screen.getByLabelText("Precio de la vivienda")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.queryByTestId("monthly-payment")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar escenario actual" }),
    ).toBeDisabled();
    await user.click(
      screen.getByRole("button", { name: "Restablecer valores" }),
    );
    expect(screen.getByTestId("monthly-payment")).toHaveTextContent("963");
    expect(screen.getByLabelText("Precio de la vivienda")).toHaveValue(
      "255000",
    );
  });

  it("guarda copias independientes, carga y elimina escenarios", async () => {
    const user = userEvent.setup();
    render(<MortgageCalculator />);
    await user.type(screen.getByLabelText("Nombre del escenario"), "Casa A");
    await user.click(
      screen.getByRole("button", { name: "Guardar escenario actual" }),
    );
    fireEvent.change(screen.getByLabelText("Precio de la vivienda"), {
      target: { value: "245000" },
    });
    await user.type(screen.getByLabelText("Nombre del escenario"), "Casa B");
    await user.click(
      screen.getByRole("button", { name: "Guardar escenario actual" }),
    );
    const table = screen.getByRole("table");
    expect(within(table).getByText("255.000 €")).toBeInTheDocument();
    expect(within(table).getByText("245.000 €")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Casa A" }));
    expect(screen.getByLabelText("Precio de la vivienda")).toHaveValue(
      "255000",
    );
    expect(screen.getByLabelText("Precio de la vivienda")).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Eliminar Casa A" }));
    expect(
      screen.queryByRole("button", { name: "Casa A" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Casa B" })).toBeInTheDocument();
  });
});
