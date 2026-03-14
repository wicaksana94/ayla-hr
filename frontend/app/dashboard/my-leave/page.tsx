'use client';

import { useI18n } from '@/lib/i18n';
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
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";

const leaveTypesEn = [
  { value: 'annual', label: 'Annual Leave', paid: true },
  { value: 'sick', label: 'Sick Leave', paid: true },
  { value: 'paid', label: 'Paid Leave', paid: true },
  { value: 'unpaid', label: 'Unpaid Leave', paid: false },
];

const leaveTypesId = [
  { value: 'annual', label: 'Cuti Tahunan', paid: true },
  { value: 'sick', label: 'Cuti Sakit', paid: true },
  { value: 'paid', label: 'Cuti Dibayar', paid: true },
  { value: 'unpaid', label: 'Cuti Tidak Dibayar', paid: false },
];

const leaveTypesEs = [
  { value: 'annual', label: 'Permiso Anual', paid: true },
  { value: 'sick', label: 'Permiso por Krankheit', paid: true },
  { value: 'paid', label: 'Permiso Pagado', paid: true },
  { value: 'unpaid', label: 'Permiso No Pagado', paid: false },
];

const leaveTypesZh = [
  { value: 'annual', label: '年假', paid: true },
  { value: 'sick', label: '病假', paid: true },
  { value: 'paid', label: '带薪假', paid: true },
  { value: 'unpaid', label: '无薪假', paid: false },
];

export default function MyLeavePage() {
  const { language } = useI18n();
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [leaveType, setLeaveType] = useState('');

  const leaveTypes = language === 'id' ? leaveTypesId : language === 'es' ? leaveTypesEs : language === 'zh' ? leaveTypesZh : leaveTypesEn;

  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { myLeave: { title: 'My Leave', subtitle: 'Manage your leave requests', balance: 'Leave Balance', submit: 'Submit Leave Request', type: 'Leave Type', dateRange: 'Date Range', totalDays: 'Total Days', days: 'day(s)', reason: 'Reason (Optional)', reasonPlaceholder: 'Enter reason for leave...', submitBtn: 'Submit Request', history: 'Leave History', selectType: 'Select leave type', pickDate: 'Pick a date range', paid: 'Paid', unpaid: 'Unpaid', annual: 'Annual', sick: 'Sick', paidLeave: 'Paid', pending: 'Pending', approved: 'Approved' }},
      id: { myLeave: { title: 'Cuti Saya', subtitle: 'Kelola permintaan cuti Anda', balance: 'Saldo Cuti', submit: 'Ajukan Permintaan Cuti', type: 'Jenis Cuti', dateRange: 'Rentang Tanggal', totalDays: 'Total Hari', days: 'hari', reason: 'Alasan (Opsional)', reasonPlaceholder: 'Masukkan alasan cuti...', submitBtn: 'Ajukan Permintaan', history: 'Riwayat Cuti', selectType: 'Pilih jenis cuti', pickDate: 'Pilih rentang tanggal', paid: 'Dibayar', unpaid: 'Tidak Dibayar', annual: 'Tahunan', sick: 'Sakit', paidLeave: 'Dibayar', pending: 'Menunggu', approved: 'Disetujui' }},
      es: { myLeave: { title: 'Mi Permiso', subtitle: 'Gestiona tus solicitudes de permiso', balance: 'Saldo de Permiso', submit: 'Enviar Solicitud de Permiso', type: 'Tipo de Permiso', dateRange: 'Rango de Fechas', totalDays: 'Días Totales', days: 'días', reason: 'Razón (Opcional)', reasonPlaceholder: 'Ingrese razón del permiso...', submitBtn: 'Enviar Solicitud', history: 'Historial de Permisos', selectType: 'Seleccione tipo de permiso', pickDate: 'Seleccione rango de fechas', paid: 'Pagado', unpaid: 'No Pagado', annual: 'Anual', sick: 'Enfermo', paidLeave: 'Pagado', pending: 'Pendiente', approved: 'Aprobado' }},
      zh: { myLeave: { title: '我的请假', subtitle: '管理您的请假申请', balance: '请假余额', submit: '提交请假申请', type: '请假类型', dateRange: '日期范围', totalDays: '总天数', days: '天', reason: '原因（可选）', reasonPlaceholder: '输入请假原因...', submitBtn: '提交申请', history: '请假历史', selectType: '选择请假类型', pickDate: '选择日期范围', paid: '带薪', unpaid: '无薪', annual: '年假', sick: '病假', paidLeave: '带薪', pending: '待处理', approved: '已批准' }}
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  const totalDays = selectedRange?.from && selectedRange?.to 
    ? differenceInDays(selectedRange.to, selectedRange.from) + 1 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('myLeave.title')}</h1>
        <p className="text-muted-foreground">{t('myLeave.subtitle')}</p>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {leaveTypes.map((type) => (
          <Card key={type.value}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{type.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {type.value === 'annual' ? '12' : type.value === 'sick' ? '10' : type.value === 'paid' ? '5' : '∞'}
              </div>
              <p className="text-xs text-muted-foreground">
                {type.paid ? t('myLeave.paid') : t('myLeave.unpaid')}
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
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('myLeave.type')}</label>
                <Select value={leaveType} onValueChange={setLeaveType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('myLeave.selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} {type.paid ? `(${t('myLeave.paid')})` : `(${t('myLeave.unpaid')})`}
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
              />
            </div>

            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {t('myLeave.submitBtn')}
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
          <div className="space-y-4">
            {[
              { type: 'Annual Leave', dates: 'Jan 15 - Jan 17, 2024', days: 3, status: 'approved' },
              { type: 'Sick Leave', dates: 'Jan 5, 2024', days: 1, status: 'approved' },
              { type: 'Unpaid Leave', dates: 'Feb 1 - Feb 2, 2024', days: 2, status: 'pending' },
            ].map((leave, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{leave.type}</p>
                  <p className="text-sm text-muted-foreground">{leave.dates} ({leave.days} {t('myLeave.days')})</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  leave.status === 'approved' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {leave.status === 'approved' ? t('myLeave.approved') : t('myLeave.pending')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
