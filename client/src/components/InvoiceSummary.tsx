import { Link } from "wouter";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Invoice, Client } from "@shared/schema";

interface InvoiceSummaryProps {
  invoices: Invoice[];
  clients: Client[];
  summary: {
    paid: number;
    pending: number;
    overdue: number;
    total: number;
  };
}

export default function InvoiceSummary({ invoices, clients, summary }: InvoiceSummaryProps) {
  // Get the most recent invoices (up to 3)
  const recentInvoices = invoices
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 3);

  // Map invoices with client data
  const invoicesWithClients = recentInvoices.map(invoice => {
    const client = clients.find(c => c.id === invoice.clientId);
    return { ...invoice, client };
  });

  // Get status class for invoice status badge
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'sent':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Invoices</h3>
          <Link href="/invoices">
            <a className="text-sm font-medium text-primary hover:text-primary-700">View all</a>
          </Link>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between mb-4">
          <div>
            <h4 className="text-base font-medium text-gray-900">Invoice Summary</h4>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <Link href="/invoices/new">
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> New
            </Button>
          </Link>
        </div>

        <div className="flex mb-3">
          <div className="flex-1 py-2 text-center bg-green-100 rounded-l-md">
            <span className="block text-sm font-medium text-green-800">Paid</span>
            <span className="text-lg font-semibold text-green-800">{formatCurrency(summary.paid)}</span>
          </div>
          <div className="flex-1 py-2 text-center bg-yellow-100">
            <span className="block text-sm font-medium text-yellow-800">Pending</span>
            <span className="text-lg font-semibold text-yellow-800">{formatCurrency(summary.pending)}</span>
          </div>
          <div className="flex-1 py-2 text-center bg-red-100 rounded-r-md">
            <span className="block text-sm font-medium text-red-800">Overdue</span>
            <span className="text-lg font-semibold text-red-800">{formatCurrency(summary.overdue)}</span>
          </div>
        </div>

        <div className="space-y-3 mt-5">
          <h4 className="text-sm font-medium text-gray-900">Recent Invoices</h4>
          
          {invoicesWithClients.length === 0 ? (
            <div className="py-4 text-center text-gray-500">
              No invoices found. Create your first invoice!
            </div>
          ) : (
            invoicesWithClients.map(invoice => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{invoice.client?.name || 'Unknown Client'}</div>
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{formatDate(invoice.issueDate)}</div>
                </div>
                <div className="text-sm font-semibold text-gray-900">{formatCurrency(invoice.amount)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
