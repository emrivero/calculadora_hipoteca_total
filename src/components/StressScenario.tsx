import { calculateStress, STRESS_TIN } from "../domain/mortgage";
import {
  formatMoney,
  formatPercent,
  formatSignedMoney,
} from "../domain/formatters";
import type { MortgageInputs, MortgageResult } from "../domain/types";

export function StressScenario({
  inputs,
  result,
}: {
  inputs: MortgageInputs;
  result: MortgageResult;
}) {
  const stress = calculateStress(inputs, result.mortgage);
  return (
    <section className="stress-scenario" aria-labelledby="stress-title">
      <span className="eyebrow">UNA MIRADA CON PERSPECTIVA</span>
      <h3 id="stress-title">Escenario de estrés al 4 % TIN</h3>
      <div className="stress-grid">
        <div>
          <span>TIN actual · {formatPercent(inputs.tin)}</span>
          <strong>
            {formatMoney(result.payment, true)}
            <small>/mes</small>
          </strong>
        </div>
        <span className="stress-arrow">→</span>
        <div>
          <span>TIN {formatPercent(STRESS_TIN)}</span>
          <strong>
            {formatMoney(stress.payment, true)}
            <small>/mes</small>
          </strong>
        </div>
      </div>
      <div className="stress-footer">
        <span>
          Esfuerzo: <b>{formatPercent(stress.effort)}</b>
        </span>
        <span className="difference">
          {formatSignedMoney(stress.difference)}/mes
        </span>
      </div>
      {inputs.tin >= STRESS_TIN && (
        <p className="field-help">
          El 4 % es una referencia fija; no supone una subida respecto a tu TIN
          actual.
        </p>
      )}
    </section>
  );
}
