/**
 * Orquestração da interface: DOM + estado + domínio.
 */

import { Fut7DrawEngine } from "../domain/Fut7DrawEngine";
import { ListParser } from "../domain/ListParser";
import { LISTA_TEMPLATE_WHATSAPP } from "../domain/listaTemplate";
import { nameKey, normalizePlayer, clampStars, toPlayer } from "../domain/playerUtils";
import type { Fut7DrawResult, Player } from "../domain/types";
import { WhatsAppExporter } from "../domain/WhatsAppExporter";
import { PeladaStorage } from "../storage/PeladaStorage";
import { copyTextToClipboard } from "../utils/clipboard";

type MessageKind = "error" | "warn" | "info" | "ok";

function req<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Elemento #${id} não encontrado.`);
  return el as T;
}

const TEAM_DOT_COLORS = ["var(--team-a)", "var(--team-b)"];

export class PeladaApp {
  private readonly storage = new PeladaStorage();
  private readonly drawEngine = new Fut7DrawEngine();

  private players: Player[] = [];
  private lastShareText = "";

  private readonly playerName = req<HTMLInputElement>("playerName");
  private readonly canGK = req<HTMLInputElement>("canGK");
  private readonly btnAdd = req<HTMLButtonElement>("btnAdd");
  private readonly pasteList = req<HTMLTextAreaElement>("pasteList");
  private readonly btnPasteImport = req<HTMLButtonElement>("btnPasteImport");
  private readonly btnCopyTemplate = req<HTMLButtonElement>("btnCopyTemplate");
  private readonly playersList = req<HTMLUListElement>("playersList");
  private readonly emptyHint = req<HTMLElement>("emptyHint");
  private readonly playerCount = req<HTMLElement>("playerCount");
  private readonly listaMaxEl = req<HTMLInputElement>("listaMax");
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
  private readonly supletesBlock = req<HTMLElement>("supletesBlock");
  private readonly supletesList = req<HTMLUListElement>("supletesList");

  mount(): void {
    this.loadState();
    this.renderPlayers();
    this.bindEvents();
  }

