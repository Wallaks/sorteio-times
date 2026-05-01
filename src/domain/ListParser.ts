/**
 * Interpretação de texto colado (WhatsApp / modelo com seções).
 * @see docs/features/F-001-importar-lista-whatsapp.md
 */

import { clampStars } from "./playerUtils";
import type { ParsedImportLine } from "./types";
import { stripInvisible } from "./textUtils";

type ListSection = "campo" | "goleiro" | "suplente";

export class ListParser {
  /** Escolhe o parser adequado e devolve linhas interpretadas (sem deduplicar). */
  static parse(text: string): ParsedImportLine[] {
    if (ListParser.isStructuredList(text)) {
      return ListParser.parseStructuredList(text);
    }
    if (ListParser.isWhatsAppFutList(text)) {
      return ListParser.parseWhatsAppFutList(text);
    }
    return ListParser.parseFlatList(text);
  }

  static isStructuredList(text: string): boolean {
    return /\[\s*(campo|(titular|titulares)|lista(?:\s*principal)?|goleiros?|suplentes?)\s*\]/i.test(
      String(text)
    );
  }

  private static parsePasteLine(raw: string, forceGK: boolean): ParsedImportLine | null {
    let line = stripInvisible(String(raw ?? ""));
    if (!line) return null;

    if (/^como preencher/i.test(line)) return null;
    if (/lista pelada/i.test(line)) return null;
    if (/^lista do fut/i.test(line)) return null;
    if (/^_?\s*copiem/i.test(line)) return null;
    if (/não apaguem as linhas/i.test(line)) return null;
    if (/não modifique/i.test(line)) return null;
    if (/^\(\s*sem limite/i.test(line)) return null;
    if (/^_?\s*opcional:/i.test(line)) return null;
    if (/^_?exemplo/i.test(line)) return null;
    if (/^[•·]\s*(coloque|uma pessoa|estrelas?|quem\s+joga)/i.test(line)) return null;

    let stars: number | null = null;
    const pipeStar = /\|\s*([1-5])\s*$/;
    const pm = line.match(pipeStar);
    if (pm) {
      stars = clampStars(pm[1]!);
      line = line.replace(pipeStar, "").trim();
    }
    const starEnd = /\*+\s*([1-5])\s*$/;
    const sm = line.match(starEnd);
    if (sm) {
      stars = clampStars(sm[1]!);
      line = line.replace(starEnd, "").trim();
    }

    let gk = !!forceGK;
    const golMatch = /\(\s*gol\s*\)\s*$/i;
    if (golMatch.test(line)) {
      gk = true;
      line = line.replace(golMatch, "").trim();
    }

    line = line.replace(/^\s*[\d]+[\.)]\s*/, "");
    line = line.replace(/^\s*[-*•]\s+/, "");
    line = line.replace(/^\s*[-*•]\s*/, "");
    line = line.replace(/[*_~]/g, "");
    line = line.replace(/\s+/g, " ").trim();

    if (!line) return null;
    if (/^\d+\s*[\.)]\s*$/.test(line)) return null;
    if (/^\d+$/.test(line)) return null;

    return { name: line, canGK: gk, stars };
  }

  private static matchSectionHeader(line: string): ListSection | null {
    const t = stripInvisible(String(line ?? ""));
    const u = t
      .toLowerCase()
      .replace(/\*+/g, "")
      .replace(/:+\s*$/, "")
      .trim();
    if (u === "goleiros" || u === "goleiro") return "goleiro";
    if (u === "suplentes" || u === "suplente") return "suplente";
    const u2 = t.toLowerCase().replace(/\*/g, "");
    const bracket =
      /^\[\s*(campo|(titular|titulares)|lista(?:\s*principal)?|goleiros?|suplentes?)\s*\]$/i;
    const bm = t.match(bracket);
    if (bm) {
      const k = bm[1]!.toLowerCase();
      if (k.includes("goleiro")) return "goleiro";
      if (k.includes("suplente")) return "suplente";
      return "campo";
    }
    if (
      u2 === "campo" ||
      u2 === "titulares" ||
      u2 === "titular" ||
      u2 === "lista" ||
      u2 === "lista principal"
    )
      return "campo";
    return null;
  }

  private static parseStructuredList(text: string): ParsedImportLine[] {
    const lines = String(text).split(/\r?\n/);
    let section: ListSection = "campo";
    let sawHeader = false;
    const out: ParsedImportLine[] = [];
    for (const raw of lines) {
      const trimmed = stripInvisible(String(raw).trim());
      if (!trimmed) continue;
      if (/^[—\-_]{2,}\s*$/.test(trimmed)) continue;

      const h = ListParser.matchSectionHeader(trimmed);
      if (h) {
        section = h;
        sawHeader = true;
        continue;
      }

      if (section === "suplente") continue;
      const parsed = ListParser.parsePasteLine(raw, section === "goleiro");
      if (parsed) out.push(parsed);
    }
    if (!sawHeader) return ListParser.parseFlatList(text);
    return out;
  }

  private static parseFlatList(text: string): ParsedImportLine[] {
    const lines = String(text).split(/\r?\n/);
    const out: ParsedImportLine[] = [];
    for (const line of lines) {
      const parsed = ListParser.parsePasteLine(line, false);
      if (parsed) out.push(parsed);
    }
    return out;
  }

  private static isWhatsAppFutList(text: string): boolean {
    if (ListParser.isStructuredList(text)) return false;
    const s = String(text);
    if (/\blista do fut\b/i.test(s)) return true;
    if (/\bgoleiros\s*:/i.test(s)) return true;
    if (/^\s*suplentes\s*:?\s*$/im.test(s) || /\n\s*suplentes\s*:?\s*\n/i.test(s)) return true;
    return false;
  }

  private static parseWhatsAppFutList(text: string): ParsedImportLine[] {
    const lines = String(text).split(/\r?\n/);
    let state: ListSection = "campo";
    const out: ParsedImportLine[] = [];
    for (const raw of lines) {
      const line = stripInvisible(String(raw ?? ""));
      if (!line) continue;

      if (/^lista do fut/i.test(line)) {
        state = "campo";
        continue;
      }

      const header = ListParser.matchSectionHeader(line);
      if (header) {
        state = header;
        continue;
      }

      const dotNum = line.match(/^\s*(\d+)[\.)]\s*(.*)$/);
      if (dotNum) {
        const rest = (dotNum[2] ?? "").trim();
        if (!rest) continue;
        const p = ListParser.parsePasteLine(rest, state === "goleiro");
        if (p) out.push(p);
        continue;
      }

      if (state === "suplente") continue;

      if (state === "goleiro") {
        const p = ListParser.parsePasteLine(line, true);
        if (p) out.push(p);
      }
    }
    return out;
  }
}
