import { DashboardShell } from '@/components/layout/dashboard-shell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-md focus:text-sm focus:font-medium"
      >
        ข้ามไปยังเนื้อหาหลัก
      </a>
      <DashboardShell>{children}</DashboardShell>
    </>
  )
}
