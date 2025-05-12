import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CircleOff, DollarSign, FileCheck, Clock } from "lucide-react";

type Invoice = {
  id: number;
  clientId: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: string;
  client?: {
    name: string;
  };
};

export default function InvoicesSummaryCard() {
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  // Calculate summary statistics
  const summary = {
    paid: 0,
    pending: 0,
    overdue: 0,
    total: 0
  };

  if (invoices) {
    const now = new Date();
    
    for (const invoice of invoices) {
      const amount = invoice.amount;
      summary.total += amount;
      
      if (invoice.status === "Paid") {
        summary.paid += amount;
      } else if (invoice.status === "Pending") {
        summary.pending += amount;
        
        // Check if overdue
        const dueDate = new Date(invoice.dueDate);
        if (dueDate < now) {
          summary.overdue += amount;
        }
      }
    }
  }

  const items = [
    {
      title: "Total",
      value: `$${summary.total.toLocaleString()}`,
      icon: <DollarSign className="h-4 w-4" />,
      color: "text-primary-600 bg-primary-50"
    },
    {
      title: "Paid",
      value: `$${summary.paid.toLocaleString()}`,
      icon: <FileCheck className="h-4 w-4" />,
      color: "text-green-600 bg-green-50"
    },
    {
      title: "Pending",
      value: `$${summary.pending.toLocaleString()}`,
      icon: <CircleOff className="h-4 w-4" />,
      color: "text-amber-600 bg-amber-50"
    },
    {
      title: "Overdue",
      value: `$${summary.overdue.toLocaleString()}`,
      icon: <Clock className="h-4 w-4" />,
      color: "text-red-600 bg-red-50"
    }
  ];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Invoices Summary</CardTitle>
        <Link href="/invoices">
          <span className="text-sm text-blue-500 hover:underline cursor-pointer">
            View all
          </span>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="w-1/3 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-1/4 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-3 ${item.color.split(" ")[1]}`}>
                    <div className={item.color.split(" ")[0]}>
                      {item.icon}
                    </div>
                  </div>
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}