"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  icon: ReactNode;
  collapsed?: boolean;
}

export default function NavLink({ href, children, icon, collapsed }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      title={collapsed ? String(children) : undefined}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
        ${isActive
          ? "bg-brand-50 text-brand-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }
        ${collapsed ? "justify-center px-2" : ""}
      `}
    >
      <span className={`flex-shrink-0 ${isActive ? "text-brand-600" : "text-gray-400 group-hover:text-gray-600"}`}>
        {icon}
      </span>
      {!collapsed && <span className="truncate">{children}</span>}
    </Link>
  );
}
