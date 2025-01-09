import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "primeflex/primeflex.css"; // PrimeFlex
import "primereact/resources/themes/saga-blue/theme.css"; // PrimeReact Theme
import "primereact/resources/primereact.min.css"; // PrimeReact Styles
import "primeicons/primeicons.css";

const root = ReactDOM.createRoot(document.getElementById("root-chat"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
