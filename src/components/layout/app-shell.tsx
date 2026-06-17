"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

const subtitles: Record<string, string> = {
  "/": "ระบบสารสนเทศเพื่อการบริหารและวางแผนกำลังคนเชิงรุก",
  "/dashboard": "ภาพรวมข้อมูลกำลังคนและสถานะอัตรากำลัง",
  "/risk": "การวิเคราะห์และพยากรณ์ความเสี่ยงด้านกำลังคน",
  "/personnel": "ข้อมูลกำลังคนและตำแหน่งรายบุคคล",
  "/succession": "แผนสืบทอดตำแหน่งและการพัฒนาผู้สืบทอด",
  "/executive": "รายงานสรุปสำหรับผู้บริหารระดับสูง",
  "/alerts": "การแจ้งเตือนและสถานะความเสี่ยงที่ต้องติดตาม",
  "/settings": "ตั้งค่าระบบและการจัดการผู้ใช้งาน",
};

function getSubtitle(pathname: string) {
  if (pathname.startsWith("/profile")) return "ข้อมูลกำลังคนและตำแหน่งรายบุคคล";
  return subtitles[pathname] ?? "";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden shrink-0 lg:block">
        <AppSidebar />
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-64 shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -right-11 top-3 rounded-lg bg-card p-2 text-foreground shadow"
              aria-label="ปิดเมนู"
            >
              <X className="h-5 w-5" />
            </button>
            <AppSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader onMenuClick={() => setOpen(true)} subtitle={getSubtitle(pathname)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
