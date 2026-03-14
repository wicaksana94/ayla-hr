'use client';

import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Building2, Briefcase } from "lucide-react";

export default function DashboardPage() {
  const { language } = useI18n();
  
  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: {
        dashboard: { welcome: 'Welcome to AylaHR', totalEmployees: 'Total Employees', pendingLeaves: 'Pending Leaves', departments: 'Departments', positions: 'Positions', recentLeaveRequests: 'Recent Leave Requests', quickActions: 'Quick Actions', thisMonth: '+12 this month', requiresApproval: 'Requires approval', allActive: 'All active', acrossAll: 'Across all departments', addEmployee: 'Add Employee', newLeave: 'New Leave', pending: 'Pending', approved: 'Approved' },
        common: { dashboard: 'Dashboard' }
      },
      id: {
        dashboard: { welcome: 'Selamat Datang di AylaHR', totalEmployees: 'Total Karyawan', pendingLeaves: 'Cuti Menunggu', departments: 'Departemen', positions: 'Posisi', recentLeaveRequests: 'Permintaan Cuti Terbaru', quickActions: 'Aksi Cepat', thisMonth: '+12 bulan ini', requiresApproval: 'Memerlukan persetujuan', allActive: 'Semua aktif', acrossAll: 'Di semua departemen', addEmployee: 'Tambah Karyawan', newLeave: 'Cuti Baru', pending: 'Menunggu', approved: 'Disetujui' },
        common: { dashboard: 'Dasbor' }
      },
      es: {
        dashboard: { welcome: 'Bienvenido a AylaHR', totalEmployees: 'Total de Empleados', pendingLeaves: 'Permisos Pendientes', departments: 'Departamentos', positions: 'Posiciones', recentLeaveRequests: 'Solicitudes Recientes', quickActions: 'Acciones Rápidas', thisMonth: '+12 este mes', requiresApproval: 'Requiere aprobación', allActive: 'Todos activos', acrossAll: 'En todos los departamentos', addEmployee: 'Agregar Empleado', newLeave: 'Nuevo Permiso', pending: 'Pendiente', approved: 'Aprobado' },
        common: { dashboard: 'Panel' }
      },
      zh: {
        dashboard: { welcome: '欢迎使用 AylaHR', totalEmployees: '员工总数', pendingLeaves: '待处理请假', departments: '部门', positions: '职位', recentLeaveRequests: '最近请假申请', quickActions: '快速操作', thisMonth: '+12 本月', requiresApproval: '需要审批', allActive: '全部活跃', acrossAll: '在所有部门', addEmployee: '添加员工', newLeave: '新请假', pending: '待处理', approved: '已批准' },
        common: { dashboard: '仪表板' }
      }
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

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
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.thisMonth')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.pendingLeaves')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.requiresApproval')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.departments')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.allActive')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.positions')}</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">Annual Leave - 3 days</p>
                </div>
                <span className="text-sm text-yellow-600">{t('dashboard.pending')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Jane Smith</p>
                  <p className="text-sm text-muted-foreground">Sick Leave - 1 day</p>
                </div>
                <span className="text-sm text-green-600">{t('dashboard.approved')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <a href="/dashboard/employees" className="p-4 border rounded-lg hover:bg-accent text-center">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">{t('dashboard.addEmployee')}</p>
              </a>
              <a href="/dashboard/leaves" className="p-4 border rounded-lg hover:bg-accent text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">{t('dashboard.newLeave')}</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
