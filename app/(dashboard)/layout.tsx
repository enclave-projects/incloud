import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import AuthGuard from "@/components/system/AuthGuard";
import { SidebarProvider } from "@/lib/sidebar-context";
import MobileBlock from "@/components/system/MobileBlock";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <MobileBlock />
      <SidebarProvider>
        <div
          className="flex h-screen overflow-hidden mobile-hidden"
          style={{ background: "var(--dash-bg)" }}
        >
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto dash-scroll">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
