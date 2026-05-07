import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCOP(amount: number): string {
  return '$' + amount.toLocaleString('es-CO');
}

export function formatCOPShort(amount: number): string {
  if (amount >= 1_000_000) {
    return '$' + (amount / 1_000_000).toFixed(1) + 'M';
  }
  if (amount >= 1_000) {
    return '$' + (amount / 1_000).toFixed(0) + 'K';
  }
  return '$' + amount.toLocaleString('es-CO');
}
