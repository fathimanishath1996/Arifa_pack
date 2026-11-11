import { CommandPalette } from "@/components/CommandPalette";
import { GlassBackdrop } from "@/components/GlassBackdrop";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { CrmProvider } from "@/store/crm-store";

/** The CRM screens: glass backdrop, sidebar and top bar around every page (Sales and the Website Panel). */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CrmProvider>
      <GlassBackdrop />
      <div className="crm-shell flex min-h-screen flex-col gap-3 p-3 md:flex-row md:gap-4 md:p-4">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <TopBar />
          <main className="px-1 pb-10 md:px-4">{children}</main>
        </div>
      </div>
      <CommandPalette />
    </CrmProvider>
  );
}
