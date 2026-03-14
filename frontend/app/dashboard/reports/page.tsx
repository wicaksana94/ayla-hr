'use client';

import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  const { language } = useI18n();
  
  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { reports: { title: 'Reports', subtitle: 'HR analytics and reports', leave: 'Leave Reports', comingSoon: 'Reports interface coming soon...' }},
      id: { reports: { title: 'Laporan', subtitle: 'Analitik dan laporan HR', leave: 'Laporan Cuti', comingSoon: 'Antarmuka laporan akan segera hadir...' }},
      es: { reports: { title: 'Informes', subtitle: 'Análisis e informes de RRHH', leave: 'Informes de Permiso', comingSoon: 'Interfaz de informescoming soon...' }},
      zh: { reports: { title: '报告', subtitle: 'HR分析和报告', leave: '请假报告', comingSoon: '报告界面即将推出...' }}
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('reports.title')}</h1>
        <p className="text-muted-foreground">{t('reports.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('reports.leave')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('reports.comingSoon')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
