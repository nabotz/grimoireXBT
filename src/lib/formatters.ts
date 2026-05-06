/** Format a number as USD currency: $1,234.56 */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format a number as a percentage: 58.3% */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value == null) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/** Format a ratio: 1.8R */
export function formatRatio(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${value.toFixed(1)}R`;
}

/** Format XP with comma separator: 2,450 XP */
export function formatXP(value: number): string {
  return `${value.toLocaleString('en-US')} XP`;
}

/** Format a date to readable: May 6, 2026 */
export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/** Format a datetime to: May 6, 2026 · 22:15 */
export function formatDateTime(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${formatDate(dateStr)} · ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
}

/** Format duration in minutes to human readable: 2h 30m */
export function formatDuration(mins: number | undefined): string {
  if (!mins) return '—';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Get color class for a PnL value */
export function pnlColor(pnl: number | null | undefined): string {
  if (pnl == null) return 'text-gray-400';
  return pnl > 0 ? 'text-emerald-400' : pnl < 0 ? 'text-red-400' : 'text-gray-400';
}
