export enum StatusQuote {
  DRAFT = 'borrador',
  SENT = 'enviada',
  DECLINED = 'rechazada',
  ACCEPTED = 'aceptada',
  INVOICED = 'facturada',
}

export enum NewQuoteFormAction {
  SAVE = 'save',
  SEND = 'send', // send email
  MARK_AS_SENT = 'mark_as_sent',
}

export const newQuoteFormActionsArray = Object.values(NewQuoteFormAction);
