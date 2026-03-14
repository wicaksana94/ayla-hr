'use client';

import { useState } from 'react';
import { UserButton, useUser, useAuth } from '@clerk/nextjs';
import { 
  Bell, 
  Globe, 
  ChevronDown,
  Check,
  Languages,
  Menu,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onLanguageChange?: (lang: string) => void;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export function Navbar({ onLanguageChange }: NavbarProps) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isLoaded: isAuthLoaded } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');
  const [notifications] = useState(3); // Mock notification count

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    onLanguageChange?.(langCode);
  };

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];
  const isLoaded = isUserLoaded && isAuthLoaded;

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Mobile Menu Button */}
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      {/* Spacer for mobile */}
      <div className="md:hidden" />

      {/* Right Section */}
      <div className="flex items-center space-x-2 md:space-x-4">
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
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="flex items-center justify-between"
              >
                <span className="flex items-center">
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </span>
                {currentLang === lang.code && (
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

        {/* User Profile */}
        <div className="flex items-center space-x-2">
          {isLoaded ? (
            <>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user?.fullName || user?.username || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress || ''}</p>
              </div>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9"
                  }
                }}
              />
            </>
          ) : (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
    </header>
  );
}
