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

const Sidebar: FC = () => {
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
    <aside className="w-64 min-h-screen bg-card border-r border-border text-card-foreground p-2 flex flex-col">
      <div className="flex-1">
        <div className="flex justify-center mb-2">
          <Image src="/starshop-logos/starshop-logo.svg" alt="StarShop Logo" width={60} height={60} className="mb-1" />
        </div>

        <div className="my-2 border-t border-border -mx-6"></div>
        
        {navSections.map((section, index) => (
          <div key={index} className="mb-2">
            <h2 className="text-[12px] font-semibold mb-4 text-muted-foreground">{section.title}</h2>
            <nav className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <NavLink key={itemIndex} {...item} />
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div>
        <div className="my-2 border-t border-border -mx-6"></div>
        <nav className="space-y-3">
          {bottomNavItems.map((item, index) => (
            <NavLink key={index} {...item} />
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
