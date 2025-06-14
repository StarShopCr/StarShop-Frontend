"use client";

import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  User,
  LayoutDashboard,
  LineChart,
  ShoppingBag,
  Receipt,
  FileText,
  CreditCard,
  MessageSquare,
  Ticket,
  HelpCircle,
  Settings,
  LucideIcon
} from 'lucide-react';

interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Profile", path: "/profile", icon: User },
      { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { title: "Analytics", path: "/analytics", icon: LineChart },
      { title: "Products", path: "/products", icon: ShoppingBag },
    ]
  },
  {
    title: "Finance",
    items: [
      { title: "Transactions", path: "/transactions", icon: Receipt },
      { title: "Invoices", path: "/invoices", icon: FileText },
      { title: "Billing", path: "/billing", icon: CreditCard },
    ]
  },
  {
    title: "Support",
    items: [
      { title: "Chat", path: "/chat", icon: MessageSquare },
      { title: "Support Tickets", path: "/supportTickets", icon: Ticket },
      { title: "FAQ", path: "/faq", icon: HelpCircle },
    ]
  }
];

const bottomNavItems: NavItem[] = [
  { title: "Settings", path: "/settings", icon: Settings },
  { title: "Help", path: "/help", icon: HelpCircle },
];

export const Sidebar: FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? "bg-purple-600 text-white" : "hover:bg-muted text-muted-foreground hover:text-foreground";
  };

  const NavLink: FC<NavItem> = ({ title, path, icon: Icon }) => (
    <Link href={path} className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${isActive(path)}`}>
      <Icon className="w-6 h-6" />
      <span className="text-[12px]">{title}</span>
    </Link>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed lg:relative lg:sticky lg:top-0
        top-0 left-0 h-full
        w-64 shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        z-40 overflow-y-auto max-h-screen
        bg-background dark:bg-[#0F0E1D] text-white p-2 flex flex-col
        overflow-x-hidden
        border-r border-gray-700/30
      `}>

        <div className="flex-1">
          <div className="flex justify-center mb-2">
            <Image src="/starshop-logos/starshop-logo.svg" alt="StarShop Logo" width={60} height={60} className="mb-1" />
          </div>

          <div className="my-2 -mx-6 border-t border-gray-700/30"></div>

          {navSections.map((section, index) => (
            <div key={index} className="mb-2">
              <h2 className="text-[12px] font-semibold mb-4">{section.title}</h2>
              <nav className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <NavLink key={itemIndex} {...item} />
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div>
          <div className="my-2 -mx-6 border-t border-gray-700/30"></div>
          <nav className="space-y-3">
            {bottomNavItems.map((item, index) => (
              <NavLink key={index} {...item} />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};
