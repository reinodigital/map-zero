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
    }).format(value);
  }
}
