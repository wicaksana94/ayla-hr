'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navigationConfig, Role } from '@/config/navigation';
import { 
  ChevronLeft, 
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSignOut } from '@/hooks/use-sign-out';
import { useI18n } from '@/lib/i18n';

interface SidebarProps {
  userRole?: Role;
}

export function Sidebar({ userRole = 'employee' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const handleSignOut = useSignOut();
  const { language } = useI18n();

  // Map navigation names to translation keys
  const getNavName = (name: string): string => {
    const nameMap: Record<string, string> = {
      'Dashboard': 'common.dashboard',
      'My Leave': 'common.myLeave',
      'Employees': 'common.employees',
      'Departments': 'common.departments',
      'Positions': 'common.positions',
      'Leave Requests': 'common.leaveRequests',
      'Reports': 'common.reports',
      'Profile': 'common.profile',
      'Settings': 'common.settings',
    };
    return nameMap[name] || name;
  };

  // Get translated name
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = {};
    const lang = language as 'en' | 'id' | 'es' | 'zh';
    
    // Simple translation lookup
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { common: { dashboard: 'Dashboard', myLeave: 'My Leave', employees: 'Employees', departments: 'Departments', positions: 'Positions', leaveRequests: 'Leave Requests', reports: 'Reports', profile: 'Profile', settings: 'Settings' }},
      id: { common: { dashboard: 'Dasbor', myLeave: 'Cuti Saya', employees: 'Karyawan', departments: 'Departemen', positions: 'Posisi', leaveRequests: 'Permintaan Cuti', reports: 'Laporan', profile: 'Profil', settings: 'Pengaturan' }},
      es: { common: { dashboard: 'Panel', myLeave: 'Mi Permiso', employees: 'Empleados', departments: 'Departamentos', positions: 'Posiciones', leaveRequests: 'Solicitudes de Permiso', reports: 'Informes', profile: 'Perfil', settings: 'Configuración' }},
      zh: { common: { dashboard: '仪表板', myLeave: '我的请假', employees: '员工', departments: '部门', positions: '职位', leaveRequests: '请假申请', reports: '报告', profile: '个人资料', settings: '设置' }},
    };
    
    const keyParts = key.split('.');
    if (keyParts.length === 2) {
      return trans[lang]?.[keyParts[0]]?.[keyParts[1]] || key;
    }
    return key;
  };

  const navigation = navigationConfig
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => 
        userRole ? item.roles.includes(userRole) : false
      ),
    }))
    .filter((group) => group.items.length > 0);

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">A</span>
            </div>
            <span className="text-xl font-bold">AylaHR</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold">A</span>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {navigation.map((group) => (
          <div key={group.title} className="mb-4">
            {!isCollapsed && (
              <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t(`common.${group.title.toLowerCase().replace(' ', '')}`) || group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? t(getNavName(item.name)) : undefined}
                  >
                    <item.icon className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")} />
                    {!isCollapsed && <span>{t(getNavName(item.name))}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          className={cn("w-full justify-start", isCollapsed && "justify-center px-2")}
          title={isCollapsed ? t('common.signOut') : undefined}
          onClick={handleSignOut}
        >
          <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span>{t('common.signOut')}</span>}
        </Button>
      </div>
    </aside>
  );
}
