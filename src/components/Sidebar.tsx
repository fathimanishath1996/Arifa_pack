"use client";

import { Globe, LayoutDashboard, SquareKanban } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { type Permission, can } from "@/config/roles";
import { useCrm } from "@/store/crm-store";
import { ProfileMenu } from "@/components/ProfileMenu";

const NAV_ITEMS: { href: string; label: string; icon: typeof Globe; matches: string[]; permission?: Permission }[] = [
  { href: "/", label: "Today", icon: LayoutDashboard, matches: [] },
  { href: "/pipeline", label: "Pipeline", icon: SquareKanban, matches: ["/pipeline", "/leads"] },
  // The CMS: editing the public website. Manager and MD only.
  { href: "/website", label: "Website Panel", icon: Globe, matches: ["/website"], permission: "EDIT_WEBSITE" },
];

function NavLinks({ activePath }: { activePath: string | null }) {
  const { role } = useCrm();
  return (
    <nav className="flex gap-1 md:flex-col">
      {NAV_ITEMS.filter((item) => !item.permission || can(role, item.permission)).map((item) => {
        const isActive = activePath === item.href || (activePath !== null && item.matches.some((path) => activePath.startsWith(path)));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`press flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium ${isActive ? "bg-black text-white shadow-md" : "text-neutral-500 hover:bg-neutral-100 hover:text-black"}`}
          >
            <item.icon className="size-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveNavLinks() {
  return <NavLinks activePath={usePathname()} />;
}

export function Sidebar() {
  return (
    <aside className="panel relative z-50 flex items-center justify-between gap-3 px-3 py-2.5 md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:w-56 md:shrink-0 md:flex-col md:items-stretch md:justify-start md:p-4 md:pt-6">
      <Link href="/" className="group flex items-center gap-2.5 md:px-3">
        <span className="grid size-8 place-items-center rounded-full bg-black text-sm font-bold text-white transition-transform duration-300 group-hover:rotate-[360deg]">A</span>
        <span className="hidden text-base font-semibold tracking-tight sm:inline">Arifaa</span>
      </Link>
      <div className="md:mt-12 md:flex-1">
        {/* Lead pages are created at runtime, so reading the URL waits inside Suspense. */}
        <Suspense fallback={<NavLinks activePath={null} />}>
          <ActiveNavLinks />
        </Suspense>
      </div>
      <ProfileMenu />
    </aside>
  );
}
