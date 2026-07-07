import "./styles/app.css";
import { TeamsApp } from "./ui/TeamsApp";

if (import.meta.env.PROD) {
  // Produção: PWA com cache offline.
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
} else {
  // Dev: nada de service worker — ele cacheia scripts antigos e quebra o app.
  // Remove qualquer SW/cache que tenha sobrado de uma sessão anterior.
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {});
  }
  if ("caches" in window) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
  }
}

const app = new TeamsApp();
app.mount();
