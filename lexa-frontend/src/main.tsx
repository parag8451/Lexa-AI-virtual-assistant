import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./lib/pwa";

// Initialize dark mode from localStorage or default to dark
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.documentElement.classList.remove("dark");
} else {
  document.documentElement.classList.add("dark");
  localStorage.setItem("theme", "dark");
}

// Register service worker for PWA support
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
