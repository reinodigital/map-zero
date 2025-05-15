import { Quote } from 'src/modules/quote/entities/quote.entity';
import { Tracking } from 'src/modules/tracking/entities/tracking.entity';

export interface ICountAndQuoteAll {
  count: number;
  quotes: Quote[];
  statusCounts?: {
    [StatusQuote: string]: number;
  };
  total: number;
}

export interface IDetailQuote extends Quote {
  tracking: Tracking[];
}
