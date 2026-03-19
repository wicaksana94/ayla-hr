'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Building2, Briefcase, Loader2 } from "lucide-react";
import Link from 'next/link';
import { getEmployees, getDepartments, getPositions, Employee, Department, Position } from '@/lib/api/data';
import { getLeaves, Leave } from '@/lib/api/leaves';

interface DashboardStats {
  totalEmployees: number;
  pendingLeaves: number;
  departments: number;
  positions: number;
}

export default function DashboardPage() {
  const { language } = useI18n();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingLeaves: 0,
    departments: 0,
    positions: 0,
  });
  const [recentLeaves, setRecentLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  
  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: {
        dashboard: { welcome: 'Welcome to AylaHR', totalEmployees: 'Total Employees', pendingLeaves: 'Pending Leaves', departments: 'Departments', positions: 'Positions', recentLeaveRequests: 'Recent Leave Requests', quickActions: 'Quick Actions', thisMonth: '+12 this month', requiresApproval: 'Requires approval', allActive: 'All active', acrossAll: 'Across all departments', addEmployee: 'Add Employee', newLeave: 'New Leave', pending: 'Pending', approved: 'Approved', rejected: 'Rejected', loading: 'Loading...' },
        common: { dashboard: 'Dashboard' }
      },
      id: {
        dashboard: { welcome: 'Selamat Datang di AylaHR', totalEmployees: 'Total Karyawan', pendingLeaves: 'Cuti Menunggu', departments: 'Departemen', positions: 'Posisi', recentLeaveRequests: 'Permintaan Cuti Terbaru', quickActions: 'Aksi Cepat', thisMonth: '+12 bulan ini', requiresApproval: 'Memerlukan persetujuan', allActive: 'Semua aktif', acrossAll: 'Di semua departemen', addEmployee: 'Tambah Karyawan', newLeave: 'Cuti Baru', pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak', loading: 'Memuat...' },
        common: { dashboard: 'Dasbor' }
      },
      es: {
        dashboard: { welcome: 'Bienvenido a AylaHR', totalEmployees: 'Total de Empleados', pendingLeaves: 'Permisos Pendientes', departments: 'Departamentos', positions: 'Posiciones', recentLeaveRequests: 'Solicitudes Recientes', quickActions: 'Acciones Rápidas', thisMonth: '+12 este mes', requiresApproval: 'Requiere aprobación', allActive: 'Todos activos', acrossAll: 'En todos los departamentos', addEmployee: 'Agregar Empleado', newLeave: 'Nuevo Permiso', pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado', loading: 'Cargando...' },
        common: { dashboard: 'Panel' }
      },
      zh: {
        dashboard: { welcome: '欢迎使用 AylaHR', totalEmployees: '员工总数', pendingLeaves: '待处理请假', departments: '部门', positions: '职位', recentLeaveRequests: '最近请假申请', quickActions: '快速操作', thisMonth: '+12 本月', requiresApproval: '需要审批', allActive: '全部活跃', acrossAll: '在所有部门', addEmployee: '添加员工', newLeave: '新请假', pending: '待处理', approved: '已批准', rejected: '已拒绝', loading: '加载中...' },
        common: { dashboard: '仪表板' }
      }
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [employeesRes, departmentsRes, positionsRes, leavesRes] = await Promise.all([
          getEmployees({ page: 1, limit: 1 }), // Just get count
          getDepartments(),
          getPositions({ page: 1, limit: 1 }),
          getLeaves({ status: 'pending', page: 1, limit: 5 }),
        ]);

        setStats({
          totalEmployees: employeesRes.data.length > 0 ? employeesRes.data[0]?.id || 0 : 0,
          pendingLeaves: leavesRes.data.length,
          departments: departmentsRes.length,
          positions: positionsRes.data.length,
        });

        // Get recent leaves (all statuses)
        const allLeaves = await getLeaves({ page: 1, limit: 5 });
        setRecentLeaves(allLeaves.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Keep default zeros on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return t('dashboard.approved');
      case 'rejected': return t('dashboard.rejected');
      default: return t('dashboard.pending');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('dashboard.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard.welcome')}</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalEmployees')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.pendingLeaves')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.requiresApproval')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.departments')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.allActive')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.positions')}</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.positions}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.acrossAll')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentLeaveRequests')}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLeaves.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent leave requests</p>
            ) : (
              <div className="space-y-4">
                {recentLeaves.map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{leave.leave_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {leave.start_date} - {leave.end_date} ({leave.total_days} days)
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(leave.status)}`}>
                      {getStatusLabel(leave.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/employees" className="p-4 border rounded-lg hover:bg-accent text-center transition-colors">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">{t('dashboard.addEmployee')}</p>
              </Link>
              <Link href="/dashboard/leaves" className="p-4 border rounded-lg hover:bg-accent text-center transition-colors">
                <Calendar className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">{t('dashboard.newLeave')}</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
