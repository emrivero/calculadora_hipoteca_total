import { describe, expect, it } from "vitest";
import {
  calculateMortgage,
  calculateStress,
  DEFAULT_INPUTS,
  monthlyPayment,
  parseDraft,
  toDraft,
} from "./mortgage";
import { formatMoney, formatPercent } from "./formatters";

describe("cálculo hipotecario", () => {
  it("reproduce el escenario de referencia sin redondear el capital", () => {
    const result = calculateMortgage(DEFAULT_INPUTS);
    expect(result.baseFees).toBe(10200);
    expect(result.feesVat).toBe(2142);
    expect(result.totalFees).toBe(12342);
    expect(result.transferTax).toBeCloseTo(17850, 8);
    expect(result.totalCosts).toBeCloseTo(31492, 8);
    expect(result.realDownPayment).toBeCloseTo(26508, 8);
    expect(result.mortgage).toBeCloseTo(228492, 8);
    expect(result.financedPercent).toBeCloseTo(89.60470588235295, 10);
    expect(result.payment).toBeCloseTo(963.33, 2);
    expect(result.paymentCapacity).toBe(1518);
    expect(result.effort).toBeCloseTo(20.94199, 5);
    expect(result.monthlyMargin).toBeCloseTo(554.67, 2);
    expect(result.totalRepaid).toBeCloseTo(
      result.mortgage + result.totalInterest,
      8,
    );
  });

  it("amortiza el capital a cero con las cuotas calculadas", () => {
    const principal = 200000;
    const monthlyRate = 0.032 / 12;
    const payment = monthlyPayment(principal, 3.2, 25);
    let balance = principal;
    for (let month = 0; month < 300; month++)
      balance = balance * (1 + monthlyRate) - payment;
    expect(balance).toBeCloseTo(0, 5);
  });

  it("admite TIN cero y tasas próximas a cero sin inestabilidad", () => {
    expect(monthlyPayment(120000, 0, 20)).toBe(500);
    expect(monthlyPayment(120000, 0.000000001, 20)).toBeCloseTo(500, 6);
    expect(calculateMortgage({ ...DEFAULT_INPUTS, tin: 0 }).totalInterest).toBe(
      0,
    );
  });

  it("conserva el déficit de efectivo y la financiación superior al precio", () => {
    const result = calculateMortgage({ ...DEFAULT_INPUTS, cash: 0 });
    expect(result.realDownPayment).toBeCloseTo(-31492, 8);
    expect(result.cashShortfall).toBeCloseTo(31492, 8);
    expect(result.mortgage).toBeCloseTo(286492, 8);
    expect(result.financedPercent).toBeGreaterThan(100);
    expect(result.appliedDownPayment).toBe(0);
  });

  it("no genera hipoteca negativa cuando sobra efectivo", () => {
    const result = calculateMortgage({ ...DEFAULT_INPUTS, cash: 300000 });
    expect(result.mortgage).toBe(0);
    expect(result.payment).toBe(0);
    expect(result.totalInterest).toBe(0);
    expect(result.appliedDownPayment).toBe(255000);
    expect(result.surplusCash).toBeCloseTo(13508, 8);
    expect(
      result.totalCosts + result.appliedDownPayment + result.surplusCash,
    ).toBe(300000);
  });

  it("trata ingresos cero sin dividir por cero", () => {
    expect(
      calculateMortgage({ ...DEFAULT_INPUTS, income: 0 }).effort,
    ).toBeNull();
    expect(
      calculateMortgage({ ...DEFAULT_INPUTS, income: 0, cash: 300000 }).effort,
    ).toBe(0);
  });

  it("mantiene la precisión interna con decimales", () => {
    const result = calculateMortgage({
      ...DEFAULT_INPUTS,
      price: 255000.35,
      commission: 3.75,
    });
    expect(result.baseFees).toBe(255000.35 * 0.0375);
    expect(result.feesVat).toBe(result.baseFees * 0.21);
    expect(result.mortgage).toBe(
      DEFAULT_INPUTS.price + 0.35 + result.totalCosts - DEFAULT_INPUTS.cash,
    );
  });

  it.each([-1, NaN, Infinity])(
    "rechaza valores inválidos en las funciones puras: %s",
    (value) => {
      expect(() =>
        calculateMortgage({ ...DEFAULT_INPUTS, cash: value }),
      ).toThrow(RangeError);
      expect(() => monthlyPayment(value, 3, 30)).toThrow(RangeError);
    },
  );

  it("rechaza precio cero, plazos inválidos y desbordamientos", () => {
    expect(() => calculateMortgage({ ...DEFAULT_INPUTS, price: 0 })).toThrow(
      RangeError,
    );
    expect(() => monthlyPayment(1000, 3, 0)).toThrow(RangeError);
    expect(() => monthlyPayment(1000, 3, 2.5)).toThrow(RangeError);
    expect(() =>
      calculateMortgage({
        ...DEFAULT_INPUTS,
        price: Number.MAX_VALUE,
        commission: Number.MAX_VALUE,
      }),
    ).toThrow(RangeError);
  });

  it("calcula el escenario fijo al 4 % y la diferencia con signo correcto", () => {
    const result = calculateMortgage(DEFAULT_INPUTS);
    const stress = calculateStress(DEFAULT_INPUTS, result.mortgage);
    expect(stress.payment).toBeCloseTo(1090.86, 2);
    expect(stress.difference).toBeCloseTo(127.5, 1);
    expect(stress.effort).toBeCloseTo((stress.payment / 4600) * 100, 10);
    expect(
      calculateStress({ ...DEFAULT_INPUTS, tin: 5 }, result.mortgage)
        .difference,
    ).toBeLessThan(0);
    expect(
      calculateStress({ ...DEFAULT_INPUTS, income: 0 }, result.mortgage).effort,
    ).toBeNull();
  });
});

describe("validación y formato", () => {
  it("admite coma decimal y conserva los valores por defecto", () => {
    expect(parseDraft(toDraft(DEFAULT_INPUTS)).inputs).toEqual(DEFAULT_INPUTS);
    expect(
      parseDraft({ ...toDraft(DEFAULT_INPUTS), tin: "2,85" }).inputs?.tin,
    ).toBe(2.85);
  });

  it.each(["", "-10", "abc", "Infinity", "1.2.3", "0x100", "1e20"])(
    "rechaza texto inválido: %s",
    (value) => {
      expect(
        parseDraft({ ...toDraft(DEFAULT_INPUTS), cash: value }).inputs,
      ).toBeNull();
    },
  );

  it("valida el plazo entero y acepta efectivo e ingresos cero", () => {
    expect(
      parseDraft({ ...toDraft(DEFAULT_INPUTS), years: "2.5" }).errors.years,
    ).toBeTruthy();
    expect(
      parseDraft({ ...toDraft(DEFAULT_INPUTS), price: "0" }).errors.price,
    ).toBeTruthy();
    expect(
      parseDraft({ ...toDraft(DEFAULT_INPUTS), income: "0", cash: "0" }).inputs,
    ).not.toBeNull();
  });

  it("presenta dinero y porcentajes en español", () => {
    expect(formatMoney(1518).replace(/\s/g, " ")).toBe("1.518 €");
    expect(formatMoney(255000).replace(/\s/g, " ")).toBe("255.000 €");
    expect(formatMoney(26508.25, true).replace(/\s/g, " ")).toBe("26.508,25 €");
    expect(formatPercent(89.604705)).toBe("89,6 %");
    expect(formatPercent(null)).toBe("Sin ingresos");
  });
});
