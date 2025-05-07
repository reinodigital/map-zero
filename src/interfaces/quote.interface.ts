import { Quote } from 'src/modules/quote/entities/quote.entity';
import { Tracking } from 'src/modules/tracking/entities/tracking.entity';

export interface ICountAndQuoteAll {
  count: number;
  quotes: Quote[];
}

export interface IDetailQuote extends Quote {
  tracking: Tracking[];
}
