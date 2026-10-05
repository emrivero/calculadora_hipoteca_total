import { EFFORT_REFERENCE } from "../domain/mortgage";
import { formatMoney } from "../domain/formatters";
import type { MortgageInputs, MortgageResult } from "../domain/types";
import { Icon } from "./Icon";
import { StressScenario } from "./StressScenario";

export function RiskAlerts({
  inputs,
  result,
}: {
  inputs: MortgageInputs;
  result: MortgageResult;
}) {
  const alerts: {
    title: string;
    detail: string;
    type: "danger" | "warning";
  }[] = [];
  if (result.cashShortfall > 0)
    alerts.push({
      type: "danger",
      title:
        "El efectivo disponible no cubre ni siquiera los impuestos y gastos de la operación.",
      detail: `Necesitas ${formatMoney(result.cashShortfall, true)} adicionales para cubrirlos, antes de aportar dinero a la vivienda.`,
    });
  if (result.mortgage > inputs.price)
    alerts.push({
      type: "danger",
      title: "La hipoteca supera el precio de la vivienda.",
      detail:
        "La operación requeriría financiar gastos de compra y probablemente no sea viable con una hipoteca convencional.",
    });
  if (result.effort === null)
    alerts.push({
      type: "danger",
      title: "No hay ingresos netos para cubrir la cuota.",
      detail:
        "No se puede calcular un porcentaje de esfuerzo con ingresos de 0 €. Cuota máxima de referencia: 0 €/mes.",
    });
  else if (result.effort > EFFORT_REFERENCE)
    alerts.push({
      type: "danger",
      title:
        "El esfuerzo hipotecario supera el 33 % de los ingresos netos familiares.",
      detail: `Cuota máxima recomendada: ${formatMoney(result.paymentCapacity)}/mes.`,
    });
  if (result.financedPercent >= 90)
    alerts.push({
      type: "warning",
      title: "La financiación es igual o superior al 90 %.",
      detail:
        "Algunos bancos pueden aplicar condiciones más exigentes o un tipo de interés superior.",
    });
  if (!alerts.length) return null;
  return (
    <div className="risks" aria-label="Avisos del escenario">
      {alerts.map((alert) => (
        <div className={`risk-alert ${alert.type}`} key={alert.title}>
          <Icon name="warning" />
          <div>
            <h3>{alert.title}</h3>
            <p>{alert.detail}</p>
          </div>
        </div>
      ))}
      {result.financedPercent >= 90 && (
        <StressScenario inputs={inputs} result={result} />
      )}
    </div>
  );
}
