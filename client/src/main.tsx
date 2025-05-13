import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Импорт i18n для инициализации, если его нет в App.tsx
import "./lib/i18n";

createRoot(document.getElementById("root")!).render(
  <App />
);
