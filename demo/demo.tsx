import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Playground } from "../src/editor";

function App() {
  const [key, setKey] = useState<string>("");
  return (
    <div>
      <h1>Playground demo</h1>
      <div className="vt-embed-key-form">
        <label className="vt-embed-key-label" htmlFor="key">
          VAL_TOWN_API_KEY
        </label>
        <input
          className="vt-embed-key-input"
          type="text"
          id="key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
      </div>
      <Playground
        module="@valtown/sdk"
        code="console.log(1)"
        env={{
          VAL_TOWN_API_KEY: key,
        }}
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
