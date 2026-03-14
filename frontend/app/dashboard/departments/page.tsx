'use client';

import { useI18n } from '@/lib/i18n';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DepartmentsPage() {
  const { language } = useI18n();
  
  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { departments: { title: 'Departments', subtitle: 'Manage departments', addDepartment: 'Add Department', list: 'Department List', comingSoon: 'Department management interface coming soon...' }},
      id: { departments: { title: 'Departemen', subtitle: 'Kelola departemen', addDepartment: 'Tambah Departemen', list: 'Daftar Departemen', comingSoon: 'Antarmuka manajemen departemen akan segera hadir...' }},
      es: { departments: { title: 'Departamentos', subtitle: 'Gestionar departamentos', addDepartment: 'Agregar Departamento', list: 'Lista de Departamentos', comingSoon: 'Interfaz de gestión de departamentoscoming soon...' }},
      zh: { departments: { title: '部门', subtitle: '管理部门', addDepartment: '添加部门', list: '部门列表', comingSoon: '部门管理界面即将推出...' }}
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('departments.title')}</h1>
          <p className="text-muted-foreground">{t('departments.subtitle')}</p>
        </div>
        <Button>{t('departments.addDepartment')}</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('departments.list')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('departments.comingSoon')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
