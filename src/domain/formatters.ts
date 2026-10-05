const euro = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  useGrouping: true,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const euroCents = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  useGrouping: true,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const percent = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });
export const formatMoney = (value: number, cents = false) =>
  (cents ? euroCents : euro).format(value);
export const formatPercent = (value: number | null) =>
  value === null ? "Sin ingresos" : `${percent.format(value)} %`;
export const formatSignedMoney = (value: number) =>
  `${value > 0 ? "+" : ""}${formatMoney(value, true)}`;
