import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { useUser } from '@/lib/userContext';
import { formatTime } from '@/lib/timeUtils';

interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({ value, onChange, disabled, className }: TimePickerProps) {
  const { user } = useUser();
  const [selectedHour, setSelectedHour] = useState<number>(9);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [isAM, setIsAM] = useState<boolean>(true);

  // Debug log to check user timeFormat
  console.log('TimePicker - user timeFormat:', user?.timeFormat);
  
  // Force component to re-render when timeFormat changes
  const [componentKey, setComponentKey] = useState(0);
  
  useEffect(() => {
    setComponentKey(prev => prev + 1);
  }, [user?.timeFormat]);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const time = value.trim();
      if (user?.timeFormat === '24') {
        // 24-hour format (e.g., "09:30")
        const [hours, minutes] = time.split(':').map(Number);
        setSelectedHour(hours);
        setSelectedMinute(minutes);
      } else {
        // 12-hour format (e.g., "9:30 AM")
        const timeMatch = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
        if (timeMatch) {
          const [, hourStr, minuteStr, period] = timeMatch;
          setSelectedHour(parseInt(hourStr));
          setSelectedMinute(parseInt(minuteStr));
          setIsAM(period.toUpperCase() === 'AM');
        }
      }
    }
  }, [value, user?.timeFormat]);

  // Update parent when time changes
  useEffect(() => {
    let timeString: string;
    
    if (user?.timeFormat === '24') {
      // 24-hour format
      timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    } else {
      // 12-hour format
      const displayHour = selectedHour === 0 ? 12 : selectedHour;
      const period = isAM ? 'AM' : 'PM';
      timeString = `${displayHour}:${selectedMinute.toString().padStart(2, '0')} ${period}`;
    }
    
    onChange(timeString);
  }, [selectedHour, selectedMinute, isAM, user?.timeFormat, onChange]);

  // Force 24-hour format detection with explicit checking
  const is24HourFormat = user?.timeFormat === '24';
  console.log('TimePicker - is24HourFormat:', is24HourFormat);
  
  if (is24HourFormat) {
    // Use HTML time input for 24-hour format
    return (
      <Input
        key={`time-picker-24h-${componentKey}`}
        type="time"
        value={value || '09:00'}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={className}
      />
    );
  }

  // Custom 12-hour format picker
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = [0, 15, 30, 45];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Hour selector */}
      <div className="flex flex-col space-y-1">
        <Label className="text-xs text-gray-500">Hour</Label>
        <select
          value={selectedHour}
          onChange={(e) => setSelectedHour(parseInt(e.target.value))}
          disabled={disabled}
          className="p-2 border rounded text-sm min-w-[60px]"
        >
          {hours.map(hour => (
            <option key={hour} value={hour}>{hour.toString().padStart(2, '0')}</option>
          ))}
        </select>
      </div>

      {/* Minute selector */}
      <div className="flex flex-col space-y-1">
        <Label className="text-xs text-gray-500">Min</Label>
        <select
          value={selectedMinute}
          onChange={(e) => setSelectedMinute(parseInt(e.target.value))}
          disabled={disabled}
          className="p-2 border rounded text-sm min-w-[60px]"
        >
          {minutes.map(minute => (
            <option key={minute} value={minute}>{minute.toString().padStart(2, '0')}</option>
          ))}
        </select>
      </div>

      {/* AM/PM selector */}
      <div className="flex flex-col space-y-1">
        <Label className="text-xs text-gray-500">Period</Label>
        <div className="flex">
          <Button
            type="button"
            variant={isAM ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAM(true)}
            disabled={disabled}
            className="rounded-r-none text-xs px-3"
          >
            AM
          </Button>
          <Button
            type="button"
            variant={!isAM ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAM(false)}
            disabled={disabled}
            className="rounded-l-none text-xs px-3"
          >
            PM
          </Button>
        </div>
      </div>
    </div>
  );
}