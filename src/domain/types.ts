export interface MortgageInputs {
  price: number;
  cash: number;
  commission: number;
  commissionVat: number;
  otherCosts: number;
  income: number;
  years: number;
  tin: number;
  itp: number;
}

export type InputKey = keyof MortgageInputs;
export type MortgageDraft = Record<InputKey, string>;
export type ValidationErrors = Partial<Record<InputKey, string>>;

export interface MortgageResult {
  baseFees: number;
  feesVat: number;
  totalFees: number;
  transferTax: number;
  totalCosts: number;
  realDownPayment: number;
  appliedDownPayment: number;
  surplusCash: number;
  cashShortfall: number;
  mortgage: number;
  financedPercent: number;
  payment: number;
  paymentCapacity: number;
  effort: number | null;
  monthlyMargin: number;
  totalInterest: number;
  totalRepaid: number;
}

export interface Scenario {
  id: number;
  name: string;
  inputs: MortgageInputs;
}
