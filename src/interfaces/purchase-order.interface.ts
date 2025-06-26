import { PurchaseOrder } from 'src/modules/purchase-order/entities/purchase-order.entity';
import { Tracking } from 'src/modules/tracking/entities/tracking.entity';

export interface ICountAndPurchaseAll {
  count: number;
  purchaseOrders: PurchaseOrder[];
  statusCounts?: {
    [StatusPurchaseOrder: string]: number;
  };
  total: number;
}

export interface IDetailPurchaseOrder extends PurchaseOrder {
  tracking: Tracking[];
}
