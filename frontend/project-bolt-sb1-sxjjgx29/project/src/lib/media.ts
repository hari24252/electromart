const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

function escapeSvg(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

/**
 * Produces a branded, offline-safe image while catalogue media is being added.
 * Product and category images from the API replace it automatically.
 */
export function createMediaPlaceholder(label = 'ElectroMart'): string {
  const safeLabel = escapeSvg(label.slice(0, 34));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img" aria-label="${safeLabel}">
    <defs>
      <linearGradient id="surface" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#eef9ff"/><stop offset="1" stop-color="#d9f0ff"/>
      </linearGradient>
    </defs>
    <rect width="800" height="800" fill="url(#surface)"/>
    <path d="M0 640 640 0h160v160L160 800H0Z" fill="#329fff" opacity=".12"/>
    <path d="m408 164-158 278h126l-10 194 174-289H414l-6-183Z" fill="#1b80f5"/>
    <text x="400" y="704" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="#1a488f">${safeLabel}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/** Resolves backend-served `/uploads` media when the API is hosted separately. */
export function resolveMediaUrl(value?: string, fallbackLabel?: string): string {
  if (!value) return createMediaPlaceholder(fallbackLabel);
  if (/^(?:https?:|data:|blob:)/i.test(value)) return value;
  if (!apiUrl || typeof window === 'undefined') return value;

  try {
    return new URL(value, apiUrl).toString();
  } catch {
    return value;
  }
}
