import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Quote } from '../quote/entities/quote.entity';
import { Invoice } from '../invoice/entities/invoice.entity';
import { NameEntities } from 'src/enums';

@Injectable()
export class OverviewService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
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
    const [quoteStats, invoiceStats] = await Promise.all([
      this.quoteRepository
        .createQueryBuilder('quote')
        .select('quote.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(quote.total)', 'total')
        .groupBy('quote.status')
        .getRawMany(),

      this.invoiceRepository
        .createQueryBuilder('invoice')
        .select('invoice.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(invoice.total)', 'total')
        .groupBy('invoice.status')
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
    const [purchaseOrderStats] = await Promise.all([
      this.quoteRepository
        .createQueryBuilder('purchase_order')
        .select('purchase_order.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(purchase_order.total)', 'total')
        .groupBy('purchase_order.status')
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
}
