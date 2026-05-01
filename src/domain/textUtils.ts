/** Remove zero-width / invisíveis comuns do WhatsApp (ex.: ⁠ U+2060). */
export function stripInvisible(raw: string): string {
  return String(raw ?? "")
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, "")
    .replace(/\u00A0/g, " ")
    .trim();
}
