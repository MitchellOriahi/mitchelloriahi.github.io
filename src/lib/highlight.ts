/**
 * highlight.ts
 * Turns **marked** spans in content strings into accented <strong> HTML.
 * Runs at build time inside Astro components (via set:html), so the output is
 * static markup with no client cost.
 */
export function highlight(text: string): string {
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    return escaped.replace(/\*\*(.+?)\*\*/g, '<strong class="hl">$1</strong>');
}
