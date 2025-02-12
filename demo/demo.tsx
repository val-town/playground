import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Playground } from "../src/editor";

function App() {
  return (
    <div>
      <h1>Playground demo</h1>
      <Playground code="console.log(1)" />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
