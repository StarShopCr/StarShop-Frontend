"use client";

import { PropsWithChildren, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

export function I18nProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n.init();
    }

    const handleLanguageChange = (lng: string) => {
      document.documentElement.lang = lng;
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
} 