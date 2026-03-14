'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar, DateRange } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { format, differenceInDays } from 'date-fns';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';

const leaveTypes = [
  { value: 'annual', label: 'Annual Leave', paid: true },
  { value: 'sick', label: 'Sick Leave', paid: true },
  { value: 'paid', label: 'Paid Leave', paid: true },
  { value: 'unpaid', label: 'Unpaid Leave', paid: false },
];

export default function LeavesPage() {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [leaveType, setLeaveType] = useState('');

  const totalDays = selectedRange?.from && selectedRange?.to 
    ? differenceInDays(selectedRange.to, selectedRange.from) + 1 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Requests</h1>
          <p className="text-muted-foreground">Manage and submit leave requests</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Submit Leave Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Leave Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Leave Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Leave Type</label>
                <Select value={leaveType} onValueChange={setLeaveType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} {type.paid ? '(Paid)' : '(Unpaid)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedRange?.from ? (
                        selectedRange?.to ? (
                          <>
                            {format(selectedRange.from, 'MMM d, yyyy')} -{' '}
                            {format(selectedRange.to, 'MMM d, yyyy')}
                          </>
                        ) : (
                          format(selectedRange.from, 'MMM d, yyyy')
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={selectedRange}
                      onSelect={setSelectedRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Total Days Display */}
            {totalDays > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">
                  Total Days: <span className="text-primary">{totalDays} day(s)</span>
                </p>
              </div>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason (Optional)</label>
              <textarea 
                className="w-full p-2 border rounded-md min-h-[100px]"
                placeholder="Enter reason for leave..."
              />
            </div>

            <Button type="submit" className="w-full">
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Leave History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'Annual Leave', dates: 'Jan 15 - Jan 17, 2024', days: 3, status: 'approved' },
              { type: 'Sick Leave', dates: 'Jan 5, 2024', days: 1, status: 'approved' },
              { type: 'Unpaid Leave', dates: 'Feb 1 - Feb 2, 2024', days: 2, status: 'pending' },
            ].map((leave, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{leave.type}</p>
                  <p className="text-sm text-muted-foreground">{leave.dates} ({leave.days} day(s))</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  leave.status === 'approved' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
