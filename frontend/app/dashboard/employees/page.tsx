'use client';

import { useI18n } from '@/lib/i18n';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeesPage() {
  const { language } = useI18n();
  
  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { employees: { title: 'Employees', subtitle: 'Manage employee data', addEmployee: 'Add Employee', list: 'Employee List', comingSoon: 'Employee management interface coming soon...' }},
      id: { employees: { title: 'Karyawan', subtitle: 'Kelola data karyawan', addEmployee: 'Tambah Karyawan', list: 'Daftar Karyawan', comingSoon: 'Antarmuka manajemen karyawan akan segera hadir...' }},
      es: { employees: { title: 'Empleados', subtitle: 'Gestionar datos de empleados', addEmployee: 'Agregar Empleado', list: 'Lista de Empleados', comingSoon: 'Interfaz de gestión de empleadoscoming soon...' }},
      zh: { employees: { title: '员工', subtitle: '管理员工数据', addEmployee: '添加员工', list: '员工列表', comingSoon: '员工管理界面即将推出...' }}
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('employees.title')}</h1>
          <p className="text-muted-foreground">{t('employees.subtitle')}</p>
        </div>
        <Button>{t('employees.addEmployee')}</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('employees.list')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('employees.comingSoon')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
