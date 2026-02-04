export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return String(str || '').replace(/[&<>"']/g, (m) => map[m] ?? m);
}

export function parseDate(str: string | null | undefined): Date | null {
  if (!str) return null;
  const s = str.trim().replace(/-/g, '/').replace(/\./g, '/');
  const parts = s.split('/');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (y > 1900) return new Date(y, m - 1, d);
    if (d > 1900) return new Date(d, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
    if (y < 1900 && y > 0) return new Date(y + 1911, m - 1, d);
  }
  const parsed = new Date(s);
  return parsed instanceof Date && !isNaN(parsed.getTime()) ? parsed : null;
}

export function isImageUrl(url: string): boolean {
  if (typeof url !== 'string') return false;
  const u = url.trim();
  return (
    /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|bmp|svg)($|\?)/i.test(u) ||
    /^https:\/\/lh3\.googleusercontent\.com\//i.test(u) ||
    /^https:\/\/i\.imgur\.com\//i.test(u)
  );
}
