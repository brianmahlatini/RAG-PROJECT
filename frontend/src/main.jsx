// File: main.jsx
// Purpose: React app entrypoint.
// Overview:
// - Creates React root
// - Mounts App component
// File: main.jsx
// Purpose: React component for Tesla ChatBot UI.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);




