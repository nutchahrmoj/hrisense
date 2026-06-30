'use client'

import { useState } from 'react'
import { AppSidebar } from './app-sidebar'
import { AppHeader } from './app-header'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar with mobile drawer state support */}
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with hamburger click trigger */}
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />

        <main id="main-content" className="flex-1 overflow-y-auto p-6 focus:outline-none" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
