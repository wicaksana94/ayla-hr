'use client';

import { useI18n, useTranslations } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { format, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon, Plus, Loader2, CheckCircle, XCircle, Paperclip } from "lucide-react";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { createLeave, getLeaves, getLeaveTypes, Leave, LeaveType } from '@/lib/api/leaves';
import { SickLeaveUploader } from "@/components/uploadthing/SickLeaveUploader";
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700', 
  rejected: 'bg-red-100 text-red-700',
};

export default function MyLeavePage() {
  const { language } = useI18n();
  const t = useTranslations();
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [leaveType, setLeaveType] = useState('');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const totalDays = selectedRange?.from && selectedRange?.to 
    ? differenceInDays(selectedRange.to, selectedRange.from) + 1 
    : 0;

  // Fetch leave types and history
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesData, historyData] = await Promise.all([
          getLeaveTypes(),
          getLeaves({ page: 1, limit: 10 })
        ]);
        setLeaveTypes(typesData);
        setLeaveHistory(historyData.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveType || !selectedRange?.from || !selectedRange?.to) {
      toast.error(t('myLeave.fillAllFields') || 'Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Use default user ID (for demo without Clerk)
      const userId = 1;
      
      await createLeave({
        user_id: userId,
        leave_type: leaveType,
        start_date: format(selectedRange.from, 'yyyy-MM-dd'),
        end_date: format(selectedRange.to, 'yyyy-MM-dd'),
        total_days: totalDays,
        reason: reason || undefined,
        attachment: attachment || undefined,
      });

      toast.success(t('myLeave.submitSuccess') || 'Leave request submitted successfully!');
      setSubmitSuccess(true);
      setLeaveType('');
      setSelectedRange(undefined);
      setReason('');
      setAttachment('');
      
      // Refresh history
      const historyData = await getLeaves({ page: 1, limit: 10 });
      setLeaveHistory(historyData.data);
      
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to submit leave:', error);
      toast.error(t('myLeave.submitError') || 'Failed to submit leave request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getLeaveTypeLabel = (code: string) => {
    return t(`leaveTypes.${code}`) || code;
  };

  const getStatusLabel = (status: string) => {
    return t(`myLeave.${status}`) || status;
  };

  // Calculate leave balances
  const balances = {
    annual: 12,
    sick: 10,
    maternity: 90,
    marriage: 3,
    bereavement: 3,
    baptism: 2,
    paid: 5,
    paid_leave: 5,
    unpaid: Infinity,
    unpaid_leave: Infinity,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('myLeave.title')}</h1>
        <p className="text-muted-foreground">{t('myLeave.subtitle')}</p>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {leaveTypes.map((type) => (
          <Card key={type.code}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t(`leaveTypes.${type.code}`)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {['unpaid', 'unpaid_leave'].includes(type.code) ? '∞' : balances[type.code as keyof typeof balances] || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {type.is_paid ? 'Paid' : 'Unpaid'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Leave Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('myLeave.submit')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('myLeave.type')}</label>
                <Select value={leaveType} onValueChange={setLeaveType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('myLeave.selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.code} value={type.code}>
                        {t(`leaveTypes.${type.code}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('myLeave.dateRange')}</label>
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
                        <span>{t('myLeave.pickDate')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={selectedRange}
                      onSelect={setSelectedRange}
                      numberOfMonths={2}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {totalDays > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">
                  {t('myLeave.totalDays')}: <span className="text-primary">{totalDays} {t('myLeave.days')}</span>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('myLeave.reason')}</label>
              <textarea 
                className="w-full p-2 border rounded-md min-h-[100px]"
                placeholder={t('myLeave.reasonPlaceholder')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            {/* File upload for sick leave */}
            {leaveType === 'sick' && (
              <SickLeaveUploader 
                onUploadComplete={setAttachment}
                value={attachment}
              />
            )}

            <Button type="submit" className="w-full" disabled={submitting || !leaveType || !selectedRange?.from || !selectedRange?.to}>
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : submitSuccess ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {submitSuccess ? 'Submitted!' : t('myLeave.submitBtn')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Leave History */}
      <Card>
        <CardHeader>
          <CardTitle>{t('myLeave.history')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : leaveHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">{t('myLeave.noHistory')}</p>
          ) : (
            <div className="space-y-4">
              {leaveHistory.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{getLeaveTypeLabel(leave.leave_type)}</p>
                    <p className="text-sm text-muted-foreground">
                      {leave.start_date} - {leave.end_date} ({leave.total_days} {t('myLeave.days')})
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColors[leave.status]}`}>
                    {getStatusLabel(leave.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
