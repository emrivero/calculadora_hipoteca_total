import { EFFORT_REFERENCE } from "../domain/mortgage";
import { formatMoney, formatPercent } from "../domain/formatters";
import type { MortgageInputs, MortgageResult } from "../domain/types";
import { Icon } from "./Icon";

export function SummaryCard({
  inputs,
  result,
}: {
  inputs: MortgageInputs;
  result: MortgageResult;
}) {
  const highEffort = result.effort === null || result.effort > EFFORT_REFERENCE;
  return (
    <section className="summary" aria-labelledby="summary-title">
      <div className="summary-top">
        <span className="eyebrow" id="summary-title">
          ASÍ QUEDARÍA TU HIPOTECA
        </span>
        <span className="live-badge">
          <i /> En tiempo real
        </span>
      </div>
      <p className="payment-label">Tu cuota mensual</p>
      <div className="payment">
        <span data-testid="monthly-payment">{formatMoney(result.payment)}</span>
        <span className="per-month">/mes</span>
      </div>
      <p className="loan-detail">
        {inputs.years} años · TIN {formatPercent(inputs.tin)} · Cuota constante
      </p>
      <div className="summary-metrics">
        <div>
          <span>Hipoteca necesaria</span>
          <strong data-testid="mortgage">{formatMoney(result.mortgage)}</strong>
        </div>
        <div>
          <span>Financiación</span>
          <strong
            className={result.financedPercent >= 90 ? "metric-warning" : ""}
          >
            {formatPercent(result.financedPercent)}
          </strong>
          <small>del precio de la vivienda</small>
        </div>
        <div>
          <span>Esfuerzo hipotecario</span>
          <strong className={highEffort ? "metric-danger" : ""}>
            {formatPercent(result.effort)}
          </strong>
          <small>de tus ingresos netos</small>
        </div>
      </div>
      <div
        className={`effort-status ${highEffort ? "effort-status-risk" : ""}`}
      >
        <Icon name={highEffort ? "warning" : "check"} size={17} />
        {result.effort === null
          ? "Sin ingresos para cubrir la cuota"
          : highEffort
            ? "Tu cuota supera la referencia del 33 %"
            : "Tu cuota está dentro de la referencia del 33 %"}
      </div>
      <div className="capacity">
        <div>
          <span>
            Capacidad máxima de pago <small>(33 %)</small>
          </span>
          <strong>
            {formatMoney(result.paymentCapacity)}
            <small>/mes</small>
          </strong>
        </div>
        <div>
          <span>Margen mensual hasta el 33 %</span>
          <strong>
            {formatMoney(result.monthlyMargin)}
            <small>/mes</small>
          </strong>
        </div>
      </div>
    </section>
  );
}
