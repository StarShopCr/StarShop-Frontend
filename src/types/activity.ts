export interface ActivityEvent {
  id: string;
  type: "INVOICE_PAID" | "INVOICE_CREATED" | "PAYMENT_REMINDER_SENT";
  timestamp: Date;
  invoiceNumber: string;
  invoiceId: string;
  clientName: string;
}