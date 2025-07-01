import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Quote } from '../quote/entities/quote.entity';
import { Invoice } from '../invoice/entities/invoice.entity';
import { PurchaseOrder } from '../purchase-order/entities/purchase-order.entity';

import {
  NameEntities,
  StatusInvoice,
  StatusPurchaseOrder,
  StatusQuote,
} from 'src/enums';

@Injectable()
export class OverviewService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
  ) {}

  async getSalesOverview(): Promise<{
    statusCounts: Record<
      NameEntities.QUOTE | NameEntities.INVOICE,
      Record<string, number>
    >;
    totalsByStatus: Record<
      NameEntities.QUOTE | NameEntities.INVOICE,
      Record<string, number>
    >;
  }> {
    const allowedQuoteStatuses = [
      StatusQuote.DRAFT,
      StatusQuote.SENT,
      StatusQuote.ACCEPTED,
    ];

    const allowedInvoiceStatuses = [StatusInvoice.DRAFT];

    const [quoteStats, invoiceStats] = await Promise.all([
      this.quoteRepository
        .createQueryBuilder('quote')
        .select('quote.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(quote.total)', 'total')
        .where('quote.status IN (:...allowedStatuses)', {
          allowedStatuses: allowedQuoteStatuses,
        })
        .groupBy('quote.status')
        .orderBy(
          `CASE
          WHEN quote.status = 'borrador' THEN 1
          WHEN quote.status = 'enviada' THEN 2
          WHEN quote.status = 'aceptada' THEN 3
          ELSE 4
          END`,
        )
        .getRawMany(),

      this.invoiceRepository
        .createQueryBuilder('invoice')
        .select('invoice.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(invoice.total)', 'total')
        .where('invoice.status IN (:...allowedStatuses)', {
          allowedStatuses: allowedInvoiceStatuses,
        })
        .groupBy('invoice.status')
        .orderBy(
          `CASE
          WHEN invoice.status = 'borrador' THEN 1
          WHEN invoice.status = 'enviada' THEN 2
          ELSE 3
          END`,
        )
        .getRawMany(),
    ]);

    const statusCounts = { Quote: {}, Invoice: {} };
    const totalsByStatus = { Quote: {}, Invoice: {} };

    for (const row of quoteStats) {
      statusCounts.Quote[row.status] = parseInt(row.count, 10);
      totalsByStatus.Quote[row.status] = parseFloat(row.total) || 0;
    }

    for (const row of invoiceStats) {
      statusCounts.Invoice[row.status] = parseInt(row.count, 10);
      totalsByStatus.Invoice[row.status] = parseFloat(row.total) || 0;
    }

    return {
      statusCounts,
      totalsByStatus,
    };
  }

  async getPurchasesOverview(): Promise<{
    statusCounts: Record<NameEntities.PURCHASE_ORDER, Record<string, number>>;
    totalsByStatus: Record<NameEntities.PURCHASE_ORDER, Record<string, number>>;
  }> {
    const allowedPurchaseOrderStatuses = [
      StatusPurchaseOrder.DRAFT,
      StatusPurchaseOrder.SENT,
      StatusPurchaseOrder.AWAITING_APPROVAL,
      StatusPurchaseOrder.APPROVED,
    ];

    const [purchaseOrderStats] = await Promise.all([
      this.purchaseOrderRepository
        .createQueryBuilder('purchase_order')
        .select('purchase_order.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(purchase_order.total)', 'total')
        .where('purchase_order.status IN (:...allowedStatuses)', {
          allowedStatuses: allowedPurchaseOrderStatuses,
        })
        .groupBy('purchase_order.status')
        .orderBy(
          `CASE
          WHEN purchase_order.status = 'borrador' THEN 1
          WHEN purchase_order.status = 'enviada' THEN 2
          WHEN purchase_order.status = 'esperando_aprobación' THEN 3
          WHEN purchase_order.status = 'aprobada' THEN 4
          ELSE 5
          END`,
        )
        .getRawMany(),
    ]);

    const statusCounts = { PurchaseOrder: {} };
    const totalsByStatus = { PurchaseOrder: {} };

    for (const row of purchaseOrderStats) {
      statusCounts.PurchaseOrder[row.status] = parseInt(row.count, 10);
      totalsByStatus.PurchaseOrder[row.status] = parseFloat(row.total) || 0;
    }

    return {
      statusCounts,
      totalsByStatus,
    };
  }

  // private readonly customStatusOrder = [
  //   'draft',
  //   'sent',
  //   'accepted',
  //   'declined',
  // ];

  // private sortByCustomStatusOrder<T extends Record<string, number>>(
  //   data: T,
  // ): T {
  //   const sorted: Record<string, number> = {};

  //   for (const status of this.customStatusOrder) {
  //     if (status in data) {
  //       sorted[status] = data[status];
  //     }
  //   }

  //   // Add any remaining statuses that were not in the predefined order
  //   for (const key of Object.keys(data)) {
  //     if (!(key in sorted)) {
  //       sorted[key] = data[key];
  //     }
  //   }

  //   return sorted as T;
  // }
}
