'use client';

import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LeavesPage() {
  const { language } = useI18n();
  
  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { leaves: { title: 'Leave Requests', subtitle: 'Manage and submit leave requests', newRequest: 'New Request', recent: 'Recent Leave Requests', comingSoon: 'Leave management interface coming soon...' }},
      id: { leaves: { title: 'Permintaan Cuti', subtitle: 'Kelola dan ajukan permintaan cuti', newRequest: 'Permintaan Baru', recent: 'Permintaan Cuti Terbaru', comingSoon: 'Antarmuka manajemen cuti akan segera hadir...' }},
      es: { leaves: { title: 'Solicitudes de Permiso', subtitle: 'Gestionar y enviar solicitudes de permiso', newRequest: 'Nueva Solicitud', recent: 'Solicitudes Recientes', comingSoon: 'Interfaz de gestión de permisoscoming soon...' }},
      zh: { leaves: { title: '请假申请', subtitle: '管理和提交请假申请', newRequest: '新申请', recent: '最近请假申请', comingSoon: '请假管理界面即将推出...' }}
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('leaves.title')}</h1>
        <p className="text-muted-foreground">{t('leaves.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('leaves.recent')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('leaves.comingSoon')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
