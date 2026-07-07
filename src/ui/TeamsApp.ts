/**
 * Orquestração da interface: DOM + estado + domínio.
 */

import { DrawEngine } from "../domain/DrawEngine";
import { nameKey, normalizePlayer } from "../domain/playerUtils";
import type { DrawResult, Player } from "../domain/types";
import { WhatsAppExporter } from "../domain/WhatsAppExporter";
import { TeamsStorage } from "../storage/TeamsStorage";
import { copyTextToClipboard } from "../utils/clipboard";

/** Com 2 times, só 2 goleiros entram em campo (1 por time). */
const GK_MAX = 2;

type MessageKind = "error" | "warn" | "info" | "ok";

function req<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Elemento #${id} não encontrado.`);
  return el as T;
}

const TEAM_DOT_COLORS = ["var(--team-a)", "var(--team-b)"];

export class TeamsApp {
  private readonly storage = new TeamsStorage();
  private readonly drawEngine = new DrawEngine();

  private players: Player[] = [];
  private lastShareText = "";

  private readonly playerName = req<HTMLInputElement>("playerName");
  private readonly canGK = req<HTMLInputElement>("canGK");
  private readonly btnAdd = req<HTMLButtonElement>("btnAdd");
  private readonly playersList = req<HTMLUListElement>("playersList");
  private readonly emptyHint = req<HTMLElement>("emptyHint");
  private readonly liveStatus = req<HTMLElement>("liveStatus");
  private readonly playerCount = req<HTMLElement>("playerCount");
  private readonly perTeam = req<HTMLInputElement>("perTeam");
  private readonly btnDraw = req<HTMLButtonElement>("btnDraw");
  private readonly btnClearTeams = req<HTMLButtonElement>("btnClearTeams");
  private readonly btnClearPlayers = req<HTMLButtonElement>("btnClearPlayers");
  private readonly btnCopy = req<HTMLButtonElement>("btnCopy");
  private readonly message = req<HTMLElement>("message");
  private readonly warningsBlock = req<HTMLUListElement>("warningsBlock");
  private readonly resultsSection = req<HTMLElement>("resultsSection");
  private readonly listaNumerada = req<HTMLUListElement>("listaNumerada");
  private readonly teamsGrid = req<HTMLElement>("teamsGrid");
  private readonly reservasBlock = req<HTMLElement>("reservasBlock");
  private readonly reservasList = req<HTMLUListElement>("reservasList");
  private readonly helpModal = req<HTMLDialogElement>("helpModal");
  private readonly btnHelp = req<HTMLButtonElement>("btnHelp");
  private readonly btnCloseHelp = req<HTMLButtonElement>("btnCloseHelp");
  private readonly tabBtnPreparar = req<HTMLButtonElement>("tabBtnPreparar");
  private readonly tabBtnResultado = req<HTMLButtonElement>("tabBtnResultado");
  private readonly tabPreparar = req<HTMLElement>("tabPreparar");
  private readonly tabResultado = req<HTMLElement>("tabResultado");

  mount(): void {
    this.loadState();
    this.renderPlayers();
    this.bindEvents();
  }

