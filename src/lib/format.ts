const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

const moneyFormat = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const compactMoneyFormat = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", notation: "compact", maximumFractionDigits: 1 });
const countFormat = new Intl.NumberFormat("en-IN");

export const formatMoney = (amount: number) => moneyFormat.format(amount);
export const formatCompactMoney = (amount: number) => compactMoneyFormat.format(amount);
export const formatUnitPrice = (amount: number) => `₹${amount.toFixed(2)}`;
export const formatCount = (count: number) => countFormat.format(count);
export const formatPercent = (ratio: number) => `${(ratio * 100).toFixed(1)}%`;

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

/** "in 2h", "3d ago", "now" — relative to `now`. */
export function formatRelative(iso: string, now: number): string {
  const difference = new Date(iso).getTime() - now;
  const distance = Math.abs(difference);
  const amount =
    distance < MS_PER_HOUR
      ? `${Math.max(1, Math.round(distance / MS_PER_MINUTE))}m`
      : distance < MS_PER_DAY
        ? `${Math.round(distance / MS_PER_HOUR)}h`
        : `${Math.round(distance / MS_PER_DAY)}d`;
  if (distance < MS_PER_MINUTE) return "now";
  return difference > 0 ? `in ${amount}` : `${amount} ago`;
}
