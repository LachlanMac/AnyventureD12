export interface MarkdownHeader {
  level: number;
  text: string;
  anchor: string;
}

/**
 * Extracts headers from markdown content
 * @param markdown - The markdown content to parse
 * @param maxLevel - Maximum header level to include (default 3 for h1, h2, h3)
 * @returns Array of headers with their level, text, and anchor
 */
export function extractHeaders(markdown: string, maxLevel: number = 3): MarkdownHeader[] {
  const headers: MarkdownHeader[] = [];
  const lines = markdown.split('\n');
  
  for (const line of lines) {
    // Match markdown headers (e.g., ## Header Text)
    // Updated regex to handle different whitespace and line endings
    const trimmedLine = line.trim();
    const match = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      
      if (level <= maxLevel) {
        headers.push({
          level,
          text,
          anchor: textToAnchor(text)
        });
      }
    }
  }
  return headers;
}

/**
 * Converts header text to a valid anchor link
 * Follows GitHub-flavored markdown anchor generation rules
 */
export function textToAnchor(text: string): string {
  // This should match how rehype-slug generates IDs
  return text
    .toLowerCase()
    .replace(/&/g, '')         // Remove & completely (rehype-slug style)
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

/**
 * Groups headers into a hierarchical structure
 * @param headers - Flat array of headers
 * @returns Headers grouped by their parent headers
 */
export function groupHeadersByHierarchy(headers: MarkdownHeader[]): MarkdownHeader[] {
  // For sidebar display, we only want level 2 headers (##)
  return headers.filter(header => header.level === 2);
}