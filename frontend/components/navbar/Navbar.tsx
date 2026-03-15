'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { 
  Bell, 
  Globe, 
  ChevronDown,
  Check,
  Languages,
  Menu,
  Loader2,
  User,
  LogOut,
  Settings,
  UserCog
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const languageOptions = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut, isLoaded: isAuthLoaded } = useAuth();
  const { language, setLanguage } = useI18n();
  const router = useRouter();
  const [notifications] = useState(3);
  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLanguage = languageOptions.find(l => l.code === language) || languageOptions[0];
  const isLoaded = isUserLoaded && isAuthLoaded;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = user?.fullName || user?.username || 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Left side - Mobile menu */}
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span className="text-sm">{currentLanguage.name}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {languageOptions.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code as any)}
                className="flex items-center justify-between"
              >
                <span className="flex items-center">
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </span>
                {language === lang.code && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile Language */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Languages className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {notifications}
            </span>
          )}
        </Button>

        {/* User Profile - Custom Dropdown (No Clerk Branding) */}
        <div className="flex items-center space-x-2">
          {isLoaded && mounted ? (
            <>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user?.fullName || user?.username || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress || ''}</p>
              </div>
              
              <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {getUserInitials()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                      {getUserInitials()}
                    </div>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{user?.fullName || user?.username || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress || ''}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                    <UserCog className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
    </header>
  );
}