  private bindEvents(): void {
    this.listaMaxEl.addEventListener("change", () => this.saveState());
    this.perTeam.addEventListener("change", () => this.saveState());

    this.btnAdd.addEventListener("click", () => this.addPlayer());
    this.playerName.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.addPlayer();
      }
    });
    this.btnPasteImport.addEventListener("click", () => this.importPaste());
    this.btnCopyTemplate.addEventListener("click", () => this.copyListaTemplate());
    this.btnDraw.addEventListener("click", () => this.runDraw());
    this.btnClearTeams.addEventListener("click", () => this.clearTeams());
    this.btnClearPlayers.addEventListener("click", () => this.clearPlayers());
    this.btnCopy.addEventListener("click", () => this.copyShare());
  }

  private loadState(): void {
    const data = this.storage.load();
    if (!data) return;
    if (data.players) this.players = data.players;
    if (data.listaMax != null) this.listaMaxEl.value = String(data.listaMax);
    if (data.perTeam != null) this.perTeam.value = String(data.perTeam);
  }

  private saveState(): void {
    this.storage.save({
      players: this.players,
      listaMax: this.listaMaxEl.value,
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
      stars: 3,
    });
    this.playerName.value = "";
    this.canGK.checked = false;
    this.playerName.focus();
    this.renderPlayers();
    this.hideMessage();
    this.setWarnings([]);
  }

  private importPaste(): void {
    const text = this.pasteList.value;
    const keys = this.existingNameKeys();
    let added = 0;
    let dup = 0;
    const defaultS = clampStars(3);

    const entries = ListParser.parse(text);
    for (const parsed of entries) {
      const key = nameKey(parsed.name);
      if (keys[key]) {
        dup++;
        continue;
      }
      keys[key] = true;
      this.players.push(toPlayer(parsed, defaultS));
      added++;
    }
    this.pasteList.value = "";
    this.renderPlayers();
    this.hideMessage();
    this.setWarnings([]);
    if (added === 0 && dup === 0) {
      this.showMessage(
        "Nada para importar — cole a lista do grupo (Lista do Fut / Goleiros / Suplentes), o modelo com [campo] ou um nome por linha.",
        "warn"
      );
    } else {
      let msg = `Importados ${added} jogador(es).`;
      if (dup) msg += ` Ignorados ${dup} duplicado(s).`;
      this.showMessage(msg, added ? "ok" : "info");
    }
  }

  private async copyListaTemplate(): Promise<void> {
    const ok = await copyTextToClipboard(LISTA_TEMPLATE_WHATSAPP);
    if (ok) {
      this.showMessage("Lista copiada. Cola no grupo e peça pra preencher e devolver.", "ok");
    } else {
      this.showMessage("Não deu pra copiar — selecione o texto manualmente no app.", "error");
    }
  }

  private extraForPlayer(p: Player): string {
    return p.canGK ? "· gol" : "";
  }

  private buildNumLi(num: number, label: string, extra: string): HTMLLIElement {
    const li = document.createElement("li");
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = `${String(num)}.`;
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
    this.saveState();
  }

  private runDraw(): void {
    this.hideMessage();
    this.setWarnings([]);

    const listaMax = parseInt(this.listaMaxEl.value, 10);
    const nPerTeam = parseInt(this.perTeam.value, 10);
    const balance = false;

    if (!Number.isFinite(listaMax) || listaMax < 1) {
      this.showMessage("Tamanho de lista inválido.", "error");
      return;
    }
    if (!Number.isFinite(nPerTeam) || nPerTeam < 1) {
      this.showMessage("Jogadores por time inválido.", "error");
      return;
    }
    if (this.players.length === 0) {
      this.showMessage("Cadastre ou cole a lista antes de sortear.", "error");
      return;
    }

    const result = this.drawEngine.draw(
      this.players.map((p) => normalizePlayer(p)),
      { listaMax, nPerTeam, balanceByStars: balance }
    );

    this.renderDrawResult(result);

    this.setWarnings(result.warnings);
    if (result.warnings.length) {
      this.showMessage("Sorteio feito — confira os avisos abaixo.", "warn");
    } else {
      this.showMessage("Pronto. Copie o texto ou mande print no grupo.", "info");
    }

    this.lastShareText = WhatsAppExporter.buildShareText(result);
    this.resultsSection.hidden = false;
    this.saveState();
  }

  private renderDrawResult(r: Fut7DrawResult): void {
    const listaMax = r.listaMax;
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
      gkVol: boolean;
      sum: number;
    }[] = [
      {
        name: "Time A (colete / camisa)",
        members: r.teamA,
        gk: r.gkA.player,
        gkVol: r.gkA.fromVolunteers,
        sum: r.sumA,
      },
      {
        name: "Time B",
        members: r.teamB,
        gk: r.gkB.player,
        gkVol: r.gkB.fromVolunteers,
        sum: r.sumB,
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
      if (side.gk) {
        const pGk = document.createElement("p");
        pGk.className = "gk-line";
        pGk.textContent = `Goleiro: ${side.gk.name}${side.gkVol ? " (voluntário)" : " (sorteado — combinar)"}`;
        block.appendChild(pGk);
      }
      const ul = document.createElement("ul");
      for (const p of side.members) {
        const li = document.createElement("li");
        let txt = p.name;
        if (side.gk && p.name === side.gk.name) txt += " — gol";
        else if (p.canGK) txt += " · pode gol";
        li.textContent = txt;
        ul.appendChild(li);
      }
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

    if (r.foraLista.length) {
      this.supletesBlock.hidden = false;
      this.supletesList.innerHTML = "";
      r.foraLista.forEach((p, i) => {
        const ex = this.extraForPlayer(p);
        this.supletesList.appendChild(
          this.buildNumLi(
            i + 1,
            p.name,
            `suplete · fora da lista ${listaMax}${ex ? ` ${ex}` : ""}`
          )
        );
      });
    } else {
      this.supletesBlock.hidden = true;
      this.supletesList.innerHTML = "";
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
    this.supletesList.innerHTML = "";
    this.reservasBlock.hidden = true;
    this.supletesBlock.hidden = true;
    this.resultsSection.hidden = true;
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
