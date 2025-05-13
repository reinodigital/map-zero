import { QuoteItem } from 'src/modules/quote/entities/quote-item.entity';
import { getTaxRateValue } from '../../helpers/tax-rate';

//  CALCULATE TOTAL VALUES for QUOTE
export const quoteTotals = (quoteItems: QuoteItem[]) => {
  // Accumulate values using reduce
  const { subtotal, descuentos, iva }: any = quoteItems.reduce(
    (acc, item) => {
      const subtotalLine = item.quantity * item.price; // Price before discount & tax
      const discountLine =
        item.discount > 0 ? item.price - (item.price * item.discount) / 100 : 0; // Discount amount
      const totalLine = subtotalLine - discountLine;

      const itemIva = totalLine * (getTaxRateValue(item.taxRate ?? '08') / 100); // IVA after discount

      return {
        subtotal: acc.subtotal + subtotalLine,
        descuentos: acc.descuentos + discountLine,
        iva: acc.iva + itemIva,
      };
    },
    { subtotal: 0, descuentos: 0, iva: 0 },
  );

  // Calculate total
  const total = subtotal - descuentos + iva;

  return {
    iva,
    descuentos,
    subtotal,
    total,
  };
};
