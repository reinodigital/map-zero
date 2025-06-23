import { Client } from 'src/modules/client/entities/client.entity';
import { InvoiceItem } from 'src/modules/invoice/entities/invoice-item.entity';
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

export interface IDetailInvoice {
  id: number;
  client: Client;
  currency: string;
  expireDate?: Date;
  initDate?: Date;
  invoiceItems: InvoiceItem[];
  invoiceNumber: string;
  isActive: boolean;
  reference?: string;
  status: string;
  total: number;
  tracking: Tracking[];
  emisorActivities: string[];
  receptorActivities: string[];
}
