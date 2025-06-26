export enum StatusPurchaseOrder {
  DRAFT = 'borrador',
  SENT = 'enviada',
  DECLINED = 'rechazada',
  ACCEPTED = 'aceptada',
  INVOICED = 'facturada',
  REMOVED = 'removida',
}

export enum NewPurchaseOrderFormAction {
  SAVE = 'save',
  SEND = 'send', // send email
  MARK_AS_SENT = 'mark_as_sent',
}

export const newPurchaseOrderFormActionsArray = Object.values(
  NewPurchaseOrderFormAction,
);
