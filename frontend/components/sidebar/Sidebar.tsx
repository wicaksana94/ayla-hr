'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navigationConfig, Role } from '@/config/navigation';
import { 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSignOut } from '@/hooks/use-sign-out';
import { useI18n } from '@/lib/i18n';

interface SidebarProps {
  userRole?: Role;
  isOpen?: boolean;
  onClose?: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

// Translation function
const getTranslations = (lang: string) => {
  const trans: Record<string, Record<string, Record<string, string>>> = {
    en: {
      common: { dashboard: 'Dashboard', myLeave: 'My Leave', employees: 'Employees', departments: 'Departments', positions: 'Positions', leaveRequests: 'Leave Requests', reports: 'Reports', profile: 'Profile', settings: 'Settings', signOut: 'Sign Out', main: 'Main', hrManagement: 'HR Management', settingsGroup: 'Settings' }
    },
    id: {
      common: { dashboard: 'Dasbor', myLeave: 'Cuti Saya', employees: 'Karyawan', departments: 'Departemen', positions: 'Posisi', leaveRequests: 'Permintaan Cuti', reports: 'Laporan', profile: 'Profil', settings: 'Pengaturan', signOut: 'Keluar', main: 'Utama', hrManagement: 'Manajemen HR', settingsGroup: 'Pengaturan' }
    },
    es: {
      common: { dashboard: 'Panel', myLeave: 'Mi Permiso', employees: 'Empleados', departments: 'Departamentos', positions: 'Posiciones', leaveRequests: 'Solicitudes de Permiso', reports: 'Informes', profile: 'Perfil', settings: 'Configuración', signOut: 'Cerrar Sesión', main: 'Principal', hrManagement: 'Gestión HR', settingsGroup: 'Configuración' }
    },
    zh: {
      common: { dashboard: '仪表板', myLeave: '我的请假', employees: '员工', departments: '部门', positions: '职位', leaveRequests: '请假申请', reports: '报告', profile: '个人资料', settings: '设置', signOut: '退出登录', main: '主要', hrManagement: '人力资源管理', settingsGroup: '设置' }
    }
  };
  return trans[lang as 'en'|'id'|'es'|'zh'] || trans.en;
};

const getNavName = (name: string): string => {
  const nameMap: Record<string, string> = {
    'Dashboard': 'dashboard',
    'My Leave': 'myLeave',
    'Employees': 'employees',
    'Departments': 'departments',
    'Positions': 'positions',
    'Leave Requests': 'leaveRequests',
    'Reports': 'reports',
    'Profile': 'profile',
    'Settings': 'settings',
  };
  return nameMap[name] || name;
};

const getGroupTitle = (title: string): string => {
  const titleMap: Record<string, string> = {
    'Main': 'main',
    'HR Management': 'hrManagement',
    'Settings': 'settingsGroup',
  };
  return titleMap[title] || title;
};

export function Sidebar({ userRole = 'employee', isOpen = false, onClose, onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };
  const pathname = usePathname();
  const handleSignOut = useSignOut();
  const { language } = useI18n();
  const t = getTranslations(language);

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
    <>
      {/* Mobile Sidebar - Slide in */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r bg-card transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">A</span>
            </div>
            <span className="text-xl font-bold">AylaHR</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          {navigation.map((group) => (
            <div key={group.title} className="mb-4">
              <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t.common[getGroupTitle(group.title)] || group.title}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      <span>{t.common[getNavName(item.name)] || item.name}</span>
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
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>{t.common.signOut}</span>
          </Button>
        </div>
      </aside>

      {/* Desktop Sidebar - Fixed */}
      <aside
        className={cn(
          "hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:flex-col md:w-64 md:border-r md:bg-card md:transition-all md:duration-300",
          isCollapsed && "md:w-16"
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
          onClick={handleToggleCollapse}
          className="hidden md:flex absolute -right-3 top-7 z-10 h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent"
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
                  {t.common[getGroupTitle(group.title)] || group.title}
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
                      title={isCollapsed ? t.common[getNavName(item.name)] || item.name : undefined}
                    >
                      <item.icon className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")} />
                      {!isCollapsed && <span>{t.common[getNavName(item.name)] || item.name}</span>}
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
            title={isCollapsed ? t.common.signOut : undefined}
            onClick={handleSignOut}
          >
            <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>{t.common.signOut}</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
