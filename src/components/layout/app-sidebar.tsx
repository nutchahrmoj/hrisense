'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, AlertTriangle, BarChart3,
  Users, Bell, Settings, Shield, Target, BookOpen, Building2, X
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/dashboard', label: 'แดชบอร์ดหลัก', icon: LayoutDashboard },
  { href: '/dashboard/retirement', label: 'พยากรณ์เกษียณ', icon: CalendarDays },
  { href: '/dashboard/risk', label: 'วิเคราะห์ความเสี่ยง', icon: AlertTriangle },
  { href: '/dashboard/vacancy', label: 'วิเคราะห์อัตรากำลัง', icon: BarChart3 },
  { href: '/dashboard/succession', label: 'แผนสืบทอดตำแหน่ง', icon: Target },
  { href: '/dashboard/idp', label: 'แผนพัฒนารายบุคคล', icon: BookOpen },
  { href: '/organizations', label: 'หน่วยงาน', icon: Building2 },
  { href: '/personnel', label: 'ข้อมูลบุคลากร', icon: Users },
  { href: '/alerts', label: 'การแจ้งเตือน', icon: Bell },
  { href: '/settings', label: 'ตั้งค่า', icon: Settings },
]

interface AppSidebarProps {
  open?: boolean
  onClose?: () => void
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn(
      "w-64 bg-card border-r flex flex-col shrink-0 z-50 transition-transform duration-200",
      "fixed inset-y-0 left-0 lg:static lg:translate-x-0",
      open ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Logo */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg leading-tight">HRiSENSE</h1>
            <p className="text-xs text-muted-foreground">สำนักงานปลัดกระทรวงยุติธรรม</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="ปิดเมนูนำทาง"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t text-xs text-muted-foreground text-center">
        HRiSENSE v0.2.0
      </div>
    </aside>
  )
}
