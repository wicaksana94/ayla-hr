'use client';

import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const { language } = useI18n();
  
  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { settings: { title: 'Settings', subtitle: 'Application settings', general: 'General Settings', comingSoon: 'Settings interface coming soon...' }},
      id: { settings: { title: 'Pengaturan', subtitle: 'Pengaturan aplikasi', general: 'Pengaturan Umum', comingSoon: 'Antarmuka pengaturan akan segera hadir...' }},
      es: { settings: { title: 'Configuración', subtitle: 'Configuración de la aplicación', general: 'Configuración General', comingSoon: 'Interfaz de configuracióncoming soon...' }},
      zh: { settings: { title: '设置', subtitle: '应用程序设置', general: '常规设置', comingSoon: '设置界面即将推出...' }}
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.general')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('settings.comingSoon')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
