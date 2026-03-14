'use client';

import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";

export default function ProfilePage() {
  const { user } = useUser();
  const { language } = useI18n();
  
  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { profile: { title: 'Profile', subtitle: 'Manage your profile', userInfo: 'User Information', name: 'Name', email: 'Email', role: 'Role', employee: 'Employee' }},
      id: { profile: { title: 'Profil', subtitle: 'Kelola profil Anda', userInfo: 'Informasi Pengguna', name: 'Nama', email: 'Email', role: 'Peran', employee: 'Karyawan' }},
      es: { profile: { title: 'Perfil', subtitle: 'Gestiona tu perfil', userInfo: 'Información del Usuario', name: 'Nombre', email: 'Correo', role: 'Rol', employee: 'Empleado' }},
      zh: { profile: { title: '个人资料', subtitle: '管理您的个人资料', userInfo: '用户信息', name: '姓名', email: '邮箱', role: '角色', employee: '员工' }}
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
        <p className="text-muted-foreground">{t('profile.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.userInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t('profile.name')}</label>
            <p className="text-muted-foreground">{user?.fullName || 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm font-medium">{t('profile.email')}</label>
            <p className="text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          <div>
            <label className="text-sm font-medium">{t('profile.role')}</label>
            <p className="text-muted-foreground">{t('profile.employee')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
