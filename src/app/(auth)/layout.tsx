export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <main id="main-content" className="w-full max-w-md p-8">{children}</main>
    </div>
  )
}
