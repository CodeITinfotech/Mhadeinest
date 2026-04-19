import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";  // add this

// In production, point to your VPS API. Locally, empty string uses Vite proxy.
setBaseUrl(import.meta.env.VITE_API_URL || "");            // add this

createRoot(document.getElementById("root")!).render(<App />);