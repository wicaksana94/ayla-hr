'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2,
  Download
} from "lucide-react";
import { getLeaves, Leave, getEmployees } from '@/lib/api/leaves';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const { language } = useI18n();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<{id: number; name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportPage, setReportPage] = useState(1);
  const REPORT_PAGE_SIZE = 10;

  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { 
        reports: { 
          title: 'Reports', 
          subtitle: 'HR analytics and reports',
          leave: 'Leave Reports',
          overview: 'Overview',
          total: 'Total Requests',
          pending: 'Pending',
          approved: 'Approved',
          rejected: 'Rejected',
          byType: 'By Type',
          byStatus: 'By Status',
          recent: 'Recent Requests',
          period: 'Period',
          all: 'All Time',
          thisMonth: 'This Month',
          thisYear: 'This Year',
          noData: 'No data available'
        } 
      },
      id: { 
        reports: { 
          title: 'Laporan', 
          subtitle: 'Analitik dan laporan HR',
          leave: 'Laporan Cuti',
          overview: 'Ringkasan',
          total: 'Total Permintaan',
          pending: 'Menunggu',
          approved: 'Disetujui',
          rejected: 'Ditolak',
          byType: 'Berdasarkan Jenis',
          byStatus: 'Berdasarkan Status',
          recent: 'Permintaan Terbaru',
          period: 'Periode',
          all: 'Semua Waktu',
          thisMonth: 'Bulan Ini',
          thisYear: 'Tahun Ini',
          noData: 'Tidak ada data'
        } 
      },
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leavesData, employeesData] = await Promise.all([
          getLeaves({ page: 1, limit: 1000 }),
          getEmployees()
        ]);
        setLeaves(leavesData.data);
        setEmployees(employeesData.map(e => ({ id: e.id, name: e.name })));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter leaves by date range
  const filteredLeaves = leaves.filter(leave => {
    if (!startDate && !endDate) return true;
    const leaveStart = new Date(leave.start_date);
    if (startDate && leaveStart < new Date(startDate)) return false;
    if (endDate && leaveStart > new Date(endDate)) return false;
    return true;
  });

  const getEmployeeName = (userId: number | null) => {
    if (!userId) return '-';
    const emp = employees.find(e => e.id === userId);
    return emp?.name || `User #${userId}`;
  };

  const handleExportXLSX = () => {
    const data = filteredLeaves.map(leave => ({
      'Employee': getEmployeeName(leave.user_id),
      'Leave Type': leave.leave_type,
      'Start Date': leave.start_date,
      'End Date': leave.end_date,
      'Total Days': leave.total_days,
      'Reason': leave.reason || '-',
      'Status': leave.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Report');
    XLSX.writeFile(wb, `leave-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Calculate statistics
  const stats = {
    total: filteredLeaves.length,
    pending: filteredLeaves.filter(l => l.status === 'pending').length,
    approved: filteredLeaves.filter(l => l.status === 'approved').length,
    rejected: filteredLeaves.filter(l => l.status === 'rejected').length,
  };

  const totalDays = filteredLeaves.reduce((sum, l) => sum + l.total_days, 0);
  const approvedDays = filteredLeaves.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.total_days, 0);

  // By leave type
  const byType = filteredLeaves.reduce((acc, l) => {
    acc[l.leave_type] = (acc[l.leave_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Pagination
  const totalReportPages = Math.ceil(filteredLeaves.length / REPORT_PAGE_SIZE);
  const paginatedLeaves = filteredLeaves.slice((reportPage - 1) * REPORT_PAGE_SIZE, reportPage * REPORT_PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('reports.title')}</h1>
          <p className="text-muted-foreground">{t('reports.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
            placeholder="Start date"
          />
          <span className="text-muted-foreground">-</span>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
            placeholder="End date"
          />
          <Button variant="outline" onClick={() => { setStartDate(''); setEndDate(''); }}>
            Clear
          </Button>
          <Button onClick={handleExportXLSX} className="gap-2">
            <Download className="h-4 w-4" />
            Export XLSX
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('reports.total')}</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {totalDays} days total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('reports.pending')}</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('reports.approved')}</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approved}</div>
                <p className="text-xs text-muted-foreground">
                  {approvedDays} days approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('reports.rejected')}</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejected}</div>
                <p className="text-xs text-muted-foreground">
                  Not approved
                </p>
              </CardContent>
            </Card>
          </div>

          {/* By Status & By Type */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.byStatus')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: t('reports.pending'), value: stats.pending, color: 'bg-yellow-500', percent: stats.total ? Math.round((stats.pending / stats.total) * 100) : 0 },
                    { label: t('reports.approved'), value: stats.approved, color: 'bg-green-500', percent: stats.total ? Math.round((stats.approved / stats.total) * 100) : 0 },
                    { label: t('reports.rejected'), value: stats.rejected, color: 'bg-red-500', percent: stats.total ? Math.round((stats.rejected / stats.total) * 100) : 0 },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">{item.value} ({item.percent}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} transition-all`} 
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('reports.byType')}</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(byType).length === 0 ? (
                  <p className="text-muted-foreground">{t('reports.noData')}</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize">{type}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.recent')}</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLeaves.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">{t('reports.noData')}</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLeaves.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell className="font-medium">{getEmployeeName(leave.user_id)}</TableCell>
                          <TableCell className="font-medium capitalize">{leave.leave_type}</TableCell>
                          <TableCell>{leave.start_date} - {leave.end_date}</TableCell>
                          <TableCell>{leave.total_days}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                              leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {t(`reports.${leave.status}`)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination */}
                  {totalReportPages > 1 && (
                    <div className="flex items-center justify-between py-4">
                      <div className="text-sm text-muted-foreground">
                        Page {reportPage} of {totalReportPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReportPage(p => Math.max(1, p - 1))}
                          disabled={reportPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReportPage(p => Math.min(totalReportPages, p + 1))}
                          disabled={reportPage === totalReportPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
