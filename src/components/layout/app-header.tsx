'use client'
import { Bell, Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AppHeaderProps {
  onMenuClick?: () => void
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const [alertCount, setAlertCount] = useState(0)
  const [userName, setUserName] = useState('ผู้ดูแลระบบ')
  const router = useRouter()

  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase
      .from('v_active_alerts')
      .select('id')
      .then((res: any) => {
        if (active && res?.data) setAlertCount(res.data.length)
      })
    return () => {
      active = false
    }
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="เปิดเมนูนำทาง"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-muted-foreground">ระบบพยากรณ์และบริหารความเสี่ยงด้านกำลังคน</span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/alerts"
          className="relative p-2 rounded-lg hover:bg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`การแจ้งเตือน${alertCount > 0 ? ` (${alertCount} รายการ)` : ''}`}
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {alertCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium"
              aria-hidden="true"
            >
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2 pl-3 border-l">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center" aria-hidden="true">
            <span className="text-sm font-medium text-primary">A</span>
          </div>
          <span className="text-sm text-foreground hidden sm:inline">{userName}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-muted-foreground hover:text-destructive ml-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </header>
  )
}
