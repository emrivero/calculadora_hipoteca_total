import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MortgageCalculator } from "./components/MortgageCalculator";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MortgageCalculator />
  </StrictMode>,
);
