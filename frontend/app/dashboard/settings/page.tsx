'use client';

import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from 'react';
import { Moon, Sun, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ayla-hr.onrender.com';

export default function SettingsPage() {
  const { language } = useI18n();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Demo user ID - in production, get from auth
  const userId = 1;

  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { settings: { title: 'Settings', subtitle: 'Application settings', general: 'General Settings', appearance: 'Appearance', darkMode: 'Dark Mode', darkModeDesc: 'Switch between light and dark theme', comingSoon: 'Settings interface coming soon...' }},
      id: { settings: { title: 'Pengaturan', subtitle: 'Pengaturan aplikasi', general: 'Pengaturan Umum', appearance: 'Tampilan', darkMode: 'Mode Gelap', darkModeDesc: 'Beralih antara tema terang dan gelap', comingSoon: 'Antarmuka pengaturan akan segera hadir...' }},
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/employees/${userId}`);
        if (res.ok) {
          const user = await res.json();
          setDarkMode(user.theme === 'dark');
        }
      } catch (error) {
        console.error('Failed to fetch user settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserSettings();
  }, []);

  const handleDarkModeToggle = async (enabled: boolean) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/employees/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: enabled ? 'dark' : 'light' }),
      });
      
      if (res.ok) {
        setDarkMode(enabled);
        // Apply theme to document
        if (enabled) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error) {
      console.error('Failed to update theme:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.appearance')}</CardTitle>
          <CardDescription>{t('settings.darkModeDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <div>
                <p className="font-medium">{t('settings.darkMode')}</p>
              </div>
            </div>
            <Switch 
              checked={darkMode} 
              onCheckedChange={handleDarkModeToggle}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
