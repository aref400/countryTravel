import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app/App.tsx";
import { initSentry } from "./shared/observability/sentry.ts";
import "./index.css";

// Supervision des erreurs : activée uniquement si VITE_SENTRY_DSN est défini.
initSentry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
