"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, ArrowLeftRight, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/shift/new", label: "Catat Shift", icon: PlusCircle },
    { href: "/transactions", label: "Saldo & COD", icon: ArrowLeftRight },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-background/50 h-screen sticky top-0 p-4">
      <div className="flex items-center space-x-2 mb-8 px-2 mt-4">
        <div className="bg-[#EE4D2D] p-1.5 rounded-lg">
          <Navigation className="text-white h-5 w-5" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-100">Driver<span className="text-[#EE4D2D]">Finance</span></span>
      </div>
      <nav className="flex flex-col space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group",
                isActive 
                  ? "bg-[#EE4D2D]/10 text-[#EE4D2D] font-medium" 
                  : "text-muted-foreground hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive ? "text-[#EE4D2D]" : "text-muted-foreground group-hover:text-slate-200")} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto px-2 mb-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#EE4D2D]/20 to-orange-500/10 border border-[#EE4D2D]/20 text-center">
          <p className="text-xs font-semibold text-orange-200 mb-1">V3.0 Pro</p>
          <p className="text-[10px] text-orange-200/70">Terminal Investasi Aktif</p>
        </div>
      </div>
    </aside>
  );
}
