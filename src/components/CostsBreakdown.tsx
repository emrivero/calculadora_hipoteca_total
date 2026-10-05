import { formatMoney, formatPercent } from "../domain/formatters";
import type { MortgageInputs, MortgageResult } from "../domain/types";
import { Icon } from "./Icon";

export function CostsBreakdown({
  inputs,
  result,
}: {
  inputs: MortgageInputs;
  result: MortgageResult;
}) {
  const costPortion =
    inputs.cash > 0
      ? Math.min(100, (result.totalCosts / inputs.cash) * 100)
      : 0;
  const entryPortion =
    inputs.cash > 0 ? (result.appliedDownPayment / inputs.cash) * 100 : 0;
  return (
    <section className="card breakdown" aria-labelledby="breakdown-title">
      <div className="card-heading">
        <div>
          <span className="eyebrow">CADA EURO, EN SU SITIO</span>
          <h2 id="breakdown-title">¿Dónde va tu efectivo?</h2>
        </div>
        <span className="heading-icon">
          <Icon name="compare" />
        </span>
      </div>
      <p className="section-description">
        Tu entrada disponible también paga los impuestos y los gastos.
      </p>
      <div className="cash-total">
        <span>Efectivo total disponible</span>
        <strong>{formatMoney(inputs.cash)}</strong>
      </div>
      <div
        className="cash-bar"
        role="img"
        aria-label={`${formatMoney(Math.min(inputs.cash, result.totalCosts), true)} de efectivo para gastos, ${formatMoney(result.appliedDownPayment, true)} para la vivienda y ${formatMoney(result.surplusCash, true)} sobrantes.`}
      >
        <span className="bar-costs" style={{ width: `${costPortion}%` }} />
        <span className="bar-entry" style={{ width: `${entryPortion}%` }} />
        {result.surplusCash > 0 && (
          <span className="bar-surplus" style={{ flex: 1 }} />
        )}
      </div>
      <div className="bar-legend">
        <span>
          <i className="dot-costs" />
          {result.cashShortfall > 0
            ? "Efectivo para gastos"
            : "Impuestos y gastos"}
          <strong>
            {formatMoney(Math.min(inputs.cash, result.totalCosts))}
          </strong>
        </span>
        <span>
          <i className="dot-entry" />
          Entrada real aplicada
          <strong>{formatMoney(result.appliedDownPayment)}</strong>
        </span>
        {result.surplusCash > 0 && (
          <span>
            <i className="dot-surplus" />
            Sobrante<strong>{formatMoney(result.surplusCash)}</strong>
          </span>
        )}
      </div>
      <dl className="cost-list">
        <div>
          <dt>
            ITP <span>{formatPercent(inputs.itp)}</span>
          </dt>
          <dd>{formatMoney(result.transferTax, true)}</dd>
        </div>
        <div>
          <dt>
            Honorarios antes de IVA{" "}
            <span>{formatPercent(inputs.commission)}</span>
          </dt>
          <dd>{formatMoney(result.baseFees, true)}</dd>
        </div>
        <div>
          <dt>
            IVA de los honorarios{" "}
            <span>{formatPercent(inputs.commissionVat)}</span>
          </dt>
          <dd>{formatMoney(result.feesVat, true)}</dd>
        </div>
        <div className="fees-subtotal">
          <dt>
            Honorarios totales <small>(base + IVA)</small>
          </dt>
          <dd>{formatMoney(result.totalFees, true)}</dd>
        </div>
        <div>
          <dt>Gestión, tasación y otros</dt>
          <dd>{formatMoney(inputs.otherCosts, true)}</dd>
        </div>
        <div className="cost-total">
          <dt>Gastos totales</dt>
          <dd>{formatMoney(result.totalCosts, true)}</dd>
        </div>
      </dl>
      <div
        className={`real-entry ${result.realDownPayment < 0 ? "negative-entry" : ""}`}
      >
        <div>
          <span>
            {result.realDownPayment < 0
              ? "Saldo después de gastos"
              : "Dinero que realmente va a la entrada"}
          </span>
          <strong data-testid="real-entry">
            {formatMoney(
              result.realDownPayment < 0
                ? result.realDownPayment
                : result.appliedDownPayment,
              true,
            )}
          </strong>
        </div>
        <Icon name="arrow" size={25} />
      </div>
      <p className="breakdown-note">
        {result.cashShortfall > 0
          ? `Faltan ${formatMoney(result.cashShortfall, true)} solo para cubrir los gastos.`
          : result.surplusCash > 0
            ? `Puedes pagar toda la vivienda sin hipoteca y te sobran ${formatMoney(result.surplusCash, true)}.`
            : "Esta es la parte de tu efectivo que reduce la hipoteca que necesitas."}
      </p>
    </section>
  );
}
