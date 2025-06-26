import { PurchaseOrderItem } from 'src/modules/purchase-order/entities/purchase-order-item.entity';
import { roundToTwoDecimals } from '../../helpers/round-two-decimals.helper';
import { getTaxRateValue } from '../../helpers/tax-rate';

//  CALCULATE TOTAL VALUES for PURCHASE ORDER
export const purchaseOrderTotals = (
  purchaseOrderItems: PurchaseOrderItem[],
) => {
  // Accumulate values using reduce
  const { subtotal, descuentos, iva }: any = purchaseOrderItems.reduce(
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
