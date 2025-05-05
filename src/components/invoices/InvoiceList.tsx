import React, { useState } from 'react';
import { Invoice } from '@/lib/types/invoice';

import { InvoiceDetails } from './InvoiceDetails';
import RecentInvoicesTable from '../features/user/invoices/components/RecentInvoicesTable';
import InvoicesTable from '../features/user/invoices/components/InvoicesTable';
import { UpcomingAndOverdueInvoices } from '@/features/user/invoices/components/UpcomingAndOverdueInvoices';

interface InvoiceListProps {
  invoices: Invoice[];
  upcomingInvoices?: Invoice[];
  overdueInvoices?: Invoice[];
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ 
  invoices, 
  upcomingInvoices = [], 
  overdueInvoices = [] 
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleMarkAsPaid = (id: string) => {
    // TODO: Implement mark as paid functionality
    console.log("Mark as paid:", id);
  };

  const handleDownloadPDF = (id: string) => {
    // TODO: Implement PDF download functionality
    console.log("Download PDF:", id);
  };

  const handleViewOrder = (id: string) => {
    // TODO: Implement view order functionality
    console.log("View order:", id);
  };

  const handleContactSeller = (id: string) => {
    // TODO: Implement contact seller functionality
    console.log("Contact seller:", id);
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    if (selectedInvoice?.id === invoice.id) {
      setSelectedInvoice(null);
    } else {
      setSelectedInvoice(invoice);
    }
  };

  return (
    <div className="space-y-8">

      <RecentInvoicesTable invoices={invoices} onInvoiceClick={handleInvoiceClick} />
      <InvoicesTable />

      {selectedInvoice && (
        <InvoiceDetails
          invoice={selectedInvoice}
          onMarkAsPaid={handleMarkAsPaid}
          onDownloadPDF={handleDownloadPDF}
          onViewOrder={handleViewOrder}
          onContactSeller={handleContactSeller}
        />
      )}

      <UpcomingAndOverdueInvoices
        upcomingInvoices={upcomingInvoices}
        overdueInvoices={overdueInvoices}
        onMarkAsPaid={handleMarkAsPaid}
        onViewDetails={handleViewOrder}
      />
    </div>
  );
};
