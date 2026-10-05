import { useState } from "react";
import {
  calculateMortgage,
  DEFAULT_INPUTS,
  parseDraft,
  toDraft,
} from "../domain/mortgage";
import { formatMoney } from "../domain/formatters";
import type { InputKey, MortgageResult } from "../domain/types";
import { CalculatorForm } from "./CalculatorForm";
import { CostsBreakdown } from "./CostsBreakdown";
import { Icon } from "./Icon";
import { RiskAlerts } from "./RiskAlerts";
import { ScenarioComparison } from "./ScenarioComparison";
import { SummaryCard } from "./SummaryCard";

export function MortgageCalculator() {
  const [draft, setDraft] = useState(() => toDraft(DEFAULT_INPUTS));
  const { inputs, errors } = parseDraft(draft);
  let result: MortgageResult | null = null;
  let calculationError = "";
  if (inputs) {
    try {
      result = calculateMortgage(inputs);
    } catch (error) {
      calculationError =
        error instanceof Error
          ? error.message
          : "Revisa los valores introducidos.";
    }
  }
  const update = (key: InputKey, value: string) =>
    setDraft((previous) => ({ ...previous, [key]: value }));
  return (
    <>
      <a className="skip-link" href="#calculadora">
        Saltar a la calculadora
      </a>
      <header className="site-header">
        <a className="brand" href="#" aria-label="Casa Clara, inicio">
          <span className="brand-icon">
            <Icon name="home" size={22} />
          </span>
          casa<span className="brand-light">clara</span>
          <span className="brand-dot">.</span>
        </a>
        <nav aria-label="Navegación principal">
          <a className="nav-active" href="#calculadora">
            Calculadora
          </a>
          <a href="#comparar">
            Comparar escenarios <Icon name="arrow" size={15} />
          </a>
        </nav>
        <span className="header-note">Grandes decisiones, cuentas claras.</span>
      </header>
      <main className="page-shell" id="calculadora">
        <div className="page-intro">
          <div>
            <span className="eyebrow intro-eyebrow">
              <span /> TU CASA, CON LAS CUENTAS CLARAS
            </span>
            <h1>
              Haz números.
              <br className="mobile-break" /> Siéntete en casa.
            </h1>
            <p>
              Descubre tu cuota, tu entrada real y hasta dónde puedes llegar.
            </p>
          </div>
          <div className="intro-tag">
            <Icon name="shield" size={18} />
            <span>
              Sin registros.
              <br />
              <strong>Solo tus números.</strong>
            </span>
          </div>
        </div>
        <div className="calculator-layout">
          <CalculatorForm
            draft={draft}
            errors={errors}
            onChange={update}
            onReset={() => setDraft(toDraft(DEFAULT_INPUTS))}
          />
          <div className="results-column">
            {inputs && result ? (
              <>
                <SummaryCard inputs={inputs} result={result} />
                <RiskAlerts inputs={inputs} result={result} />
                <CostsBreakdown inputs={inputs} result={result} />
                <details className="total-details">
                  <summary>
                    El coste de tu hipoteca a lo largo del plazo{" "}
                    <Icon name="plus" size={16} />
                  </summary>
                  <dl>
                    <div>
                      <dt>Capital financiado</dt>
                      <dd>{formatMoney(result.mortgage, true)}</dd>
                    </div>
                    <div>
                      <dt>Intereses totales</dt>
                      <dd>{formatMoney(result.totalInterest, true)}</dd>
                    </div>
                    <div>
                      <dt>Total de cuotas</dt>
                      <dd>{formatMoney(result.totalRepaid, true)}</dd>
                    </div>
                  </dl>
                  <p>
                    Con el mismo TIN durante {inputs.years} años, sin
                    amortizaciones anticipadas ni productos adicionales.
                  </p>
                </details>
              </>
            ) : (
              <div className="card invalid-results" role="status">
                <Icon name="info" size={30} />
                <h2>Vamos a revisar esos números</h2>
                <p>
                  {calculationError ||
                    "Completa los campos con valores válidos para ver tu hipoteca. El precio y el plazo deben ser mayores que cero."}
                </p>
              </div>
            )}
            <p className="sr-only" role="status" aria-live="polite">
              {result
                ? `Cuota mensual: ${formatMoney(result.payment)}. Hipoteca necesaria: ${formatMoney(result.mortgage)}.`
                : "Resultados no disponibles: revisa el formulario."}
            </p>
          </div>
        </div>
        <ScenarioComparison
          inputs={result ? inputs : null}
          onLoad={(value) => {
            setDraft(toDraft(value));
            document.getElementById("price")?.focus();
          }}
        />
        <aside className="method-note">
          <Icon name="info" size={18} />
          <p>
            Una simulación para orientarte. Cuotas calculadas con el sistema
            francés y TIN constante; no es una TAE ni una oferta bancaria. El
            ITP se aplica al precio introducido: comprueba el tipo y la base
            imponible de tu operación. La referencia del 33 % no incluye otras
            deudas ni gastos familiares. Ajusta los impuestos y honorarios a tu
            caso.
          </p>
        </aside>
      </main>
      <footer className="site-footer">
        <span className="footer-brand">casaclara.</span>
        <span>Menos dudas. Más hogar.</span>
        <span>Calculado aquí. Tus datos no se envían.</span>
      </footer>
    </>
  );
}