  private bindEvents(): void {
    this.perTeam.addEventListener("change", () => {
      this.saveState();
      this.updateLiveStatus();
    });

    this.btnAdd.addEventListener("click", () => this.addPlayer());
    this.playerName.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.addPlayer();
      }
    });
    this.btnDraw.addEventListener("click", () => this.runDraw());
    this.btnClearTeams.addEventListener("click", () => this.clearTeams());
    this.btnClearPlayers.addEventListener("click", () => this.clearPlayers());
    this.btnCopy.addEventListener("click", () => this.copyShare());
    this.btnHelp.addEventListener("click", () => this.helpModal.showModal());
    this.btnCloseHelp.addEventListener("click", () => this.helpModal.close());
    this.helpModal.addEventListener("click", (e) => {
      if (e.target === this.helpModal) this.helpModal.close();
    });
    this.tabBtnPreparar.addEventListener("click", () => this.switchTab("preparar"));
    this.tabBtnResultado.addEventListener("click", () => this.switchTab("resultado"));
  }

  private switchTab(tab: "preparar" | "resultado"): void {
    const showResult = tab === "resultado";
    this.tabPreparar.hidden = showResult;
    this.tabResultado.hidden = !showResult;
    this.tabBtnPreparar.classList.toggle("is-active", !showResult);
    this.tabBtnResultado.classList.toggle("is-active", showResult);
    this.tabBtnPreparar.setAttribute("aria-selected", String(!showResult));
    this.tabBtnResultado.setAttribute("aria-selected", String(showResult));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  private loadState(): void {
    const data = this.storage.load();
    if (!data) return;
    if (data.players) this.players = data.players;
    if (data.perTeam != null) this.perTeam.value = String(data.perTeam);
  }

  private saveState(): void {
    this.storage.save({
      players: this.players,
      perTeam: this.perTeam.value,
    });
  }

  private showMessage(text: string, type: MessageKind): void {
    this.message.hidden = false;
    this.message.textContent = text;
    const cls =
      type === "error"
        ? "msg-error"
        : type === "warn"
          ? "msg-warn"
          : type === "ok"
            ? "msg-ok"
            : "msg-info";
    this.message.className = `msg ${cls}`;
  }

  private hideMessage(): void {
    this.message.hidden = true;
    this.message.textContent = "";
    this.message.className = "msg";
  }

  private setWarnings(lines: readonly string[]): void {
    this.warningsBlock.innerHTML = "";
    if (!lines.length) {
      this.warningsBlock.hidden = true;
      return;
    }
    this.warningsBlock.hidden = false;
    for (const t of lines) {
      const li = document.createElement("li");
      li.textContent = t;
      this.warningsBlock.appendChild(li);
    }
  }

  private existingNameKeys(): Record<string, boolean> {
    const set: Record<string, boolean> = {};
    for (const p of this.players) set[nameKey(p.name)] = true;
    return set;
  }

  private addPlayer(): void {
    const name = this.playerName.value.trim();
    if (!name) return;
    const key = nameKey(name);
    if (this.existingNameKeys()[key]) {
      this.showMessage("Esse nome já está na lista (evita duplicata do Zap).", "error");
      return;
    }
    this.players.push({
      name,
      canGK: this.canGK.checked,
    });
    this.playerName.value = "";
    this.canGK.checked = false;
    this.playerName.focus();
    this.renderPlayers();
    this.hideMessage();
    this.setWarnings([]);
  }

  private extraForPlayer(p: Player): string {
    return p.canGK ? "· gol" : "";
  }

  private buildNumLi(num: number, label: string, extra: string): HTMLLIElement {
    const li = document.createElement("li");
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = String(num);
    li.appendChild(n);
    const t = document.createElement("span");
    t.textContent = label;
    li.appendChild(t);
    if (extra) {
      const s = document.createElement("span");
      s.style.color = "var(--muted)";
      s.style.fontSize = "0.82rem";
      s.textContent = extra;
      li.appendChild(s);
    }
    return li;
  }

  private renderPlayers(): void {
    this.playersList.innerHTML = "";
    this.playerCount.textContent = String(this.players.length);
    this.emptyHint.hidden = this.players.length > 0;

    this.players.forEach((p, index) => {
      const li = document.createElement("li");
      const meta = document.createElement("div");
      meta.className = "meta";
      const nameSpan = document.createElement("span");
      nameSpan.className = "name-part";
      nameSpan.textContent = p.name;
      meta.appendChild(nameSpan);

      if (p.canGK) {
        const b = document.createElement("span");
        b.className = "badge-gk";
        b.textContent = "Gol";
        meta.appendChild(b);
      }

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "btn-danger";
      removeBtn.textContent = "Remover";
      removeBtn.setAttribute("aria-label", `Remover ${p.name}`);
      removeBtn.addEventListener("click", () => {
        this.players.splice(index, 1);
        this.renderPlayers();
        this.saveState();
      });

      li.appendChild(meta);
      li.appendChild(removeBtn);
      this.playersList.appendChild(li);
    });
    this.updateLiveStatus();
    this.saveState();
  }

  /** Feedback ao vivo enquanto o organizador cadastra quem vai chegando. */
  private updateLiveStatus(): void {
    this.liveStatus.innerHTML = "";
    if (this.players.length === 0) return;

    const field = this.players.filter((p) => !p.canGK).length;
    const gks = this.players.filter((p) => p.canGK).length;
    const perTeam = parseInt(this.perTeam.value, 10);
    const titularesField = (Number.isFinite(perTeam) && perTeam > 0 ? perTeam : 6) * 2;

    const lines: { text: string; kind: "ok" | "info" | "warn" }[] = [];

    if (field < titularesField) {
      const faltam = titularesField - field;
      lines.push({
        text: `${field}/${titularesField} — faltam ${faltam} pra fechar os 2 times.`,
        kind: "info",
      });
    } else {
      const extras = field - titularesField;
      let msg = `Pronto pra sortear: ${field} jogador${field > 1 ? "es" : ""}`;
      if (gks) msg += ` + ${gks} goleiro${gks > 1 ? "s" : ""}`;
      msg += ".";
      if (extras > 0) msg += ` ${extras} pro 3º time / reservas.`;
      lines.push({ text: msg, kind: "ok" });
    }

    if (gks > GK_MAX) {
      lines.push({
        text: `⚠ ${gks} goleiros — só ${GK_MAX} entram (1 por time); os demais ficam de fora do gol.`,
        kind: "warn",
      });
    }

    for (const line of lines) {
      const p = document.createElement("p");
      p.className = `live-${line.kind}`;
      p.textContent = line.text;
      this.liveStatus.appendChild(p);
    }
  }

  private runDraw(): void {
    this.hideMessage();
    this.setWarnings([]);

    const nPerTeam = parseInt(this.perTeam.value, 10);

    if (!Number.isFinite(nPerTeam) || nPerTeam < 1) {
      this.showMessage("Jogadores por time inválido.", "error");
      return;
    }
    if (this.players.length === 0) {
      this.showMessage("Cadastre a lista antes de sortear.", "error");
      return;
    }

    const result = this.drawEngine.draw(
      this.players.map((p) => normalizePlayer(p)),
      { listaMax: this.players.length, nPerTeam }
    );

    this.renderDrawResult(result);
    this.setWarnings(result.warnings);

    this.lastShareText = WhatsAppExporter.buildShareText(result);
    this.resultsSection.hidden = false;
    this.tabBtnResultado.disabled = false;
    this.switchTab("resultado");
    this.saveState();
  }

  private renderDrawResult(r: DrawResult): void {
    const titularesTotal = r.titularesTotal;

    this.listaNumerada.innerHTML = "";
    for (let i = 0; i < r.naLista.length; i++) {
      const p = r.naLista[i]!;
      this.listaNumerada.appendChild(
        this.buildNumLi(i + 1, p.name, this.extraForPlayer(p))
      );
    }

    this.teamsGrid.innerHTML = "";
    const sides: {
      name: string;
      members: Player[];
      gk: Player | null;
    }[] = [
      {
        name: "Time Azul",
        members: r.teamA,
        gk: r.gkA.player,
      },
      {
        name: "Time Vermelho",
        members: r.teamB,
        gk: r.gkB.player,
      },
    ];

    sides.forEach((side, idx) => {
      const block = document.createElement("div");
      block.className = "team";
      const h3 = document.createElement("h3");
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.style.background = TEAM_DOT_COLORS[idx % TEAM_DOT_COLORS.length]!;
      h3.appendChild(dot);
      h3.appendChild(document.createTextNode(side.name));
      block.appendChild(h3);
      const tm = document.createElement("p");
      tm.className = "team-meta";
      tm.textContent = "Ordem do sorteio";
      block.appendChild(tm);
      const pGk = document.createElement("p");
      pGk.className = "gk-line";
      pGk.textContent = side.gk ? `Goleiro: ${side.gk.name}` : "Goleiro: a combinar (sai um da reserva)";
      block.appendChild(pGk);
      const ul = document.createElement("ul");
      ul.className = "num-list";
      side.members.forEach((p, i) => {
        ul.appendChild(this.buildNumLi(i + 1, p.name, ""));
      });
      block.appendChild(ul);
      this.teamsGrid.appendChild(block);
    });

    if (r.reservas.length) {
      this.reservasBlock.hidden = false;
      this.reservasList.innerHTML = "";
      r.reservas.forEach((p, j) => {
        const num = titularesTotal + j + 1;
        this.reservasList.appendChild(
          this.buildNumLi(num, p.name, this.extraForPlayer(p))
        );
      });
    } else {
      this.reservasBlock.hidden = true;
      this.reservasList.innerHTML = "";
    }
  }

  private async copyShare(): Promise<void> {
    if (!this.lastShareText) {
      this.showMessage("Sorteia primeiro.", "error");
      return;
    }
    const ok = await copyTextToClipboard(this.lastShareText);
    if (ok) this.showMessage("Copiado. Cola no WhatsApp.", "ok");
    else
      this.showMessage(
        "Não deu pra copiar automaticamente — seleciona o texto manualmente.",
        "error"
      );
  }

  private clearTeams(): void {
    this.listaNumerada.innerHTML = "";
    this.teamsGrid.innerHTML = "";
    this.reservasList.innerHTML = "";
    this.reservasBlock.hidden = true;
    this.resultsSection.hidden = true;
    this.tabBtnResultado.disabled = true;
    this.switchTab("preparar");
    this.lastShareText = "";
    this.hideMessage();
    this.setWarnings([]);
    this.saveState();
  }

  private clearPlayers(): void {
    if (this.players.length && !confirm("Apagar todos os jogadores e o sorteio?")) return;
    this.players = [];
    this.renderPlayers();
    this.clearTeams();
  }
}
