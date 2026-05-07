/**
 * Format an integer in COP to a readable string.
 * e.g. 4700000 -> "$4.700.000"
 */
export function formatCOP(amount: number): string {
  return '$' + amount.toLocaleString('es-CO');
}

/**
 * Short format for large numbers.
 * e.g. 4700000 -> "$4.7M"
 */
export function formatCOPShort(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return '$' + millions.toFixed(1).replace('.0', '') + 'M';
  }
  if (amount >= 1_000) {
    const thousands = amount / 1_000;
    return '$' + thousands.toFixed(0) + 'K';
  }
  return '$' + amount.toString();
}
