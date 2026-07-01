'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RiskBadge } from '@/components/personnel/risk-badge'
import Link from 'next/link'
import { Search, Filter, Users, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { getRiskTextColor } from '@/lib/utils/risk-colors'

interface PersonnelListTableProps {
  personnel: any[]
}

const RISK_DRIVERS: Record<string, string> = {
  retirement: 'เสี่ยงเกษียณอายุ',
  transfer: 'เสี่ยงโยกย้าย',
  talent_loss: 'เสี่ยงทาเลนท์',
  burnout: 'เสี่ยงเหนื่อยล้า (Burnout)',
  mixed: 'ความเสี่ยงผสม',
  none: 'ปกติ',
}

function getPrimaryDriver(p: any): string {
  const rr = p.retirement_risk || 0
  const tr = p.transfer_risk || 0
  const tl = p.talent_loss_risk || 0
  const br = p.burnout_risk || 0

  if (rr >= 75) return 'retirement'
  if (tl >= 75) return 'talent_loss'
  if (br >= 70) return 'burnout'
  if (tr >= 75) return 'transfer'
  if (p.overall_risk_score >= 25) return 'mixed'
  return 'none'
}

export function PersonnelListTable({ personnel }: PersonnelListTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrg, setSelectedOrg] = useState('')
  const [selectedRisk, setSelectedRisk] = useState('')

  // 1. Unique organizations from personnel data for filter dropdown
  const organizations = useMemo(() => {
    const orgsMap = new Map()
    personnel.forEach(p => {
      if (p.organization_id && p.organization_name) {
        orgsMap.set(p.organization_id, p.organization_name)
      }
    })
    return Array.from(orgsMap.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'th'))
  }, [personnel])

  // 2. Risk stats for top cards
  const stats = useMemo(() => {
    return {
      total: personnel.length,
      critical: personnel.filter(p => p.risk_level === 'critical').length,
      high: personnel.filter(p => p.risk_level === 'red').length,
      amber: personnel.filter(p => p.risk_level === 'amber').length,
      green: personnel.filter(p => p.risk_level === 'green').length,
    }
  }, [personnel])

  // 3. Filter personnel based on inputs
  const filteredPersonnel = useMemo(() => {
    return personnel.filter(p => {
      const matchesSearch = 
        p.full_name_th?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.employee_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.position_name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesOrg = !selectedOrg || p.organization_id === selectedOrg
      const matchesRisk = !selectedRisk || p.risk_level === selectedRisk

      return matchesSearch && matchesOrg && matchesRisk
    })
  }, [personnel, searchTerm, selectedOrg, selectedRisk])

  return (
    <div className="space-y-6">
      {/* Risk Analysis Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">บุคลากรทั้งหมด</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow border-red-500/20 bg-red-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">ระดับวิกฤต (Critical)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow border-destructive/20 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{stats.high}</p>
              <p className="text-xs text-muted-foreground">ระดับเสี่ยงสูง (High)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.amber}</p>
              <p className="text-xs text-muted-foreground">ระดับเฝ้าระวัง (Amber)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow border-green-500/20 bg-green-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.green}</p>
              <p className="text-xs text-muted-foreground">ระดับปกติ (Green)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัสพนักงาน, ตำแหน่ง..."
                className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Division dropdown */}
            <div className="relative">
              <select
                className="w-full px-3 py-2 border rounded-md text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none"
                value={selectedOrg}
                onChange={e => setSelectedOrg(e.target.value)}
              >
                <option value="">กอง/กลุ่มงานทั้งหมด</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            {/* Risk dropdown */}
            <div className="relative">
              <select
                className="w-full px-3 py-2 border rounded-md text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none"
                value={selectedRisk}
                onChange={e => setSelectedRisk(e.target.value)}
              >
                <option value="">ระดับความเสี่ยงทั้งหมด</option>
                <option value="critical">วิกฤต (Critical)</option>
                <option value="red">เสี่ยงสูง (High)</option>
                <option value="amber">เฝ้าระวัง (Amber)</option>
                <option value="green">ปกติ (Green)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personnel Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">รหัสพนักงาน</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">ชื่อ-นามสกุล</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">หน่วยงาน</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">ตำแหน่ง / ระดับ</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">ปัจจัยเสี่ยงหลัก</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">คะแนนเสี่ยง</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">ระดับความเสี่ยง</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonnel.map(p => {
                  const driver = getPrimaryDriver(p)
                  return (
                    <tr key={p.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{p.employee_number || '—'}</td>
                      <td className="py-3 px-4 font-medium">
                        <Link href={`/personnel/${p.id}`} className="hover:underline text-foreground">
                          {p.full_name_th}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{p.organization_name}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <div>{p.position_name || '—'}</div>
                        <div className="text-xs opacity-80">{p.position_level || '—'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            driver === 'retirement' && 'border-red-500 text-red-700 bg-red-50',
                            driver === 'transfer' && 'border-amber-500 text-amber-700 bg-amber-50',
                            driver === 'talent_loss' && 'border-purple-500 text-purple-700 bg-purple-50',
                            driver === 'burnout' && 'border-orange-500 text-orange-700 bg-orange-50',
                            driver === 'mixed' && 'border-blue-500 text-blue-700 bg-blue-50',
                            driver === 'none' && 'border-green-500 text-green-700 bg-green-50'
                          )}
                        >
                          {RISK_DRIVERS[driver]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={cn('font-bold tabular-nums', getRiskTextColor(p.overall_risk_score ?? 0))}>
                          {p.overall_risk_score?.toFixed(0) || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <RiskBadge level={p.risk_level} score={p.overall_risk_score} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredPersonnel.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>ไม่พบข้อมูลบุคลากรที่ตรงกับตัวกรอง</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
