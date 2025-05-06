import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency (IDR)
 * @param amount The amount to format
 * @param currency The currency code (default: 'IDR')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string, currency: string = 'IDR'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle invalid amounts
  if (isNaN(numericAmount)) {
    return 'Invalid amount';
  }
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}
