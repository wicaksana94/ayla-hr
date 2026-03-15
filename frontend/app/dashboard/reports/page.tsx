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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2,
  Calendar
} from "lucide-react";
import { getLeaves, Leave } from '@/lib/api/leaves';

export default function ReportsPage() {
  const { language } = useI18n();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

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
      es: { 
        reports: { 
          title: 'Informes', 
          subtitle: 'Análisis e informes de RRHH',
          leave: 'Informes de Permiso',
          overview: 'Resumen',
          total: 'Total Solicitudes',
          pending: 'Pendiente',
          approved: 'Aprobado',
          rejected: 'Rechazado',
          byType: 'Por Tipo',
          byStatus: 'Por Estado',
          recent: 'Solicitudes Recientes',
          period: 'Período',
          all: 'Todo',
          thisMonth: 'Este Mes',
          thisYear: 'Este Año',
          noData: 'Sin datos'
        } 
      },
      zh: { 
        reports: { 
          title: '报告', 
          subtitle: 'HR分析和报告',
          leave: '请假报告',
          overview: '概览',
          total: '总申请数',
          pending: '待处理',
          approved: '已批准',
          rejected: '已拒绝',
          byType: '按类型',
          byStatus: '按状态',
          recent: '最近申请',
          period: '时间段',
          all: '全部',
          thisMonth: '本月',
          thisYear: '今年',
          noData: '暂无数据'
        } 
      },
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const data = await getLeaves({ page: 1, limit: 100 });
        setLeaves(data.data);
      } catch (error) {
        console.error('Failed to fetch leaves:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  // Calculate statistics
  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  };

  const totalDays = leaves.reduce((sum, l) => sum + l.total_days, 0);
  const approvedDays = leaves.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.total_days, 0);

  // By leave type
  const byType = leaves.reduce((acc, l) => {
    acc[l.leave_type] = (acc[l.leave_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('reports.title')}</h1>
          <p className="text-muted-foreground">{t('reports.subtitle')}</p>
        </div>
        
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('reports.all')}</SelectItem>
            <SelectItem value="month">{t('reports.thisMonth')}</SelectItem>
            <SelectItem value="year">{t('reports.thisYear')}</SelectItem>
          </SelectContent>
        </Select>
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
              {leaves.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">{t('reports.noData')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.slice(0, 5).map((leave) => (
                      <TableRow key={leave.id}>
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
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
