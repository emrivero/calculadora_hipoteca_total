import { useRef, useState } from "react";
import { calculateMortgage } from "../domain/mortgage";
import { formatMoney, formatPercent } from "../domain/formatters";
import type { MortgageInputs, Scenario } from "../domain/types";
import { Icon } from "./Icon";

export function ScenarioComparison({
  inputs,
  onLoad,
}: {
  inputs: MortgageInputs | null;
  onLoad: (inputs: MortgageInputs) => void;
}) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [name, setName] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const nextId = useRef(1);
  function save() {
    if (!inputs) return;
    const scenarioName = name.trim() || `Casa ${formatMoney(inputs.price)}`;
    const scenario = {
      id: nextId.current++,
      name: scenarioName,
      inputs: { ...inputs },
    };
    setScenarios((previous) => [...previous, scenario]);
    setName("");
    setAnnouncement(`Escenario «${scenarioName}» guardado.`);
  }
  return (
    <section
      className="card comparison"
      id="comparar"
      aria-labelledby="compare-title"
    >
      <div className="card-heading">
        <div>
          <span className="eyebrow">DECIDE CON TODOS LOS NÚMEROS</span>
          <h2 id="compare-title">Una casa. Otra casa. Compáralas.</h2>
        </div>
        <span className="scenario-count">{scenarios.length} guardados</span>
      </div>
      <p className="section-description">
        Guarda tus opciones y encuentra la que encaja contigo. Se conservan
        hasta recargar la página.
      </p>
      <form
        className="scenario-form"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <div>
          <label htmlFor="scenario-name">Nombre del escenario</label>
          <input
            id="scenario-name"
            value={name}
            maxLength={60}
            onChange={(event) => setName(event.target.value)}
            placeholder="Por ejemplo, Casa 255k"
          />
        </div>
        <button className="primary-button" type="submit" disabled={!inputs}>
          <Icon name="plus" size={17} /> Guardar escenario actual
        </button>
      </form>
      <p className="sr-only" role="status">
        {announcement}
      </p>
      {scenarios.length === 0 ? (
        <div className="comparison-empty">
          <span className="empty-icon">
            <Icon name="compare" size={22} />
          </span>
          <div>
            <strong>Tu próxima casa empieza por comparar</strong>
            <p>
              Guarda este escenario, ajusta los valores y añade otra opción.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="table-scroll"
          role="region"
          aria-label="Tabla de escenarios guardados"
          tabIndex={0}
        >
          <table>
            <caption className="sr-only">
              Comparación de viviendas. Carga un escenario para volver a
              editarlo.
            </caption>
            <thead>
              <tr>
                <th>Escenario</th>
                <th>Precio</th>
                <th>Efectivo</th>
                <th>Hipoteca</th>
                <th>Financiado</th>
                <th>TIN</th>
                <th>Plazo</th>
                <th>Cuota / mes</th>
                <th>Esfuerzo</th>
                <th>
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => {
                const result = calculateMortgage(scenario.inputs);
                return (
                  <tr key={scenario.id}>
                    <th scope="row">
                      <button
                        className="scenario-load"
                        onClick={() => {
                          onLoad({ ...scenario.inputs });
                          setAnnouncement(
                            `Escenario «${scenario.name}» cargado en el formulario.`,
                          );
                        }}
                        title="Cargar en el formulario"
                      >
                        {scenario.name}
                        <Icon name="arrow" size={14} />
                      </button>
                    </th>
                    <td>{formatMoney(scenario.inputs.price)}</td>
                    <td>{formatMoney(scenario.inputs.cash)}</td>
                    <td>{formatMoney(result.mortgage)}</td>
                    <td
                      className={
                        result.financedPercent >= 90 ? "text-warning" : ""
                      }
                    >
                      {formatPercent(result.financedPercent)}
                    </td>
                    <td>{formatPercent(scenario.inputs.tin)}</td>
                    <td>{scenario.inputs.years} años</td>
                    <td className="table-payment">
                      {formatMoney(result.payment, true)}
                    </td>
                    <td
                      className={
                        result.effort === null || result.effort > 33
                          ? "text-danger"
                          : ""
                      }
                    >
                      {formatPercent(result.effort)}
                    </td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={`Eliminar ${scenario.name}`}
                        onClick={() => {
                          setScenarios((previous) =>
                            previous.filter((item) => item.id !== scenario.id),
                          );
                          setAnnouncement(
                            `Escenario «${scenario.name}» eliminado.`,
                          );
                        }}
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
