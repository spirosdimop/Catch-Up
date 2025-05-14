import { Link } from "wouter";
import { formatDate } from "@/lib/utils";
import { Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

// Converted InvoiceSummary to ReminderSummary to avoid money-related content
export default function ReminderSummary() {
  // Sample reminders data (in a real app, this would come from API)
  const reminders = [
    {
      id: 1,
      title: "Client meeting preparation",
      type: "meeting",
      date: new Date(),
      priority: "high"
    },
    {
      id: 2,
      title: "Update project documentation",
      type: "task",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      priority: "medium"
    },
    {
      id: 3,
      title: "Review pending tasks",
      type: "task",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // day after tomorrow
      priority: "low"
    }
  ];

  // Get priority class for reminder badge
  const getPriorityClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Reminders</h3>
          <Link href="/reminders">
            <a className="text-sm font-medium text-primary hover:text-primary-700">View all</a>
          </Link>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between mb-4">
          <div>
            <h4 className="text-base font-medium text-gray-900">Upcoming Reminders</h4>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <Link href="/reminders/new">
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> New
            </Button>
          </Link>
        </div>

        <div className="flex mb-3">
          <div className="flex-1 py-2 text-center bg-red-100 rounded-l-md">
            <span className="block text-sm font-medium text-red-800">High</span>
            <span className="text-lg font-semibold text-red-800">1</span>
          </div>
          <div className="flex-1 py-2 text-center bg-yellow-100">
            <span className="block text-sm font-medium text-yellow-800">Medium</span>
            <span className="text-lg font-semibold text-yellow-800">1</span>
          </div>
          <div className="flex-1 py-2 text-center bg-green-100 rounded-r-md">
            <span className="block text-sm font-medium text-green-800">Low</span>
            <span className="text-lg font-semibold text-green-800">1</span>
          </div>
        </div>

        <div className="space-y-3 mt-5">
          <h4 className="text-sm font-medium text-gray-900">Upcoming Reminders</h4>
          
          {reminders.length === 0 ? (
            <div className="py-4 text-center text-gray-500">
              No reminders found. Create your first reminder!
            </div>
          ) : (
            reminders.map(reminder => (
              <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{reminder.title}</div>
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(reminder.priority)}`}>
                      {reminder.priority}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{formatDate(reminder.date)}</div>
                </div>
                <div className="text-sm font-medium text-gray-500">
                  <Bell className="h-4 w-4" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
