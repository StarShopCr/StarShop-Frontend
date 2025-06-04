"use client";
import { usePathname } from "next/navigation";
import { ClientSidebar } from "./client-sidebar";

const sidebarRoutes = [
  "/dashboard",
  "/profile",
  "/analytics",
  "/products",
  "/transactions",
  "/invoices",
  "/billing",
  "/chat",
  "/supportTickets",
  "/faq",
  "/settings",
  "/help"
];

export function SidebarConditional() {
  const pathname = usePathname();
  const showSidebar = sidebarRoutes.includes(pathname);
  if (!showSidebar) return null;
  return <ClientSidebar />;
} 