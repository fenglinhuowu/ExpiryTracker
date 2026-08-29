// Returns the number of whole days between today and the given YYYY-MM-DD date.
export function daysUntil(expiryDate: string): number {
  const today = new Date();
  const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  const [year, month, day] = expiryDate.split('-').map(Number);
  const utcTarget = Date.UTC(year, month - 1, day);

  const diffMs = utcTarget - utcToday;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

export function todayString(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
