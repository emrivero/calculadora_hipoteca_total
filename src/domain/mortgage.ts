import type {
  MortgageDraft,
  MortgageInputs,
  MortgageResult,
  ValidationErrors,
} from "./types";

export const DEFAULT_INPUTS: MortgageInputs = {
  price: 255000,
  cash: 58000,
  commission: 4,
  commissionVat: 21,
  otherCosts: 1300,
  income: 4600,
  years: 30,
  tin: 3,
  itp: 7,
};

export const EFFORT_REFERENCE = 33;
export const STRESS_TIN = 4;

export function toDraft(inputs: MortgageInputs): MortgageDraft {
  return Object.fromEntries(
    Object.entries(inputs).map(([key, value]) => [key, String(value)]),
  ) as MortgageDraft;
}

export function parseDraft(draft: MortgageDraft): {
  inputs: MortgageInputs | null;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};
  const inputs = {} as MortgageInputs;
  for (const key of Object.keys(DEFAULT_INPUTS) as (keyof MortgageInputs)[]) {
    const raw = draft[key].trim().replace(",", ".");
    const value = Number(raw);
    inputs[key] = value;
    if (!raw || !/^-?\d+(\.\d*)?$/.test(raw) || !Number.isFinite(value)) {
      errors[key] = "Introduce un número válido.";
    } else if (value < 0) {
      errors[key] = "El valor no puede ser negativo.";
    } else if ((key === "price" || key === "years") && value <= 0) {
      errors[key] = "Debe ser mayor que cero.";
    } else if (key === "years" && !Number.isInteger(value)) {
      errors[key] = "Introduce un número entero de años.";
    }
  }
  return { inputs: Object.keys(errors).length ? null : inputs, errors };
}

function assertNonNegative(...values: number[]) {
  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new RangeError("Los valores deben ser finitos y no negativos.");
  }
}

/** French amortization. log1p/expm1 avoid cancellation for very small rates. */
export function monthlyPayment(
  capital: number,
  annualTin: number,
  years: number,
): number {
  assertNonNegative(capital, annualTin, years);
  if (years <= 0 || !Number.isInteger(years))
    throw new RangeError("El plazo debe ser un número entero positivo.");
  const installments = years * 12;
  if (capital === 0) return 0;
  if (annualTin === 0) return capital / installments;
  const monthlyRate = annualTin / 100 / 12;
  return (
    (capital * monthlyRate) /
    -Math.expm1(-installments * Math.log1p(monthlyRate))
  );
}

export function calculateMortgage(inputs: MortgageInputs): MortgageResult {
  assertNonNegative(...Object.values(inputs));
  if (inputs.price === 0)
    throw new RangeError("El precio debe ser mayor que cero.");
  const baseFees = inputs.price * (inputs.commission / 100);
  const feesVat = baseFees * (inputs.commissionVat / 100);
  const totalFees = baseFees + feesVat;
  const transferTax = inputs.price * (inputs.itp / 100);
  const totalCosts = totalFees + transferTax + inputs.otherCosts;
  const realDownPayment = inputs.cash - totalCosts;
  const mortgage = Math.max(0, inputs.price - realDownPayment);
  const payment = monthlyPayment(mortgage, inputs.tin, inputs.years);
  const paymentCapacity = inputs.income * (EFFORT_REFERENCE / 100);
  const totalRepaid = payment * inputs.years * 12;
  const result: MortgageResult = {
    baseFees,
    feesVat,
    totalFees,
    transferTax,
    totalCosts,
    realDownPayment,
    appliedDownPayment: Math.min(inputs.price, Math.max(0, realDownPayment)),
    surplusCash: Math.max(0, realDownPayment - inputs.price),
    cashShortfall: Math.max(0, -realDownPayment),
    mortgage,
    financedPercent: (mortgage / inputs.price) * 100,
    payment,
    paymentCapacity,
    effort:
      inputs.income === 0
        ? payment === 0
          ? 0
          : null
        : (payment / inputs.income) * 100,
    monthlyMargin: paymentCapacity - payment,
    totalRepaid,
    totalInterest: Math.max(0, totalRepaid - mortgage),
  };
  if (
    Object.values(result).some(
      (value) => value !== null && !Number.isFinite(value),
    )
  ) {
    throw new RangeError(
      "Los valores son demasiado elevados para calcular este escenario.",
    );
  }
  return result;
}

export function calculateStress(inputs: MortgageInputs, mortgage: number) {
  const payment = monthlyPayment(mortgage, STRESS_TIN, inputs.years);
  return {
    payment,
    effort:
      inputs.income === 0
        ? payment === 0
          ? 0
          : null
        : (payment / inputs.income) * 100,
    difference: payment - monthlyPayment(mortgage, inputs.tin, inputs.years),
  };
}
