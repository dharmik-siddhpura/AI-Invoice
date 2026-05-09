"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: "▦" },
  { href: "/invoices", label: "Invoices", icon: "◧" },
  { href: "/clients", label: "Clients", icon: "◉" },
  { href: "/settings", label: "Settings", icon: "◈" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-60 min-h-screen bg-slate-900 flex flex-col">
      <div className="px-6 py-6 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-indigo-400 text-2xl font-bold">⚡</span>
          <span className="text-white text-lg font-bold tracking-tight">InvoiceAI</span>
        </div>
        <p className="text-slate-400 text-xs mt-1">AI-Powered Invoicing</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = path === item.href || (item.href !== "/" && path.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs">Built with AI ⚡</p>
      </div>
    </aside>
  );
}
