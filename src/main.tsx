import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Updated import path
import "./index.css";
import { installGlobalAuthFetchInterceptor } from "./utils/session";

installGlobalAuthFetchInterceptor();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
