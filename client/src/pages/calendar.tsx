import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const currentDay = new Date();
  
  // Generate days for the calendar grid
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const days = [];
    // Add empty days for padding at the start
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: null, events: [] });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        date: new Date(year, month, i),
        events: i === 10 || i === 15 || i === 22 ? [
          { title: i === 10 ? "Client Meeting" : i === 15 ? "Project Deadline" : "Team Call", time: "10:00 AM" }
        ] : []
      });
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  return (
    <div className="space-y-6 p-6">
      <PageTitle 
        title="Calendar" 
        description="Manage your schedule and appointments" 
        icon={<CalendarIcon className="h-6 w-6 text-primary" />}
      />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-medium text-sm py-2">
                {day}
              </div>
            ))}
            
            {days.map((day, index) => (
              <div 
                key={index}
                className={`
                  min-h-[100px] border border-muted p-1 relative
                  ${!day.date ? 'bg-muted/30' : ''}
                  ${day.date && day.date.getDate() === currentDay.getDate() && 
                    day.date.getMonth() === currentDay.getMonth() && 
                    day.date.getFullYear() === currentDay.getFullYear() 
                      ? 'border-primary' 
                      : ''}
                `}
              >
                {day.date && (
                  <>
                    <div className="text-right text-sm">
                      {format(day.date, 'd')}
                    </div>
                    {day.events.map((event, i) => (
                      <div 
                        key={i}
                        className="mt-1 text-xs p-1 rounded-sm bg-primary/10 text-primary truncate"
                      >
                        <div className="font-medium">{event.title}</div>
                        <div>{event.time}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}