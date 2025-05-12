import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Invoice, Client, InvoiceStatus } from "@shared/schema";
import { format } from "date-fns";

export function InvoicesSummaryCard() {
  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });
  
  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });
  
  const isLoading = invoicesLoading || clientsLoading;

  // Get client name by ID
  const getClientName = (clientId: number) => {
    const client = clients?.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return "bg-green-100 text-green-800";
      case InvoiceStatus.SENT:
      case InvoiceStatus.DRAFT:
        return "bg-yellow-100 text-yellow-800";
      case InvoiceStatus.OVERDUE:
        return "bg-red-100 text-red-800";
      case InvoiceStatus.CANCELED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!invoices) return { paid: 0, pending: 0, overdue: 0 };
    
    const paid = invoices
      .filter(invoice => invoice.status === InvoiceStatus.PAID)
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    
    const pending = invoices
      .filter(invoice => invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.DRAFT)
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    
    const overdue = invoices
      .filter(invoice => invoice.status === InvoiceStatus.OVERDUE)
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    
    return { paid, pending, overdue };
  };

  const totals = calculateTotals();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">Invoices</CardTitle>
          <Link href="/invoices">
            <a className="text-sm font-medium text-primary hover:text-primary/80">View all</a>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex justify-between mb-4">
          <div>
            <h4 className="text-base font-medium text-gray-900">Invoice Summary</h4>
            <p className="text-sm text-gray-500">{format(new Date(), "MMMM yyyy")}</p>
          </div>
          <Link href="/invoices/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> New
            </Button>
          </Link>
        </div>

        <div className="flex mb-3">
          <div className="flex-1 py-2 text-center bg-green-100 rounded-l-md">
            <span className="block text-sm font-medium text-green-800">Paid</span>
            <span className="text-lg font-semibold text-green-800">{formatCurrency(totals.paid)}</span>
          </div>
          <div className="flex-1 py-2 text-center bg-yellow-100">
            <span className="block text-sm font-medium text-yellow-800">Pending</span>
            <span className="text-lg font-semibold text-yellow-800">{formatCurrency(totals.pending)}</span>
          </div>
          <div className="flex-1 py-2 text-center bg-red-100 rounded-r-md">
            <span className="block text-sm font-medium text-red-800">Overdue</span>
            <span className="text-lg font-semibold text-red-800">{formatCurrency(totals.overdue)}</span>
          </div>
        </div>

        <div className="space-y-3 mt-5">
          <h4 className="text-sm font-medium text-gray-900">Recent Invoices</h4>
          
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading invoices...</div>
          ) : invoices && invoices.length > 0 ? (
            invoices.slice(0, 3).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{getClientName(invoice.clientId)}</div>
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{format(new Date(invoice.issueDate), "MMM d, yyyy")}</div>
                </div>
                <div className="text-sm font-semibold text-gray-900">{formatCurrency(invoice.amount)}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No invoices found</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default InvoicesSummaryCard;
