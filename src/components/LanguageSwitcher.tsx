"use client";

import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      localStorage.setItem('i18nextLng', languageCode);
      setIsOpen(false);
      // Force a re-render of the component
      window.location.reload();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-[#0c0b1d] hover:bg-[#1a1a2e] border border-[#A855f7]/20 hover:border-[#A855f7]/40 transition-all duration-300 shadow-[0_0_15px_-3px_rgba(127,79,210,0.2)] hover:shadow-[0_0_15px_-3px_rgba(127,79,210,0.4)]"
        >
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="text-sm font-medium text-white">
            {currentLanguage.code.toUpperCase()}
          </span>
          <Globe className="h-4 w-4 text-[#A855f7]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-[#0c0b1d] border border-[#A855f7]/20 shadow-[0_0_15px_-3px_rgba(127,79,210,0.2)]"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={cn(
              "flex items-center gap-2 cursor-pointer text-white hover:bg-[#1a1a2e] hover:text-white focus:bg-[#1a1a2e] focus:text-white",
              i18n.language === language.code && "bg-[#1a1a2e] text-[#A855f7]"
            )}
          >
            <span className="text-lg">{language.flag}</span>
            <span className="text-sm">{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 