import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Plus } from "lucide-react";

export default function Bookings() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <PageTitle 
          title="Bookings" 
          description="Manage your client appointments and bookings" 
          icon={<CalendarCheck className="h-6 w-6 text-primary" />}
        />
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>New Booking</span>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <h3 className="text-lg font-medium">No bookings scheduled yet</h3>
            <p className="mt-2">Your future appointments and bookings will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}