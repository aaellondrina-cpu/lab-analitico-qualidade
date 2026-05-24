import { Sidebar } from "@/components/Sidebar";
import { QualiHelpButton } from "@/components/QualiHelpButton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-slate-50 print:bg-white">
        <div className="px-8 py-6 print:p-0">{children}</div>
      </main>
      <QualiHelpButton variant="lab" autoOpenKey="quali-tour-lab-v1" />
    </div>
  );
}
