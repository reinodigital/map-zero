export class CurrencyFormatter {
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }
  static formatPrice(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      // minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
