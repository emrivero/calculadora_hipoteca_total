import type {
  InputKey,
  MortgageDraft,
  ValidationErrors,
} from "../domain/types";
import { Icon } from "./Icon";

interface Props {
  draft: MortgageDraft;
  errors: ValidationErrors;
  onChange: (key: InputKey, value: string) => void;
  onReset: () => void;
}

export function CalculatorForm({ draft, errors, onChange, onReset }: Props) {
  function field(key: InputKey, label: string, unit: string, help?: string) {
    return (
      <div className={`field ${errors[key] ? "field-invalid" : ""}`}>
        <label htmlFor={key}>{label}</label>
        <div className="input-wrap">
          <input
            id={key}
            name={key}
            type="text"
            inputMode={key === "years" ? "numeric" : "decimal"}
            value={draft[key]}
            onChange={(event) => onChange(key, event.target.value)}
            autoComplete="off"
            aria-invalid={!!errors[key]}
            aria-describedby={
              errors[key] ? `${key}-error` : help ? `${key}-help` : undefined
            }
          />
          <span className="input-unit">{unit}</span>
        </div>
        {help && (
          <p className="field-help" id={`${key}-help`}>
            {help}
          </p>
        )}
        {errors[key] && (
          <p className="field-error" id={`${key}-error`}>
            {errors[key]}
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="card parameters" aria-labelledby="parameters-title">
      <div className="card-heading">
        <div>
          <span className="eyebrow">TU PUNTO DE PARTIDA</span>
          <h2 id="parameters-title">Los números de tu casa</h2>
        </div>
        <span className="heading-icon">
          <Icon name="home" />
        </span>
      </div>
      <form onSubmit={(event) => event.preventDefault()} noValidate>
        <fieldset>
          <legend>
            <span>01</span> La compra
          </legend>
          {field("price", "Precio de la vivienda", "€")}
          {field(
            "cash",
            "Efectivo / entrada inicial disponible",
            "€",
            "Todo tu efectivo disponible, incluidos impuestos y gastos.",
          )}
        </fieldset>
        <fieldset>
          <legend>
            <span>02</span> Impuestos y gastos
          </legend>
          <div className="field-row">
            {field("commission", "Comisión inmobiliaria", "%")}
            {field("commissionVat", "IVA de la comisión", "%")}
          </div>
          <div className="field-row">
            {field(
              "itp",
              "ITP",
              "%",
              "Impuesto sobre transmisiones patrimoniales.",
            )}
            {field("otherCosts", "Gestión, tasación y otros", "€")}
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <span>03</span> Tu hipoteca
          </legend>
          <div className="field-row">
            {field("years", "Plazo hipotecario", "años")}
            {field("tin", "TIN hipotecario", "%")}
          </div>
          <p className="fieldset-help">
            TIN: tipo de interés nominal anual de la hipoteca.
          </p>
          {field(
            "income",
            "Sueldo neto mensual familiar",
            "€/mes",
            "La suma de los ingresos netos de la unidad familiar.",
          )}
        </fieldset>
        <button type="button" className="reset-button" onClick={onReset}>
          <Icon name="reset" size={15} /> Restablecer valores
        </button>
      </form>
      <div className="local-note">
        <Icon name="shield" size={16} />
        <span>Tus datos se quedan en este navegador.</span>
      </div>
    </section>
  );
}
