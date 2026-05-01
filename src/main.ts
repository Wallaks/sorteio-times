import "./styles/app.css";
import { PeladaApp } from "./ui/PeladaApp";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}

const app = new PeladaApp();
app.mount();
