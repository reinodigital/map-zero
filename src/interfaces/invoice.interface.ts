import { Invoice } from 'src/modules/invoice/entities/invoice.entity';
import { Tracking } from 'src/modules/tracking/entities/tracking.entity';

export interface ICountAndInvoiceAll {
  count: number;
  invoices: Invoice[];
  statusCounts?: {
    [StatusInvoice: string]: number;
  };
  total: number;
}

export interface IDetailInvoice extends Invoice {
  tracking: Tracking[];
}
