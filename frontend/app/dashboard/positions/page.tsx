'use client';

import { useI18n } from '@/lib/i18n';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PositionsPage() {
  const { language } = useI18n();
  
  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { positions: { title: 'Positions', subtitle: 'Manage positions', addPosition: 'Add Position', list: 'Position List', comingSoon: 'Position management interface coming soon...' }},
      id: { positions: { title: 'Posisi', subtitle: 'Kelola posisi', addPosition: 'Tambah Posisi', list: 'Daftar Posisi', comingSoon: 'Antarmuka manajemen posisi akan segera hadir...' }},
      es: { positions: { title: 'Posiciones', subtitle: 'Gestionar posiciones', addPosition: 'Agregar Posición', list: 'Lista de Posiciones', comingSoon: 'Interfaz de gestión de posicionescoming soon...' }},
      zh: { positions: { title: '职位', subtitle: '管理职位', addPosition: '添加职位', list: '职位列表', comingSoon: '职位管理界面即将推出...' }}
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('positions.title')}</h1>
          <p className="text-muted-foreground">{t('positions.subtitle')}</p>
        </div>
        <Button>{t('positions.addPosition')}</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('positions.list')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('positions.comingSoon')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
