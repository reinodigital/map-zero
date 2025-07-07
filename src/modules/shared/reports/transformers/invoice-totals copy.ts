import { getTaxRateValue } from '../../helpers/tax-rate';
import { roundToTwoDecimals } from '../../helpers/round-two-decimals.helper';
import { InvoiceItem } from 'src/modules/invoice/entities/invoice-item.entity';

//  CALCULATE TOTAL VALUES for INVOICE
export const invoiceTotals = (invoiceItems: InvoiceItem[]) => {
  // Accumulate values using reduce
  const { subtotal, descuentos, iva }: any = invoiceItems.reduce(
    (acc, item) => {
      const roundedPrice = roundToTwoDecimals(item.price);
      const subtotalLine = item.quantity * roundedPrice; // Price before discount & tax
      const discountLine =
        item.quantity * ((roundedPrice * item.discount) / 100); // Discount amount
      const totalLine = subtotalLine - discountLine;

      const itemIva = totalLine * (getTaxRateValue(item.taxRate ?? '08') / 100); // IVA after discount

      return {
        subtotal: acc.subtotal + roundToTwoDecimals(subtotalLine),
        descuentos: acc.descuentos + roundToTwoDecimals(discountLine),
        iva: acc.iva + roundToTwoDecimals(itemIva),
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
    total: roundToTwoDecimals(total),
  };
};
