import type { Metadata, Viewport } from 'next'
import { Noto_Sans_Thai } from 'next/font/google'
import './globals.css'

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-thai',
  preload: true,
})

export const metadata: Metadata = {
  title: 'HRiSENSE — ระบบพยากรณ์และบริหารความเสี่ยงด้านกำลังคน',
  description: 'Human Resource Intelligence System for Early-risk Notification and Strategic Evaluation — สำนักงานปลัดกระทรวงยุติธรรม',
}

export const viewport: Viewport = {
  themeColor: '#1e3a5f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={notoSansThai.variable}>
      <body className="min-h-screen bg-background font-thai antialiased">
        {children}
      </body>
    </html>
  )
}
