import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { DesignSystemPage } from "./DesignSystemPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DesignSystemPage />
  </StrictMode>,
);
