/**
 * Format a number as Indonesian Rupiah.
 * e.g. 120000 → "Rp 120.000"
 */
export function formatRupiah(amount: number): string {
  return (
    "Rp " +
    Math.abs(amount)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  );
}

/**
 * Format a number as a compact Rupiah (with sign).
 * e.g. -120000 → "-Rp 120.000"
 */
export function formatRupiahSigned(amount: number): string {
  const prefix = amount < 0 ? "-" : "+";
  return prefix + formatRupiah(amount);
}

/**
 * Format an ISO date string to Indonesian locale.
 * e.g. "2025-05-01" → "01 Mei 2025"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00"); // force local time parse
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format date to short form.
 * e.g. "2025-05-01" → "01 Mei"
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
}

/**
 * Get today's date as YYYY-MM-DD string.
 */
export function getTodayISO(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Parse an integer from a string, returning 0 for empty/invalid.
 */
export function parseIntSafe(value: string): number {
  const parsed = parseInt(value.replace(/\D/g, ""), 10);
  return isNaN(parsed) ? 0 : parsed;
}
