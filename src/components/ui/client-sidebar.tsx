"use client";
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './sidebar';

const sidebarRoutes = [
  '/profile',
  '/dashboard',
  '/analytics',
  '/products',
  '/transactions',
  '/invoices',
  '/billing',
  '/chat',
  '/supportTickets',
  '/faq',
  '/settings',
  '/help'
];

export const ClientSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation('common');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-md hover:bg-muted transition-colors"
          aria-label={t('navigation.menu')}
      >

          {isOpen ? <X size={24} /> : <Menu size={24}  className="w-6 h-6 text-foreground" />}
      </button>
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}; 